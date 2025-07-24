import { AIEngine, AIClient, CodeGenerationRequest, CodeGenerationResponse, UsageStats } from './types';
/**
 * Claude Code 클라이언트 구현
 */
export declare class ClaudeCodeClient implements AIClient {
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
//# sourceMappingURL=claude-code.d.ts.map