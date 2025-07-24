export interface TaskMasterConfig {
    models: {
        main: {
            provider: string;
            modelId: string;
            maxTokens: number;
            temperature: number;
        };
        research?: any;
        fallback?: any;
    };
    global: {
        logLevel: string;
        debug: boolean;
        defaultNumTasks: number;
        defaultSubtasks: number;
        defaultPriority: string;
        projectName: string;
        responseLanguage: string;
        defaultTag: string;
        userId?: string;
    };
    claudeCode?: any;
}
export interface Task {
    id: number;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'done' | 'blocked';
    priority: 'low' | 'medium' | 'high';
    dependencies: number[];
    details: string;
    testStrategy: string;
    subtasks?: SubTask[];
}
export interface SubTask {
    id: number;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'done';
    dependencies: string[];
    details: string;
    testStrategy: string;
}
export interface TaskMasterState {
    currentTag: string;
    lastSwitched: string;
    branchTagMapping: Record<string, string>;
    migrationNoticeShown: boolean;
}
export interface TaskCollection {
    tasks: Task[];
    metadata: {
        createdAt: string;
        updatedAt: string;
        version: string;
        created: string;
        description: string;
        updated: string;
    };
}
/**
 * TaskMaster 시스템과 Claude Code 통합 관리자
 */
export declare class TaskMasterManager {
    private taskmasterDir;
    private configPath;
    private statePath;
    private tasksPath;
    private claudeClient;
    constructor(projectRoot?: string);
    /**
     * TaskMaster 시스템 초기화
     */
    initialize(): Promise<void>;
    /**
     * 기본 설정 파일 생성
     */
    private createDefaultConfig;
    /**
     * 기본 상태 파일 생성
     */
    private createDefaultState;
    /**
     * 기본 태스크 파일 생성
     */
    private createDefaultTasks;
    /**
     * 설정 로드
     */
    loadConfig(): Promise<TaskMasterConfig>;
    /**
     * 상태 로드
     */
    loadState(): Promise<TaskMasterState>;
    /**
     * 태스크 로드
     */
    loadTasks(tag?: string): Promise<TaskCollection>;
    /**
     * 새 태스크 생성 (Claude Code로 생성)
     */
    createTaskWithAI(description: string, tag?: string): Promise<Task>;
    /**
     * 태스크 추가
     */
    addTask(task: Task, tag?: string): Promise<void>;
    /**
     * 태스크 상태 업데이트
     */
    updateTaskStatus(taskId: number, status: Task['status'], tag?: string): Promise<void>;
    /**
     * 프로젝트 분석 및 태스크 생성
     */
    analyzeProjectAndGenerateTasks(projectPath: string): Promise<Task[]>;
    /**
     * TaskMaster 상태 정보 표시
     */
    displayStatus(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map