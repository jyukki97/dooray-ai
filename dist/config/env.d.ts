/**
 * 환경 변수 설정 (Claude Code 전용, API 키 불필요)
 */
export interface EnvironmentConfig {
    nodeEnv: string;
    logLevel: string;
    defaultAiEngine: string;
    maxTokens: number;
    requestTimeout: number;
}
/**
 * 환경 변수 파싱 및 반환
 */
export declare function getEnvironmentConfig(): EnvironmentConfig;
/**
 * 환경 변수 정보 표시
 */
export declare function displayEnvironmentInfo(): void;
export declare const env: EnvironmentConfig;
//# sourceMappingURL=env.d.ts.map