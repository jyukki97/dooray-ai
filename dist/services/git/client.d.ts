import { GitConfig, GitRepository, GitBranch, GitCommit, GitStatus, BranchCreationOptions, CommitOptions, GitWorkflowOptions, WorkflowResult } from './types';
/**
 * Git 클라이언트
 */
export declare class GitClient {
    private cwd;
    private config;
    constructor(repositoryPath?: string, config?: Partial<GitConfig>);
    /**
     * Git 명령어 실행
     */
    private executeGitCommand;
    /**
     * Git 저장소 정보 조회
     */
    getRepositoryInfo(): Promise<GitRepository>;
    /**
     * 현재 브랜치 조회
     */
    getCurrentBranch(): Promise<string>;
    /**
     * 원격 저장소 URL 조회
     */
    getRemoteUrl(remoteName?: string): Promise<string>;
    /**
     * Git 상태 조회
     */
    getStatus(): Promise<GitStatus>;
    /**
     * 브랜치 목록 조회
     */
    getBranches(includeRemote?: boolean): Promise<GitBranch[]>;
    /**
     * 새 브랜치 생성
     */
    createBranch(branchName: string, options?: BranchCreationOptions): Promise<string>;
    /**
     * 브랜치 전환
     */
    switchBranch(branchName: string): Promise<void>;
    /**
     * 파일 스테이징
     */
    addFiles(files?: string[]): Promise<void>;
    /**
     * 커밋 생성
     */
    commit(options: CommitOptions): Promise<string>;
    /**
     * 태스크 기반 워크플로우 실행
     */
    executeTaskWorkflow(taskId: string, description: string, files: string[], options?: GitWorkflowOptions): Promise<WorkflowResult>;
    /**
     * 커밋 히스토리 조회
     */
    getCommitHistory(limit?: number, branch?: string): Promise<GitCommit[]>;
    /**
     * 브랜치 삭제
     */
    deleteBranch(branchName: string, force?: boolean): Promise<void>;
    /**
     * Git 저장소 검증
     */
    validateRepository(): Promise<boolean>;
    /**
     * 구성 업데이트
     */
    updateConfig(newConfig: Partial<GitConfig>): void;
}
//# sourceMappingURL=client.d.ts.map