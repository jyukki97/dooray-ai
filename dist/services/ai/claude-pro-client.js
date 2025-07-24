"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeProClient = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const types_1 = require("./types");
const logger_1 = require("../../utils/logger");
const env_1 = require("../../config/env");
/**
 * Claude Pro 구독자 전용 최적화 클라이언트
 */
class ClaudeProClient {
    constructor(apiKey) {
        this.engine = types_1.AIEngine.CLAUDE_CODE;
        this.isProcessingQueue = false;
        const key = apiKey || env_1.env.claudeApiKey;
        if (!key) {
            throw new types_1.AIError('Claude API key is required but not provided', 'MISSING_API_KEY', types_1.AIEngine.CLAUDE_CODE);
        }
        // Claude Pro 전용 설정
        this.client = new sdk_1.default({
            apiKey: key,
            timeout: env_1.env.requestTimeout,
            maxRetries: env_1.env.priorityRequests ? 5 : 3, // Pro 사용자는 더 많은 재시도
            defaultHeaders: {
                'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15',
                'x-subscription-tier': env_1.env.claudeProTier
            }
        });
        this.usageStats = {
            totalRequests: 0,
            totalTokens: 0,
            totalCost: 0
        };
        this.requestQueue = [];
        logger_1.logger.info(`Claude Pro client initialized (Tier: ${env_1.env.claudeProTier}, Context: ${env_1.env.maxContextTokens} tokens)`);
    }
    /**
     * 연결 상태 및 구독 상태 검증
     */
    async validateConnection() {
        try {
            logger_1.logger.debug('Validating Claude Pro connection and subscription...');
            // 구독 상태 확인을 위한 테스트 요청
            const testRequest = {
                prompt: 'console.log("Hello, Claude Pro!");',
                language: 'javascript',
                maxTokens: 50
            };
            await this.generateCode(testRequest);
            // Pro 전용 기능 확인
            const isProActive = await this.checkProSubscriptionStatus();
            if (!isProActive) {
                logger_1.logger.warn('Claude Pro subscription may not be active or expired');
            }
            logger_1.logger.info('Claude Pro connection validated successfully');
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error('Claude Pro connection validation failed:', errorMessage);
            return false;
        }
    }
    /**
     * Pro 구독 상태 확인
     */
    async checkProSubscriptionStatus() {
        try {
            // 간단한 요청으로 Pro 기능 확인
            const response = await this.client.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 10,
                messages: [{ role: 'user', content: 'test' }]
            });
            // Pro 구독자는 더 높은 요청 한도와 우선순위 처리를 받음
            const responseHeaders = response;
            const subscriptionTier = responseHeaders.headers?.['x-subscription-tier'];
            return subscriptionTier === 'pro' || subscriptionTier === 'team';
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error('Failed to check Pro subscription status:', errorMessage);
            return false;
        }
    }
    /**
     * 코드 생성 (Pro 최적화)
     */
    async generateCode(request) {
        const startTime = Date.now();
        const requestId = request.metadata?.requestId || this.generateRequestId();
        try {
            logger_1.logger.debug(`Generating code with Claude Pro (Request: ${requestId})`);
            // Pro 사용자 전용 최적화
            const optimizedRequest = this.optimizeRequestForPro(request);
            // 우선순위 큐 처리
            if (env_1.env.priorityRequests) {
                await this.addToRequestQueue({
                    request: optimizedRequest,
                    requestId,
                    startTime,
                    priority: this.calculateRequestPriority(optimizedRequest)
                });
                return await this.processRequestQueue();
            }
            return await this.executeRequest(optimizedRequest, requestId, startTime);
        }
        catch (error) {
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`Code generation failed (Request: ${requestId}, Time: ${responseTime}ms): ${errorMessage}`);
            throw new types_1.AIError(`Claude Pro generation failed: ${errorMessage}`, 'GENERATION_FAILED', types_1.AIEngine.CLAUDE_CODE, requestId);
        }
    }
    /**
     * Pro 사용자 전용 요청 최적화
     */
    optimizeRequestForPro(request) {
        return {
            ...request,
            // Pro 사용자는 더 큰 컨텍스트 윈도우 활용
            maxTokens: Math.min(request.maxTokens || env_1.env.maxTokens, env_1.env.maxContextTokens * 0.8 // 컨텍스트의 80%까지 활용
            ),
            // Pro 사용자는 더 정교한 응답을 위해 낮은 temperature 사용
            temperature: request.temperature || 0.3
        };
    }
    /**
     * 요청 우선순위 계산
     */
    calculateRequestPriority(request) {
        let priority = 5; // 기본 우선순위
        // 짧은 요청은 높은 우선순위
        if ((request.maxTokens || env_1.env.maxTokens) < 500)
            priority += 2;
        // 긴급 키워드가 있으면 높은 우선순위
        if (request.prompt.toLowerCase().includes('urgent') ||
            request.prompt.toLowerCase().includes('emergency')) {
            priority += 3;
        }
        return priority;
    }
    /**
     * 요청 큐에 추가
     */
    async addToRequestQueue(item) {
        this.requestQueue.push(item);
        this.requestQueue.sort((a, b) => b.priority - a.priority); // 높은 우선순위부터
    }
    /**
     * 요청 큐 처리
     */
    async processRequestQueue() {
        if (this.isProcessingQueue) {
            // 다른 요청이 처리 중이면 대기
            await this.waitForQueueProcessing();
        }
        this.isProcessingQueue = true;
        try {
            const item = this.requestQueue.shift();
            if (!item) {
                throw new types_1.AIError('No request in queue', 'QUEUE_EMPTY', types_1.AIEngine.CLAUDE_CODE);
            }
            return await this.executeRequest(item.request, item.requestId, item.startTime);
        }
        finally {
            this.isProcessingQueue = false;
        }
    }
    /**
     * 큐 처리 대기
     */
    async waitForQueueProcessing() {
        return new Promise((resolve) => {
            const checkQueue = () => {
                if (!this.isProcessingQueue) {
                    resolve();
                }
                else {
                    setTimeout(checkQueue, 10);
                }
            };
            checkQueue();
        });
    }
    /**
     * 실제 요청 실행
     */
    async executeRequest(request, requestId, startTime) {
        // 시스템 프롬프트 최적화 (Pro 전용)
        const systemPrompt = this.buildOptimizedSystemPrompt(request);
        const userPrompt = this.buildOptimizedUserPrompt(request);
        // Claude Pro API 호출
        const response = await this.client.messages.create({
            model: 'claude-3-5-sonnet-20241022', // 최신 모델 우선 접근
            max_tokens: request.maxTokens || env_1.env.maxTokens,
            temperature: request.temperature || 0.3,
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
        // Pro 사용자 전용 비용 계산 (할인 적용)
        const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
        const estimatedCost = this.calculateProCost(tokensUsed);
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
        logger_1.logger.info(`Code generation completed (Request: ${requestId}, Time: ${responseTime}ms, Tokens: ${tokensUsed}, Pro: ✅)`);
        return result;
    }
    /**
     * Pro 전용 시스템 프롬프트 최적화
     */
    buildOptimizedSystemPrompt(request) {
        let prompt = 'You are a highly skilled coding assistant with access to the latest programming knowledge and best practices.';
        if (request.context) {
            prompt += ` Context: ${request.context}`;
        }
        // Pro 사용자에게는 더 상세한 지침 제공
        prompt += ' Provide detailed, production-ready code with comprehensive comments and error handling.';
        return prompt;
    }
    /**
     * Pro 전용 사용자 프롬프트 최적화
     */
    buildOptimizedUserPrompt(request) {
        let prompt = request.prompt;
        if (request.language) {
            prompt = `Generate ${request.language} code for the following requirement:\n\n${prompt}`;
        }
        // Pro 사용자에게는 추가 지침 제공
        prompt += '\n\nPlease include:\n';
        prompt += '- Comprehensive error handling\n';
        prompt += '- Performance optimizations\n';
        prompt += '- Security best practices\n';
        prompt += '- Detailed comments explaining the logic\n';
        return prompt;
    }
    /**
     * Pro 구독자 할인된 비용 계산
     */
    calculateProCost(tokens) {
        // Pro 구독자는 20% 할인 적용
        const standardCost = (3 + 15) / 2 / 1000000; // 표준 비용
        const proDiscount = 0.8; // 20% 할인
        return tokens * standardCost * proDiscount;
    }
    /**
     * 코드 추출 (Pro 최적화)
     */
    extractCode(text) {
        // 여러 코드 블록 패턴 지원
        const patterns = [
            /```[\w]*\n([\s\S]*?)\n```/g,
            /`([^`]+)`/g
        ];
        for (const pattern of patterns) {
            const matches = Array.from(text.matchAll(pattern));
            if (matches.length > 0) {
                return matches.map(match => match[1]).join('\n\n').trim();
            }
        }
        return text.trim();
    }
    /**
     * 설명 추출 (Pro 최적화)
     */
    extractExplanation(text) {
        // 코드 블록을 제거한 후 설명 추출
        const withoutCode = text.replace(/```[\w]*\n[\s\S]*?\n```/g, '[CODE_BLOCK]');
        const lines = withoutCode.split('\n').filter(line => line.trim() &&
            !line.includes('[CODE_BLOCK]') &&
            !line.trim().startsWith('`'));
        return lines.join('\n').trim();
    }
    /**
     * 제안사항 추출 (Pro 최적화)
     */
    extractSuggestions(text) {
        const suggestions = [];
        const lines = text.split('\n');
        let inSuggestionSection = false;
        for (const line of lines) {
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes('suggestion') ||
                lowerLine.includes('improvement') ||
                lowerLine.includes('optimization') ||
                lowerLine.includes('recommendation')) {
                inSuggestionSection = true;
                continue;
            }
            if (inSuggestionSection && (line.trim().startsWith('-') || line.trim().startsWith('•'))) {
                suggestions.push(line.trim().substring(1).trim());
            }
        }
        return suggestions;
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
        return `claude-pro-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * 클라이언트 정보 반환
     */
    getClientInfo() {
        return {
            engine: this.engine,
            tier: 'pro',
            configured: !!env_1.env.claudeApiKey,
            proEnabled: env_1.env.claudeProEnabled,
            maxContextTokens: env_1.env.maxContextTokens,
            priorityRequests: env_1.env.priorityRequests,
            usageStats: this.usageStats
        };
    }
}
exports.ClaudeProClient = ClaudeProClient;
//# sourceMappingURL=claude-pro-client.js.map