/**
 * AI 서비스 모듈 인덱스 (Claude Code 전용)
 */
export * from './types';
export { ClaudeCodeClient } from './claude-code-client';
export { codeGenerator } from './code-generator';
export { engineSelector } from './engine-selector';
export { fallbackHandler } from './fallback-handler';
import { AIEngine, AIClient, AIConfig } from './types';
/**
 * AI 클라이언트 팩토리 (Claude Code 전용)
 */
export declare class AIClientFactory {
    /**
     * Claude Code 클라이언트 생성
     */
    static createClient(config?: Partial<AIConfig>): AIClient;
    /**
     * 기본 클라이언트 생성 (엔진 선택기 사용)
     */
    static createDefaultClient(): Promise<AIClient>;
    /**
     * 사용 가능한 AI 엔진 목록 반환
     */
    static getAvailableEngines(): AIEngine[];
    /**
     * Claude Code CLI 연결 상태 확인
     */
    static validateConnection(): Promise<boolean>;
}
export declare function getDefaultAIClient(): Promise<AIClient>;
/**
 * 기본 클라이언트 재설정
 */
export declare function resetDefaultAIClient(): void;
//# sourceMappingURL=index.d.ts.map