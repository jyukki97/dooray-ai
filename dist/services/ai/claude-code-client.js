"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeCodeClient = void 0;
const types_1 = require("./types");
const logger_1 = require("../../utils/logger");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Claude Code 클라이언트 구현 (API 키 불필요)
 * Claude Code CLI를 통해 직접 통신
 */
class ClaudeCodeClient {
    constructor() {
        this.engine = types_1.AIEngine.CLAUDE_CODE;
        this.usageStats = {
            totalRequests: 0,
            totalTokens: 0,
            totalCost: 0
        };
        // 임시 디렉토리 설정
        this.tempDir = path.join(os.tmpdir(), 'dooray-ai-claude-code');
        fs.ensureDirSync(this.tempDir);
        logger_1.logger.info('Claude Code client initialized (no API key required)');
    }
    /**
     * Claude Code CLI 가용성 확인
     */
    async validateConnection() {
        try {
            logger_1.logger.debug('Validating Claude Code CLI availability...');
            // Claude Code CLI가 설치되어 있는지 확인
            await execAsync('claude --version');
            logger_1.logger.info('Claude Code CLI connection validated successfully');
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error('Claude Code CLI validation failed:', errorMessage);
            logger_1.logger.info('Please install Claude Code CLI: https://claude.ai/cli');
            return false;
        }
    }
    /**
     * Claude Code를 통한 코드 생성
     */
    async generateCode(request) {
        const startTime = Date.now();
        const requestId = request.metadata?.requestId || this.generateRequestId();
        try {
            logger_1.logger.debug(`Generating code with Claude Code CLI (Request: ${requestId})`);
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
            logger_1.logger.debug(`Executing: ${command}`);
            const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
            if (stderr) {
                logger_1.logger.warn(`Claude Code CLI stderr: ${stderr}`);
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
            const metadata = {
                requestId,
                timestamp: new Date(),
                engine: types_1.AIEngine.CLAUDE_CODE,
                responseTime,
                tokensUsed,
                cost: estimatedCost
            };
            const result = {
                code: this.extractCode(generatedText),
                explanation: this.extractExplanation(generatedText),
                suggestions: this.extractSuggestions(generatedText),
                metadata
            };
            logger_1.logger.info(`Code generation completed (Request: ${requestId}, Time: ${responseTime}ms, Tokens: ${tokensUsed})`);
            return result;
        }
        catch (error) {
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`Code generation failed (Request: ${requestId}, Time: ${responseTime}ms): ${errorMessage}`);
            throw new types_1.AIError(`Claude Code CLI generation failed: ${errorMessage}`, 'GENERATION_FAILED', types_1.AIEngine.CLAUDE_CODE, requestId);
        }
    }
    /**
     * 대화형 Claude Code 세션 시작
     */
    async startInteractiveSession(prompt) {
        try {
            logger_1.logger.debug('Starting interactive Claude Code session...');
            // Claude Code 대화형 모드 실행
            const command = `echo "${prompt}" | claude --interactive`;
            const { stdout } = await execAsync(command);
            return stdout.trim();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`Interactive session failed: ${errorMessage}`);
            throw new types_1.AIError(`Claude Code interactive session failed: ${errorMessage}`, 'INTERACTIVE_FAILED', types_1.AIEngine.CLAUDE_CODE);
        }
    }
    /**
     * 파일 기반 코드 분석
     */
    async analyzeCodeFile(filePath, analysisPrompt) {
        try {
            logger_1.logger.debug(`Analyzing code file: ${filePath}`);
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`Code file analysis failed: ${errorMessage}`);
            throw new types_1.AIError(`Code file analysis failed: ${errorMessage}`, 'ANALYSIS_FAILED', types_1.AIEngine.CLAUDE_CODE);
        }
    }
    /**
     * 사용량 통계 조회
     */
    async getUsageStats() {
        return { ...this.usageStats };
    }
    /**
     * 임시 파일 정리
     */
    async cleanupTempFiles(files) {
        for (const file of files) {
            try {
                if (await fs.pathExists(file)) {
                    await fs.remove(file);
                }
            }
            catch (error) {
                logger_1.logger.warn(`Failed to cleanup temp file: ${file}`);
            }
        }
    }
    /**
     * 파일 확장자로부터 언어 감지
     */
    detectLanguageFromFile(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const languageMap = {
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
    extractCode(text) {
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
    extractExplanation(text) {
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
    extractSuggestions(text) {
        const suggestions = [];
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
    updateUsageStats(tokens, cost) {
        this.usageStats.totalRequests += 1;
        this.usageStats.totalTokens += tokens;
        this.usageStats.totalCost += cost;
        this.usageStats.lastRequestTime = new Date();
    }
    /**
     * 요청 ID 생성
     */
    generateRequestId() {
        return `claude-code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * 클라이언트 정보 반환
     */
    getClientInfo() {
        return {
            engine: this.engine,
            configured: true, // API 키가 필요없으므로 항상 true
            apiKeyRequired: false,
            cliRequired: true,
            usageStats: this.usageStats
        };
    }
}
exports.ClaudeCodeClient = ClaudeCodeClient;
//# sourceMappingURL=claude-code-client.js.map