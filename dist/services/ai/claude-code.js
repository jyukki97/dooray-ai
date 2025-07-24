"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeCodeClient = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const types_1 = require("./types");
const logger_1 = require("../../utils/logger");
const env_1 = require("../../config/env");
/**
 * Claude Code 클라이언트 구현
 */
class ClaudeCodeClient {
    constructor(apiKey) {
        this.engine = types_1.AIEngine.CLAUDE_CODE;
        const key = apiKey || env_1.env.claudeApiKey;
        if (!key) {
            throw new types_1.AIError('Claude API key is required but not provided', 'MISSING_API_KEY', types_1.AIEngine.CLAUDE_CODE);
        }
        this.client = new sdk_1.default({
            apiKey: key,
            timeout: env_1.env.requestTimeout
        });
        this.usageStats = {
            totalRequests: 0,
            totalTokens: 0,
            totalCost: 0
        };
        logger_1.logger.info('Claude SDK client initialized');
    }
    /**
     * 연결 상태 검증
     */
    async validateConnection() {
        try {
            logger_1.logger.debug('Validating Claude Code connection...');
            // 간단한 테스트 요청
            const testRequest = {
                prompt: 'console.log("Hello, World!");',
                language: 'javascript',
                maxTokens: 50
            };
            await this.generateCode(testRequest);
            logger_1.logger.info('Claude Code connection validated successfully');
            return true;
        }
        catch (error) {
            logger_1.logger.error('Claude Code connection validation failed:', error);
            return false;
        }
    }
    /**
     * 코드 생성
     */
    async generateCode(request) {
        const startTime = Date.now();
        const requestId = request.metadata?.requestId || this.generateRequestId();
        try {
            logger_1.logger.debug(`Generating code with Claude Code (Request: ${requestId})`);
            // Claude API 호출
            const systemPrompt = request.context
                ? `You are a helpful coding assistant. Context: ${request.context}`
                : 'You are a helpful coding assistant that generates clean, efficient code.';
            const userPrompt = request.language
                ? `Generate ${request.language} code for the following requirement:\n\n${request.prompt}`
                : request.prompt;
            const response = await this.client.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: request.maxTokens || env_1.env.maxTokens,
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
            // 응답에서 코드 추출
            const content = response.content[0];
            const generatedText = content.type === 'text' ? content.text : '';
            // 토큰 사용량 및 비용 계산 (대략적)
            const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
            const estimatedCost = this.calculateCost(tokensUsed);
            // 사용량 통계 업데이트
            this.updateUsageStats(tokensUsed, estimatedCost);
            const metadata = {
                requestId,
                timestamp: new Date(),
                engine: types_1.AIEngine.CLAUDE_CODE,
                responseTime,
                tokensUsed: response.tokensUsed,
                cost: response.cost
            };
            const result = {
                code: response.code,
                explanation: response.explanation,
                suggestions: response.suggestions,
                metadata
            };
            logger_1.logger.info(`Code generation completed (Request: ${requestId}, Time: ${responseTime}ms)`);
            return result;
        }
        catch (error) {
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            logger_1.logger.error(`Code generation failed (Request: ${requestId}, Time: ${responseTime}ms):`, error);
            throw new types_1.AIError(`Claude Code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GENERATION_FAILED', types_1.AIEngine.CLAUDE_CODE, requestId);
        }
    }
    /**
     * 사용량 통계 조회
     */
    async getUsageStats() {
        return { ...this.usageStats };
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
        return `claude-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * 클라이언트 정보 반환
     */
    getClientInfo() {
        return {
            engine: this.engine,
            configured: !!env_1.env.claudeApiKey,
            usageStats: this.usageStats
        };
    }
}
exports.ClaudeCodeClient = ClaudeCodeClient;
//# sourceMappingURL=claude-code.js.map