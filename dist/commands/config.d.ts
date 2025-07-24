import { Command } from 'commander';
declare const CONFIG_DIR: string;
declare const CONFIG_FILE: string;
interface DoorayAIConfig {
    ai: {
        provider: 'claude' | 'openai' | 'auto';
        model: string;
        temperature: number;
        maxTokens: number;
    };
    dooray: {
        domain: string;
        defaultProject?: string;
        apiToken?: string;
    };
    git: {
        defaultBranch: string;
        branchPrefix: string;
        autoCommit: boolean;
        autoPush: boolean;
    };
    github: {
        owner?: string;
        repo?: string;
        token?: string;
        autoCreatePR: boolean;
    };
    workflow: {
        autoMode: boolean;
        confirmSteps: boolean;
        parallelTasks: boolean;
    };
    ui: {
        colorOutput: boolean;
        progressBar: boolean;
        verbose: boolean;
    };
}
declare function loadConfig(): Promise<DoorayAIConfig>;
declare const configCommand: Command;
export { configCommand, loadConfig, CONFIG_FILE, CONFIG_DIR };
export type { DoorayAIConfig };
//# sourceMappingURL=config.d.ts.map