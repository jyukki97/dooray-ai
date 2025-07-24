import * as vscode from 'vscode';
/**
 * CLI 통신 관리자
 */
export declare class CLIManager {
    private outputChannel;
    private cliProcess;
    private isConnected;
    constructor(outputChannel: vscode.OutputChannel);
    /**
     * CLI 연결
     */
    connect(): Promise<boolean>;
    /**
     * CLI 명령 실행
     */
    executeCommand(command: string, args?: string[]): Promise<string>;
    /**
     * 연결 상태 확인
     */
    isCliConnected(): boolean;
    /**
     * 리소스 정리
     */
    dispose(): void;
}
//# sourceMappingURL=cliManager.d.ts.map