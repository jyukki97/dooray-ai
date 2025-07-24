import { GitHubCredentials, GitHubRepository, GitHubUser, GitHubPullRequest, GitHubIssue, GitHubLabel, CreatePullRequestOptions, UpdatePullRequestOptions, GitHubApiOptions, GitHubWorkflowOptions } from './types';
/**
 * GitHub API 클라이언트
 */
export declare class GitHubClient {
    private client;
    private credentials;
    private options;
    constructor(credentials: GitHubCredentials, options?: GitHubApiOptions);
    /**
     * API 오류 처리
     */
    private handleApiError;
    /**
     * 연결 상태 확인
     */
    validateConnection(): Promise<boolean>;
    /**
     * 현재 사용자 정보 조회
     */
    getCurrentUser(): Promise<GitHubUser>;
    /**
     * 저장소 정보 조회
     */
    getRepository(owner: string, repo: string): Promise<GitHubRepository>;
    /**
     * 사용자의 저장소 목록 조회
     */
    getRepositories(options?: {
        type?: 'owner' | 'member' | 'all';
        sort?: 'created' | 'updated' | 'pushed' | 'full_name';
        direction?: 'asc' | 'desc';
        per_page?: number;
        page?: number;
    }): Promise<GitHubRepository[]>;
    /**
     * Pull Request 생성
     */
    createPullRequest(owner: string, repo: string, options: CreatePullRequestOptions): Promise<GitHubPullRequest>;
    /**
     * Pull Request 업데이트
     */
    updatePullRequest(owner: string, repo: string, pullNumber: number, options: UpdatePullRequestOptions): Promise<GitHubPullRequest>;
    /**
     * Pull Request 조회
     */
    getPullRequest(owner: string, repo: string, pullNumber: number): Promise<GitHubPullRequest>;
    /**
     * Pull Request 목록 조회
     */
    getPullRequests(owner: string, repo: string, options?: {
        state?: 'open' | 'closed' | 'all';
        head?: string;
        base?: string;
        sort?: 'created' | 'updated' | 'popularity';
        direction?: 'asc' | 'desc';
        per_page?: number;
        page?: number;
    }): Promise<GitHubPullRequest[]>;
    /**
     * 라벨 조회
     */
    getLabels(owner: string, repo: string): Promise<GitHubLabel[]>;
    /**
     * Issue에 라벨 추가
     */
    addLabelsToIssue(owner: string, repo: string, issueNumber: number, labels: string[]): Promise<GitHubLabel[]>;
    /**
     * Pull Request에 assignee 추가
     */
    addAssignees(owner: string, repo: string, issueNumber: number, assignees: string[]): Promise<GitHubIssue>;
    /**
     * Pull Request에 reviewer 요청
     */
    requestReviewers(owner: string, repo: string, pullNumber: number, reviewers: string[], team_reviewers?: string[]): Promise<GitHubPullRequest>;
    /**
     * 브랜치 존재 확인
     */
    branchExists(owner: string, repo: string, branch: string): Promise<boolean>;
    /**
     * 태스크 기반 PR 생성 워크플로우
     */
    createTaskPullRequest(taskId: string, taskTitle: string, taskDescription: string, branchName: string, options: GitHubWorkflowOptions): Promise<GitHubPullRequest>;
    /**
     * PR 템플릿 생성
     */
    private generatePRTemplate;
    /**
     * 저장소에서 현재 사용자가 collaborator인지 확인
     */
    isCollaborator(owner: string, repo: string, username?: string): Promise<boolean>;
    /**
     * 저장소의 기본 브랜치 확인
     */
    getDefaultBranch(owner: string, repo: string): Promise<string>;
}
//# sourceMappingURL=client.d.ts.map