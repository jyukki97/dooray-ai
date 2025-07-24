import { AIEngine, CodeGenerationRequest, CodeGenerationResponse } from './types';
/**
 * 폴백 옵션
 */
export interface FallbackOptions {
    maxRetries: number;
    retryDelay: number;
    enableFallback: boolean;
    fallbackEngines: AIEngine[];
    timeoutMs: number;
}
/**
 * 폴백 시도 정보
 */
export interface FallbackAttempt {
    engine: AIEngine;
    attempt: number;
    error?: Error;
    success: boolean;
    responseTime: number;
    timestamp: Date;
}
/**
 * 폴백 핸들러
 */
export declare class FallbackHandler {
    private defaultOptions;
    /**
     * 폴백을 포함한 코드 생성 실행
     */
    executeWithFallback(request: CodeGenerationRequest, options?: Partial<FallbackOptions>): Promise<CodeGenerationResponse>;
    /**
     * 특정 엔진으로만 실행 (폴백 없음)
     */
    executeWithEngine(engine: AIEngine, request: CodeGenerationRequest, options?: Partial<FallbackOptions>): Promise<CodeGenerationResponse>;
    /**
     * 타임아웃을 포함한 실행
     */
    private executeWithTimeout;
    /**
     * 지연 함수
     */
    private delay;
    /**
     * 폴백 통계 조회
     */
    analyzeFallbackAttempts(attempts: FallbackAttempt[]): {
        totalAttempts: number;
        successfulAttempts: number;
        failedAttempts: number;
        averageResponseTime: number;
        engineUsage: Record<string, number>;
        mostReliableEngine: AIEngine | null;
    };
    /**
     * 엔진 건강도 체크
     */
    performHealthCheck(): Promise<Record<AIEngine, boolean>>;
    /**
     * 폴백 리포트 생성
     */
    generateFallbackReport(attempts: FallbackAttempt[]): string;
}
/**
 * 글로벌 폴백 핸들러 인스턴스
 */
export declare const fallbackHandler: FallbackHandler;
//# sourceMappingURL=fallback-handler.d.ts.map