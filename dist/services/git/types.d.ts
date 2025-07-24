/**
 * Git 워크플로우 타입 정의
 */
export interface GitConfig {
    defaultBranch: string;
    autoCommit: boolean;
    commitMessageTemplate: string;
    autoSync: boolean;
    rebaseOnPull: boolean;
}
export interface GitRepository {
    path: string;
    name: string;
    remoteUrl?: string;
    currentBranch: string;
    isClean: boolean;
    hasUncommittedChanges: boolean;
    hasUnpushedCommits: boolean;
}
export interface GitBranch {
    name: string;
    isActive: boolean;
    isRemote: boolean;
    lastCommit?: {
        hash: string;
        message: string;
        author: string;
        date: string;
    };
}
export interface GitCommit {
    hash: string;
    message: string;
    author: string;
    email: string;
    date: string;
    files: string[];
}
export interface GitWorkflowOptions {
    branchPrefix?: string;
    commitMessage?: string;
    pushToRemote?: boolean;
    createPR?: boolean;
    autoCleanup?: boolean;
}
export interface BranchCreationOptions {
    baseBranch?: string;
    branchName?: string;
    switchToBranch?: boolean;
    pushToRemote?: boolean;
}
export interface CommitOptions {
    message: string;
    addAll?: boolean;
    push?: boolean;
    files?: string[];
}
export interface GitError extends Error {
    code: string;
    command?: string;
    stdout?: string;
    stderr?: string;
}
export interface GitStatus {
    branch: string;
    tracking?: string;
    ahead: number;
    behind: number;
    staged: GitFileStatus[];
    unstaged: GitFileStatus[];
    untracked: string[];
    conflicted: string[];
}
export interface GitFileStatus {
    file: string;
    index: string;
    workingTree: string;
}
export interface WorkflowResult {
    success: boolean;
    branchName?: string;
    commitHash?: string;
    filesChanged: string[];
    message: string;
    error?: GitError;
}
//# sourceMappingURL=types.d.ts.map