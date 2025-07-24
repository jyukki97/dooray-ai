import { 
  AIEngine, 
  AIClient, 
  CodeGenerationRequest, 
  CodeGenerationResponse, 
  UsageStats, 
  AIError,
  AIResponseMetadata
} from './types';
import { logger } from '../../utils/logger';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

/**
 * Claude Code 클라이언트 구현 (API 키 불필요)
 * Claude Code CLI를 통해 직접 통신
 */
export class ClaudeCodeClient implements AIClient {
  public readonly engine = AIEngine.CLAUDE_CODE;
  private usageStats: UsageStats;
  private tempDir: string;

  constructor() {
    this.usageStats = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0
    };

    // 임시 디렉토리 설정
    this.tempDir = path.join(os.tmpdir(), 'dooray-ai-claude-code');
    fs.ensureDirSync(this.tempDir);

    logger.info('Claude Code client initialized (no API key required)');
  }

  /**
   * Claude Code CLI 가용성 확인
   */
  async validateConnection(): Promise<boolean> {
    try {
      logger.debug('Validating Claude Code CLI availability...');
      
      // Claude Code CLI가 설치되어 있는지 확인
      await execAsync('claude --version');
      
      logger.info('Claude Code CLI connection validated successfully');
      return true;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Claude Code CLI validation failed:', errorMessage);
      logger.info('Please install Claude Code CLI: https://claude.ai/cli');
      return false;
    }
  }

  /**
   * Claude Code를 통한 코드 생성
   */
  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
    const startTime = Date.now();
    const requestId = request.metadata?.requestId || this.generateRequestId();
    
    try {
      logger.debug(`Generating code with Claude Code CLI (Request: ${requestId})`);
      
      // 임시 파일에 프롬프트 작성
      const promptFile = path.join(this.tempDir, `prompt-${requestId}.txt`);
      const outputFile = path.join(this.tempDir, `output-${requestId}.txt`);
      
      // 프롬프트 구성
      let fullPrompt = '';
      if (request.context) {
        fullPrompt += `Context: ${request.context}\n\n`;
      }
      
      if (request.language) {
        fullPrompt += `Please generate ${request.language} code for the following requirement:\n\n`;
      }
      
      fullPrompt += request.prompt;
      
      // 프롬프트를 파일에 저장
      await fs.writeFile(promptFile, fullPrompt);
      
      // Claude Code CLI 실행 (입력을 stdin으로 전달)
      const command = `echo "${fullPrompt.replace(/"/g, '\\"')}" | claude --print --dangerously-skip-permissions`;
      
      logger.debug(`Executing: ${command}`);
      
      const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
      
      if (stderr) {
        logger.warn(`Claude Code CLI stderr: ${stderr}`);
      }

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // stdout에서 직접 결과 읽기 (--print 모드)
      let generatedText = stdout.trim();
      if (!generatedText) {
        throw new Error('Claude Code CLI did not generate any output');
      }

      // 임시 파일 정리 (promptFile만 정리, outputFile은 더 이상 사용하지 않음)
      await this.cleanupTempFiles([promptFile]);

      // 토큰 사용량 추정 (대략적)
      const tokensUsed = Math.ceil((fullPrompt.length + generatedText.length) / 4);
      const estimatedCost = 0; // Claude Code는 무료

      // 사용량 통계 업데이트
      this.updateUsageStats(tokensUsed, estimatedCost);

      const metadata: AIResponseMetadata = {
        requestId,
        timestamp: new Date(),
        engine: AIEngine.CLAUDE_CODE,
        responseTime,
        tokensUsed,
        cost: estimatedCost
      };

      const result: CodeGenerationResponse = {
        code: this.extractCode(generatedText),
        explanation: this.extractExplanation(generatedText),
        suggestions: this.extractSuggestions(generatedText),
        metadata
      };

      logger.info(`Code generation completed (Request: ${requestId}, Time: ${responseTime}ms, Tokens: ${tokensUsed})`);
      return result;

    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Code generation failed (Request: ${requestId}, Time: ${responseTime}ms): ${errorMessage}`);
      
      throw new AIError(
        `Claude Code CLI generation failed: ${errorMessage}`,
        'GENERATION_FAILED',
        AIEngine.CLAUDE_CODE,
        requestId
      );
    }
  }

  /**
   * 대화형 Claude Code 세션 시작
   */
  async startInteractiveSession(prompt: string): Promise<string> {
    try {
      logger.debug('Starting interactive Claude Code session...');
      
      // Claude Code 대화형 모드 실행
      const command = `echo "${prompt}" | claude --interactive`;
      const { stdout } = await execAsync(command);
      
      return stdout.trim();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Interactive session failed: ${errorMessage}`);
      throw new AIError(
        `Claude Code interactive session failed: ${errorMessage}`,
        'INTERACTIVE_FAILED',
        AIEngine.CLAUDE_CODE
      );
    }
  }

  /**
   * 파일 기반 코드 분석
   */
  async analyzeCodeFile(filePath: string, analysisPrompt?: string): Promise<CodeGenerationResponse> {
    try {
      logger.debug(`Analyzing code file: ${filePath}`);
      
      if (!await fs.pathExists(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const prompt = analysisPrompt || `Please analyze this code and provide suggestions for improvement:\n\n${fileContent}`;
      
      return await this.generateCode({
        prompt,
        language: this.detectLanguageFromFile(filePath),
        context: `File analysis for: ${filePath}`
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Code file analysis failed: ${errorMessage}`);
      throw new AIError(
        `Code file analysis failed: ${errorMessage}`,
        'ANALYSIS_FAILED',
        AIEngine.CLAUDE_CODE
      );
    }
  }

  /**
   * 사용량 통계 조회
   */
  async getUsageStats(): Promise<UsageStats> {
    return { ...this.usageStats };
  }

  /**
   * 임시 파일 정리
   */
  private async cleanupTempFiles(files: string[]): Promise<void> {
    for (const file of files) {
      try {
        if (await fs.pathExists(file)) {
          await fs.remove(file);
        }
      } catch (error) {
        logger.warn(`Failed to cleanup temp file: ${file}`);
      }
    }
  }

  /**
   * 파일 확장자로부터 언어 감지
   */
  private detectLanguageFromFile(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap: { [key: string]: string } = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.cs': 'csharp',
      '.go': 'go',
      '.rs': 'rust',
      '.php': 'php',
      '.rb': 'ruby',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.scala': 'scala',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.json': 'json',
      '.xml': 'xml',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.sql': 'sql',
      '.sh': 'bash',
      '.md': 'markdown'
    };
    
    return languageMap[ext] || 'text';
  }

  /**
   * 응답에서 코드 부분 추출
   */
  private extractCode(text: string): string {
    // 코드 블록 패턴 매칭
    const codeBlockMatch = text.match(/```[\w]*\n([\s\S]*?)\n```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      return codeBlockMatch[1].trim();
    }
    
    // 인라인 코드 패턴 매칭
    const inlineCodeMatch = text.match(/`([^`]+)`/);
    if (inlineCodeMatch && inlineCodeMatch[1]) {
      return inlineCodeMatch[1];
    }
    
    // 코드 블록이 없으면 전체 텍스트 반환
    return text.trim();
  }

  /**
   * 응답에서 설명 부분 추출
   */
  private extractExplanation(text: string): string {
    // 코드 블록 이후의 설명 추출
    const parts = text.split(/```[\w]*\n[\s\S]*?\n```/);
    if (parts.length > 1 && parts[1]) {
      return parts[1].trim();
    }
    
    // 코드 블록 이전의 설명 추출
    if (parts[0] && parts[0].trim()) {
      return parts[0].trim();
    }
    
    return '';
  }

  /**
   * 응답에서 제안사항 추출
   */
  private extractSuggestions(text: string): string[] {
    const suggestions: string[] = [];
    
    const lines = text.split('\n');
    let inSuggestionSection = false;
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('suggestion') || lowerLine.includes('improvement') || lowerLine.includes('note')) {
        inSuggestionSection = true;
        continue;
      }
      
      if (inSuggestionSection && line.trim().startsWith('-')) {
        suggestions.push(line.trim().substring(1).trim());
      }
    }
    
    return suggestions;
  }

  /**
   * 사용량 통계 업데이트
   */
  private updateUsageStats(tokens: number, cost: number): void {
    this.usageStats.totalRequests += 1;
    this.usageStats.totalTokens += tokens;
    this.usageStats.totalCost += cost;
    this.usageStats.lastRequestTime = new Date();
  }

  /**
   * 요청 ID 생성
   */
  private generateRequestId(): string {
    return `claude-code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 클라이언트 정보 반환
   */
  getClientInfo(): object {
    return {
      engine: this.engine,
      configured: true, // API 키가 필요없으므로 항상 true
      apiKeyRequired: false,
      cliRequired: true,
      usageStats: this.usageStats
    };
  }
}