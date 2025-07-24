/**
 * 인증 정보 구조
 */
export interface AuthCredentials {
    claudeCodeEnabled: boolean;
    dooray?: {
        apiKey: string;
        userId?: string;
        projectId?: string;
        baseUrl?: string;
    };
    github?: {
        token: string;
        username?: string;
    };
    metadata: {
        createdAt: string;
        updatedAt: string;
        lastLogin?: string;
        version: string;
    };
}
/**
 * 인증 상태
 */
export interface AuthStatus {
    isAuthenticated: boolean;
    claudeCodeAvailable: boolean;
    services: {
        dooray: boolean;
        github: boolean;
    };
    lastLogin?: Date;
}
/**
 * 인증 관리자
 */
export declare class AuthManager {
    private authDir;
    private authFile;
    private keyFile;
    private encryptionKey;
    constructor();
    /**
     * 인증 시스템 초기화
     */
    initialize(): Promise<void>;
    /**
     * 인증 상태 확인
     */
    getAuthStatus(): Promise<AuthStatus>;
    /**
     * Dooray 인증 정보 설정
     */
    setDoorayAuth(apiKey: string, userId?: string, projectId?: string): Promise<void>;
    /**
     * GitHub 인증 정보 설정
     */
    setGitHubAuth(token: string, username?: string): Promise<void>;
    /**
     * Dooray 인증 정보 조회
     */
    getDoorayAuth(): Promise<{
        apiKey: string;
        userId?: string;
        projectId?: string;
    } | null>;
    /**
     * GitHub 인증 정보 조회
     */
    getGitHubAuth(): Promise<{
        token: string;
        username?: string;
    } | null>;
    /**
     * 특정 서비스 인증 정보 제거
     */
    removeAuth(service: 'dooray' | 'github'): Promise<void>;
    /**
     * 모든 인증 정보 제거
     */
    clearAll(): Promise<void>;
    /**
     * 인증 정보 검증
     */
    validateAuth(service: 'dooray' | 'github'): Promise<boolean>;
    /**
     * Claude Code 가용성 확인
     */
    validateClaudeCode(): Promise<boolean>;
    /**
     * 암호화 키 생성 또는 로드
     */
    private loadOrGenerateKey;
    /**
     * 데이터 암호화
     */
    private encrypt;
    /**
     * 데이터 복호화
     */
    private decrypt;
    /**
     * 인증 정보 로드
     */
    private loadCredentials;
    /**
     * 인증 정보 저장
     */
    private saveCredentials;
}
/**
 * 글로벌 인증 관리자 인스턴스
 */
export declare const authManager: AuthManager;
//# sourceMappingURL=index.d.ts.map