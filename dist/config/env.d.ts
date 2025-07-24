/**
 * 환경 변수 설정
 */
export interface EnvironmentConfig {
    claudeApiKey?: string | undefined;
    openaiApiKey?: string | undefined;
    anthropicApiKey?: string | undefined;
    doorayApiKey?: string | undefined;
    githubToken?: string | undefined;
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
 * API 키 마스킹 유틸리티
 */
export declare function maskApiKey(apiKey: string): string;
/**
 * 환경 변수 정보 표시 (보안 정보 제외)
 */
export declare function displayEnvironmentInfo(): void;
export declare const env: EnvironmentConfig;
//# sourceMappingURL=env.d.ts.map