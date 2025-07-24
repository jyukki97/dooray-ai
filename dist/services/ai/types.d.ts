/**
 * AI 서비스 공통 타입 정의
 */
export declare enum AIEngine {
    CLAUDE_CODE = "claude-code",
    OPENAI = "openai",
    ANTHROPIC = "anthropic"
}
export interface AIRequestMetadata {
    requestId: string;
    timestamp: Date;
    engine: AIEngine;
    userId?: string;
    sessionId?: string;
}
export interface AIResponseMetadata {
    requestId: string;
    timestamp: Date;
    engine: AIEngine;
    responseTime: number;
    tokensUsed?: number;
    cost?: number;
}
export interface CodeGenerationRequest {
    prompt: string;
    language?: string;
    context?: string;
    maxTokens?: number;
    temperature?: number;
    metadata?: AIRequestMetadata;
}
export interface CodeGenerationResponse {
    code: string;
    explanation?: string;
    suggestions?: string[];
    metadata: AIResponseMetadata;
}
export interface AIClient {
    engine: AIEngine;
    validateConnection(): Promise<boolean>;
    generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse>;
    getUsageStats(): Promise<UsageStats>;
}
export interface UsageStats {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    lastRequestTime?: Date;
}
export interface AIConfig {
    engine: AIEngine;
    apiKey: string;
    maxTokens?: number;
    temperature?: number;
    timeout?: number;
    retryAttempts?: number;
}
export declare class AIError extends Error {
    readonly code: string;
    readonly engine: AIEngine;
    readonly requestId?: string | undefined;
    constructor(message: string, code: string, engine: AIEngine, requestId?: string | undefined);
}
//# sourceMappingURL=types.d.ts.map