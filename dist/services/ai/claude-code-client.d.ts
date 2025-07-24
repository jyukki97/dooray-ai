import { AIEngine, AIClient, CodeGenerationRequest, CodeGenerationResponse, UsageStats } from './types';
/**
 * Claude Code 클라이언트 구현 (API 키 불필요)
 * Claude Code CLI를 통해 직접 통신
 */
export declare class ClaudeCodeClient implements AIClient {
    readonly engine = AIEngine.CLAUDE_CODE;
    private usageStats;
    private tempDir;
    constructor();
    /**
     * Claude Code CLI 가용성 확인
     */
    validateConnection(): Promise<boolean>;
    /**
     * Claude Code를 통한 코드 생성
     */
    generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse>;
    /**
     * 대화형 Claude Code 세션 시작
     */
    startInteractiveSession(prompt: string): Promise<string>;
    /**
     * 파일 기반 코드 분석
     */
    analyzeCodeFile(filePath: string, analysisPrompt?: string): Promise<CodeGenerationResponse>;
    /**
     * 사용량 통계 조회
     */
    getUsageStats(): Promise<UsageStats>;
    /**
     * 임시 파일 정리
     */
    private cleanupTempFiles;
    /**
     * 파일 확장자로부터 언어 감지
     */
    private detectLanguageFromFile;
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
//# sourceMappingURL=claude-code-client.d.ts.map