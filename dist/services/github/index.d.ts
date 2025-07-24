/**
 * GitHub 서비스 모듈
 */
export * from './types';
export { GitHubClient } from './client';
import { GitHubClient } from './client';
import { GitHubApiOptions } from './types';
/**
 * GitHub 클라이언트 팩토리
 */
export declare class GitHubClientFactory {
    private static instance;
    /**
     * GitHub 클라이언트 생성
     */
    static createClient(options?: GitHubApiOptions): Promise<GitHubClient>;
    /**
     * 기존 클라이언트 인스턴스 반환 또는 새로 생성
     */
    static getInstance(options?: GitHubApiOptions): Promise<GitHubClient>;
    /**
     * 클라이언트 인스턴스 재설정
     */
    static resetInstance(): void;
    /**
     * GitHub 연결 상태 확인
     */
    static validateConnection(): Promise<boolean>;
}
/**
 * 기본 GitHub 클라이언트 인스턴스 가져오기
 */
export declare function getGitHubClient(): Promise<GitHubClient>;
/**
 * GitHub 연결 상태 확인
 */
export declare function validateGitHubConnection(): Promise<boolean>;
//# sourceMappingURL=index.d.ts.map