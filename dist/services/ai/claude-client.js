"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeClient = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const types_1 = require("./types");
const logger_1 = require("../../utils/logger");
const env_1 = require("../../config/env");
/**
 * Claude API 클라이언트 구현
 */
class ClaudeClient {
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
            logger_1.logger.debug('Validating Claude API connection...');
            // 간단한 테스트 요청
            const testRequest = {
                prompt: 'console.log("Hello, World!");',
                language: 'javascript',
                maxTokens: 50
            };
            await this.generateCode(testRequest);
            logger_1.logger.info('Claude API connection validated successfully');
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error('Claude API connection validation failed:', errorMessage);
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
            logger_1.logger.debug(`Generating code with Claude API (Request: ${requestId})`);
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
            throw new types_1.AIError(`Claude API generation failed: ${errorMessage}`, 'GENERATION_FAILED', types_1.AIEngine.CLAUDE_CODE, requestId);
        }
    }
    /**
     * 사용량 통계 조회
     */
    async getUsageStats() {
        return { ...this.usageStats };
    }
    /**
     * 토큰 사용량 기반 비용 계산 (Claude 3.5 Sonnet 기준)
     */
    calculateCost(tokens) {
        // Claude 3.5 Sonnet 가격: $3/1M input tokens, $15/1M output tokens
        // 대략적 계산 (input:output = 1:1 비율 가정)
        const avgCostPerToken = (3 + 15) / 2 / 1000000; // $9/1M tokens 평균
        return tokens * avgCostPerToken;
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
exports.ClaudeClient = ClaudeClient;
//# sourceMappingURL=claude-client.js.map