/**
 * 설정 파일 구조 정의
 */
export interface DoorayAIConfig {
    project: {
        name?: string;
        description?: string;
        version?: string;
    };
    ai: {
        engine: 'claude-code';
        maxTokens: number;
        temperature: number;
        timeout: number;
    };
    git: {
        defaultBranch: string;
        autoCommit: boolean;
        commitMessageTemplate: string;
    };
    dooray?: {
        projectId?: string;
        apiUrl?: string;
    };
    github?: {
        username?: string;
        repository?: string;
    };
    preferences: {
        language: 'ko' | 'en';
        logLevel: 'error' | 'warn' | 'info' | 'debug';
        colorOutput: boolean;
    };
    metadata: {
        createdAt: string;
        updatedAt: string;
        version: string;
    };
}
/**
 * 설정 파일 관리자
 */
export declare class ConfigManager {
    private configDir;
    private configFile;
    private globalConfigDir;
    private globalConfigFile;
    constructor();
    /**
     * 설정 파일 초기화
     */
    initialize(force?: boolean): Promise<void>;
    /**
     * 설정 로드 (프로젝트 우선, 글로벌 fallback)
     */
    load(): Promise<DoorayAIConfig>;
    /**
     * 설정 저장
     */
    save(config: Partial<DoorayAIConfig>, global?: boolean): Promise<void>;
    /**
     * 특정 설정값 조회
     */
    get<K extends keyof DoorayAIConfig>(key: K): Promise<DoorayAIConfig[K]>;
    /**
     * 특정 설정값 설정
     */
    set<K extends keyof DoorayAIConfig>(key: K, value: DoorayAIConfig[K], global?: boolean): Promise<void>;
    /**
     * 설정 파일 경로 조회
     */
    getConfigPaths(): {
        project: string;
        global: string;
    };
    /**
     * 설정 파일 존재 여부 확인
     */
    exists(): Promise<{
        project: boolean;
        global: boolean;
    }>;
    /**
     * 설정 파일 삭제
     */
    remove(global?: boolean): Promise<void>;
    /**
     * 설정 마이그레이션
     */
    migration(fromVersion: string, toVersion: string): Promise<void>;
    /**
     * 설정 검증
     */
    private validateConfig;
    /**
     * 기본값과 병합
     */
    private mergeWithDefaults;
    /**
     * 깊은 객체 병합
     */
    private deepMerge;
}
/**
 * 글로벌 설정 관리자 인스턴스
 */
export declare const configManager: ConfigManager;
//# sourceMappingURL=index.d.ts.map