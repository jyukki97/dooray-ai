export interface CLIOptions {
    verbose?: boolean;
    debug?: boolean;
    config?: string;
}
export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    updatedAt: Date;
}
export interface GitInfo {
    currentBranch: string;
    hasChanges: boolean;
    remoteUrl?: string;
    lastCommit?: string;
}
export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface Config {
    doorayApiKey?: string;
    githubToken?: string;
    openaiApiKey?: string;
    anthropicApiKey?: string;
    defaultBranch: string;
    autoCommit: boolean;
    autoPush: boolean;
}
//# sourceMappingURL=index.d.ts.map