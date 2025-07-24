import { AIEngine, AIClient } from './types';
/**
 * AI 엔진 선택 설정
 */
export interface EngineSelectionConfig {
    preferredEngine: AIEngine;
    fallbackEnabled: boolean;
    autoSelect: boolean;
    selectionCriteria: {
        prioritizeAvailability: boolean;
        prioritizePerformance: boolean;
        prioritizeCost: boolean;
    };
}
/**
 * 엔진 상태 정보
 */
export interface EngineStatus {
    engine: AIEngine;
    available: boolean;
    authenticated: boolean;
    performance: number;
    cost: number;
    lastUsed?: Date;
    errorCount: number;
}
/**
 * AI 엔진 선택기
 */
export declare class EngineSelector {
    private engines;
    private config;
    constructor();
    /**
     * 엔진 상태 초기화
     */
    private initializeEngineStatus;
    /**
     * 설정 로드
     */
    loadConfig(): Promise<void>;
    /**
     * 엔진 상태 업데이트
     */
    updateEngineStatus(): Promise<void>;
    /**
     * Claude Code 상태 확인
     */
    private checkClaudeCodeStatus;
    /**
     * 최적의 엔진 선택
     */
    selectBestEngine(): Promise<AIEngine>;
    /**
     * 자동 엔진 선택
     */
    private selectEngineAutomatically;
    /**
     * 엔진 점수 계산
     */
    private calculateEngineScore;
    /**
     * 엔진 클라이언트 생성
     */
    createEngineClient(engine: AIEngine): AIClient;
    /**
     * 최적의 클라이언트 생성
     */
    createBestClient(): Promise<AIClient>;
    /**
     * 엔진 상태 조회
     */
    getEngineStatus(engine?: AIEngine): EngineStatus | EngineStatus[];
    /**
     * 사용 가능한 엔진 목록
     */
    getAvailableEngines(): AIEngine[];
    /**
     * 엔진 오류 보고
     */
    reportEngineError(engine: AIEngine, error: Error): void;
    /**
     * 엔진 성공 보고
     */
    reportEngineSuccess(engine: AIEngine): void;
    /**
     * 설정 업데이트
     */
    updateConfig(newConfig: Partial<EngineSelectionConfig>): void;
    /**
     * 상태 정보 표시
     */
    displayStatus(): void;
}
/**
 * 글로벌 엔진 선택기 인스턴스
 */
export declare const engineSelector: EngineSelector;
//# sourceMappingURL=engine-selector.d.ts.map