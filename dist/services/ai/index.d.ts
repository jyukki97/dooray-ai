/**
 * AI 서비스 모듈 인덱스
 */
export * from './types';
export { ClaudeClient } from './claude-client';
import { AIEngine, AIClient, AIConfig } from './types';
/**
 * AI 클라이언트 팩토리
 */
export declare class AIClientFactory {
    /**
     * 설정에 따라 적절한 AI 클라이언트 생성
     */
    static createClient(config?: Partial<AIConfig>): AIClient;
    /**
     * 기본 클라이언트 생성 (설정에서 기본 엔진 사용)
     */
    static createDefaultClient(): AIClient;
    /**
     * 사용 가능한 AI 엔진 목록 반환
     */
    static getAvailableEngines(): AIEngine[];
    /**
     * 모든 설정된 클라이언트의 연결 상태 확인
     */
    static validateAllConnections(): Promise<Record<string, boolean>>;
}
export declare function getDefaultAIClient(): AIClient;
/**
 * 기본 클라이언트 재설정
 */
export declare function resetDefaultAIClient(): void;
//# sourceMappingURL=index.d.ts.map