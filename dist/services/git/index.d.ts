/**
 * Git 서비스 모듈
 */
export * from './types';
export { GitClient } from './client';
import { GitClient } from './client';
/**
 * Git 클라이언트 팩토리
 */
export declare class GitClientFactory {
    private static instance;
    /**
     * Git 클라이언트 생성
     */
    static createClient(repositoryPath?: string): Promise<GitClient>;
    /**
     * 기존 클라이언트 인스턴스 반환 또는 새로 생성
     */
    static getInstance(repositoryPath?: string): Promise<GitClient>;
    /**
     * 클라이언트 인스턴스 재설정
     */
    static resetInstance(): void;
    /**
     * Git 저장소 검증
     */
    static validateRepository(repositoryPath?: string): Promise<boolean>;
}
/**
 * 기본 Git 클라이언트 인스턴스 가져오기
 */
export declare function getGitClient(repositoryPath?: string): Promise<GitClient>;
/**
 * Git 저장소 검증
 */
export declare function validateGitRepository(repositoryPath?: string): Promise<boolean>;
//# sourceMappingURL=index.d.ts.map