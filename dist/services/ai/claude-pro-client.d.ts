import { AIEngine, AIClient, CodeGenerationRequest, CodeGenerationResponse, UsageStats } from './types';
/**
 * Claude Pro 구독자 전용 최적화 클라이언트
 */
export declare class ClaudeProClient implements AIClient {
    readonly engine = AIEngine.CLAUDE_CODE;
    private client;
    private usageStats;
    private requestQueue;
    private isProcessingQueue;
    constructor(apiKey?: string);
    /**
     * 연결 상태 및 구독 상태 검증
     */
    validateConnection(): Promise<boolean>;
    /**
     * Pro 구독 상태 확인
     */
    checkProSubscriptionStatus(): Promise<boolean>;
    /**
     * 코드 생성 (Pro 최적화)
     */
    generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse>;
    /**
     * Pro 사용자 전용 요청 최적화
     */
    private optimizeRequestForPro;
    /**
     * 요청 우선순위 계산
     */
    private calculateRequestPriority;
    /**
     * 요청 큐에 추가
     */
    private addToRequestQueue;
    /**
     * 요청 큐 처리
     */
    private processRequestQueue;
    /**
     * 큐 처리 대기
     */
    private waitForQueueProcessing;
    /**
     * 실제 요청 실행
     */
    private executeRequest;
    /**
     * Pro 전용 시스템 프롬프트 최적화
     */
    private buildOptimizedSystemPrompt;
    /**
     * Pro 전용 사용자 프롬프트 최적화
     */
    private buildOptimizedUserPrompt;
    /**
     * Pro 구독자 할인된 비용 계산
     */
    private calculateProCost;
    /**
     * 코드 추출 (Pro 최적화)
     */
    private extractCode;
    /**
     * 설명 추출 (Pro 최적화)
     */
    private extractExplanation;
    /**
     * 제안사항 추출 (Pro 최적화)
     */
    private extractSuggestions;
    /**
     * 사용량 통계 조회
     */
    getUsageStats(): Promise<UsageStats>;
    /**
     * 사용량 통계 업데이트
     */
    private updateUsageStats;
    /**
     * 요청 ID 생성
     */
    private generateRequestId;
    /**
     * 클라이언트 정보 반환
     */
    getClientInfo(): object;
}
//# sourceMappingURL=claude-pro-client.d.ts.map