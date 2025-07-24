import Anthropic from '@anthropic-ai/sdk';
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
import { env } from '../../config/env';

/**
 * Claude API 클라이언트 구현
 */
export class ClaudeClient implements AIClient {
  public readonly engine = AIEngine.CLAUDE_CODE;
  private client: Anthropic;
  private usageStats: UsageStats;

  constructor(apiKey?: string) {
    const key = apiKey || env.claudeApiKey;
    
    if (!key) {
      throw new AIError(
        'Claude API key is required but not provided',
        'MISSING_API_KEY',
        AIEngine.CLAUDE_CODE
      );
    }

    this.client = new Anthropic({
      apiKey: key,
      timeout: env.requestTimeout
    });

    this.usageStats = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0
    };

    logger.info('Claude SDK client initialized');
  }

  /**
   * 연결 상태 검증
   */
  async validateConnection(): Promise<boolean> {
    try {
      logger.debug('Validating Claude API connection...');
      
      // 간단한 테스트 요청
      const testRequest: CodeGenerationRequest = {
        prompt: 'console.log("Hello, World!");',
        language: 'javascript',
        maxTokens: 50
      };

      await this.generateCode(testRequest);
      logger.info('Claude API connection validated successfully');
      return true;
      
         } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Unknown error';
       logger.error('Claude API connection validation failed:', errorMessage);
       return false;
     }
  }

  /**
   * 코드 생성
   */
  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
    const startTime = Date.now();
    const requestId = request.metadata?.requestId || this.generateRequestId();
    
    try {
      logger.debug(`Generating code with Claude API (Request: ${requestId})`);
      
      // 시스템 프롬프트 구성
      const systemPrompt = request.context 
        ? `You are a helpful coding assistant. Context: ${request.context}`
        : 'You are a helpful coding assistant that generates clean, efficient code.';
         
      // 사용자 프롬프트 구성
      const userPrompt = request.language 
        ? `Generate ${request.language} code for the following requirement:\n\n${request.prompt}`
        : request.prompt;

      // Claude API 호출
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: request.maxTokens || env.maxTokens,
        temperature: request.temperature || 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // 응답에서 텍스트 추출
      const content = response.content?.[0];
      let generatedText = '';
      
      if (content && content.type === 'text') {
        generatedText = content.text;
      }
      
      // 토큰 사용량 및 비용 계산
      const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
      const estimatedCost = this.calculateCost(tokensUsed);

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
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new AIError(
        `Claude API generation failed: ${errorMessage}`,
        'GENERATION_FAILED',
        AIEngine.CLAUDE_CODE,
        requestId
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
   * 토큰 사용량 기반 비용 계산 (Claude 3.5 Sonnet 기준)
   */
  private calculateCost(tokens: number): number {
    // Claude 3.5 Sonnet 가격: $3/1M input tokens, $15/1M output tokens
    // 대략적 계산 (input:output = 1:1 비율 가정)
    const avgCostPerToken = (3 + 15) / 2 / 1000000; // $9/1M tokens 평균
    return tokens * avgCostPerToken;
  }

  /**
   * 응답에서 코드 부분 추출
   */
  private extractCode(text: string): string {
    // 코드 블록 패턴 매칭
    const codeBlockMatch = text.match(/```[\w]*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }
    
    // 인라인 코드 패턴 매칭
    const inlineCodeMatch = text.match(/`([^`]+)`/);
    if (inlineCodeMatch) {
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
    if (parts.length > 1) {
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
    
    // "suggestions", "improvements", "notes" 등의 키워드로 시작하는 라인 찾기
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
    return `claude-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 클라이언트 정보 반환
   */
  getClientInfo(): object {
    return {
      engine: this.engine,
      configured: !!env.claudeApiKey,
      usageStats: this.usageStats
    };
  }
} 