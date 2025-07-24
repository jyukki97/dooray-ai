import { CLIManager } from './cliManager';
import { WebSocketServer } from './webSocketServer';
/**
 * VSCode 명령어 관리자
 */
export declare class CommandManager {
    private cliManager;
    private webSocketServer;
    constructor(cliManager: CLIManager, webSocketServer: WebSocketServer);
    /**
     * CLI 연결 명령
     */
    connect(): Promise<void>;
    /**
     * Dooray AI 시작 명령
     */
    start(): Promise<void>;
    /**
     * 작업 목록 표시 명령
     */
    showTaskList(): Promise<void>;
    /**
     * 새 작업 생성 명령
     */
    createTask(): Promise<void>;
    /**
     * AI 코드 생성 명령
     */
    generateWithAI(): Promise<void>;
    /**
     * 프로젝트 초기화
     */
    private initializeProject;
    /**
     * 작업 목록 웹뷰 HTML 생성
     */
    private getTaskListWebviewContent;
}
//# sourceMappingURL=commandManager.d.ts.map