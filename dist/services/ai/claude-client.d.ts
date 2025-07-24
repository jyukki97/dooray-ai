import { AIEngine, AIClient, CodeGenerationRequest, CodeGenerationResponse, UsageStats } from './types';
/**
 * Claude API 클라이언트 구현
 */
export declare class ClaudeClient implements AIClient {
    readonly engine = AIEngine.CLAUDE_CODE;
    private client;
    private usageStats;
    constructor(apiKey?: string);
    /**
     * 연결 상태 검증
     */
    validateConnection(): Promise<boolean>;
    /**
     * 코드 생성
     */
    generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse>;
    /**
     * 사용량 통계 조회
     */
    getUsageStats(): Promise<UsageStats>;
    /**
     * 토큰 사용량 기반 비용 계산 (Claude 3.5 Sonnet 기준)
     */
    private calculateCost;
    /**
     * 응답에서 코드 부분 추출
     */
    private extractCode;
    /**
     * 응답에서 설명 부분 추출
     */
    private extractExplanation;
    /**
     * 응답에서 제안사항 추출
     */
    private extractSuggestions;
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
//# sourceMappingURL=claude-client.d.ts.map