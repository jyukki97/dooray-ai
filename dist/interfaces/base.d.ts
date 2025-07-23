export interface IBaseService {
    initialize(): Promise<void>;
    cleanup(): Promise<void>;
}
export interface IAPIClient {
    get<T>(url: string, config?: RequestConfig): Promise<T>;
    post<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
    put<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
    delete<T>(url: string, config?: RequestConfig): Promise<T>;
}
export interface RequestConfig {
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
}
export interface APIResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
}
export interface APIError {
    message: string;
    status?: number;
    code?: string;
    details?: any;
}
export interface IGitService extends IBaseService {
    getCurrentBranch(): Promise<string>;
    createBranch(branchName: string): Promise<void>;
    switchBranch(branchName: string): Promise<void>;
    hasChanges(): Promise<boolean>;
    commitChanges(message: string): Promise<void>;
    pushChanges(): Promise<void>;
    getRemoteUrl(): Promise<string | null>;
}
export interface IAIService extends IBaseService {
    generateCode(prompt: string, context?: any): Promise<string>;
    analyzeCode(code: string): Promise<any>;
    generateCommitMessage(diff: string): Promise<string>;
    generatePRDescription(changes: string[]): Promise<string>;
}
export interface IDoorayService extends IBaseService {
    getProjects(): Promise<any[]>;
    getTasks(projectId: string): Promise<any[]>;
    getTask(taskId: string): Promise<any>;
    createTask(projectId: string, task: any): Promise<any>;
    updateTask(taskId: string, updates: any): Promise<any>;
    addComment(taskId: string, comment: string): Promise<any>;
}
export interface IGitHubService extends IBaseService {
    getRepositories(): Promise<any[]>;
    getRepository(owner: string, repo: string): Promise<any>;
    createPullRequest(owner: string, repo: string, pr: any): Promise<any>;
    getPullRequests(owner: string, repo: string): Promise<any[]>;
    mergePullRequest(owner: string, repo: string, prNumber: number): Promise<any>;
}
export interface ICodeGeneratorService extends IBaseService {
    generateFile(template: string, data: any): Promise<string>;
    modifyFile(filePath: string, modifications: any): Promise<void>;
    createProject(template: string, options: any): Promise<void>;
    analyzeProject(projectPath: string): Promise<any>;
}
//# sourceMappingURL=base.d.ts.map