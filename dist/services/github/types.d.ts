/**
 * GitHub API 타입 정의
 */
export interface GitHubCredentials {
    token: string;
    username?: string;
}
export interface GitHubRepository {
    id: number;
    name: string;
    full_name: string;
    description?: string;
    private: boolean;
    owner: GitHubUser;
    html_url: string;
    clone_url: string;
    default_branch: string;
    language?: string;
    topics: string[];
    created_at: string;
    updated_at: string;
}
export interface GitHubUser {
    id: number;
    login: string;
    name?: string;
    email?: string;
    avatar_url: string;
    html_url: string;
}
export interface GitHubPullRequest {
    id: number;
    number: number;
    title: string;
    body?: string;
    state: 'open' | 'closed' | 'merged';
    head: {
        ref: string;
        sha: string;
        repo: GitHubRepository;
    };
    base: {
        ref: string;
        sha: string;
        repo: GitHubRepository;
    };
    user: GitHubUser;
    assignees: GitHubUser[];
    reviewers: GitHubUser[];
    labels: GitHubLabel[];
    html_url: string;
    created_at: string;
    updated_at: string;
    merged_at?: string;
}
export interface GitHubLabel {
    id: number;
    name: string;
    color: string;
    description?: string;
}
export interface GitHubIssue {
    id: number;
    number: number;
    title: string;
    body?: string;
    state: 'open' | 'closed';
    user: GitHubUser;
    assignees: GitHubUser[];
    labels: GitHubLabel[];
    html_url: string;
    created_at: string;
    updated_at: string;
    closed_at?: string;
}
export interface CreatePullRequestOptions {
    title: string;
    body?: string;
    head: string;
    base: string;
    draft?: boolean;
    assignees?: string[];
    reviewers?: string[];
    team_reviewers?: string[];
    labels?: string[];
    milestone?: number;
}
export interface UpdatePullRequestOptions {
    title?: string;
    body?: string;
    state?: 'open' | 'closed';
    base?: string;
}
export interface GitHubApiOptions {
    timeout?: number;
    retries?: number;
    baseUrl?: string;
}
export interface GitHubError extends Error {
    code: string;
    statusCode?: number;
    response?: any;
}
export interface PullRequestTemplate {
    title: string;
    body: string;
    labels: string[];
    assignees: string[];
    reviewers: string[];
}
export interface GitHubWorkflowOptions {
    repository: string;
    prTemplate?: Partial<PullRequestTemplate>;
    autoAssign?: boolean;
    autoLabel?: boolean;
    linkToTask?: boolean;
    taskUrl?: string;
}
//# sourceMappingURL=types.d.ts.map