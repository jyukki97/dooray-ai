import * as vscode from 'vscode';
/**
 * Dooray AI Extension 메인 클래스
 */
export declare class DoorayAIExtension {
    private context;
    private cliManager;
    private webSocketServer;
    private fileWatcher;
    private commandManager;
    private statusBarItem;
    private outputChannel;
    constructor(context: vscode.ExtensionContext);
    /**
     * Extension 초기화
     */
    initialize(): Promise<void>;
    /**
     * 명령어 등록
     */
    private registerCommands;
    /**
     * 상태바 설정
     */
    private setupStatusBar;
    /**
     * 자동 연결 확인
     */
    private checkAutoConnect;
    /**
     * 상태바 업데이트
     */
    updateStatus(status: 'connected' | 'disconnected' | 'connecting' | 'error', message?: string): void;
    /**
     * 메시지 출력
     */
    showMessage(message: string, type?: 'info' | 'warning' | 'error'): void;
    /**
     * Extension 정리
     */
    dispose(): void;
}
//# sourceMappingURL=doorayAIExtension.d.ts.map