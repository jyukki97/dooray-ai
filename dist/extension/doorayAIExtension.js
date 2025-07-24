"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoorayAIExtension = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const logger_1 = require("../utils/logger");
const cliManager_1 = require("./cliManager");
const webSocketServer_1 = require("./webSocketServer");
const fileWatcher_1 = require("./fileWatcher");
const commandManager_1 = require("./commandManager");
/**
 * Dooray AI Extension 메인 클래스
 */
class DoorayAIExtension {
    constructor(context) {
        this.context = context;
        // 상태바 아이템 생성
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        // 출력 채널 생성
        this.outputChannel = vscode.window.createOutputChannel('Dooray AI');
        // 각 매니저 인스턴스 생성
        this.cliManager = new cliManager_1.CLIManager(this.outputChannel);
        this.webSocketServer = new webSocketServer_1.WebSocketServer();
        this.fileWatcher = new fileWatcher_1.FileWatcher();
        this.commandManager = new commandManager_1.CommandManager(this.cliManager, this.webSocketServer);
    }
    /**
     * Extension 초기화
     */
    async initialize() {
        try {
            logger_1.logger.info('🔧 DoorayAI Extension 초기화 시작...');
            // 명령어 등록
            this.registerCommands();
            // 상태바 아이템 설정
            this.setupStatusBar();
            // WebSocket 서버 시작
            await this.webSocketServer.start();
            // 파일 감시 시작
            this.fileWatcher.startWatching();
            // 자동 연결 설정 확인
            await this.checkAutoConnect();
            logger_1.logger.info('✅ DoorayAI Extension 초기화 완료');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`❌ Extension 초기화 실패: ${errorMessage}`);
            throw error;
        }
    }
    /**
     * 명령어 등록
     */
    registerCommands() {
        const commands = [
            {
                command: 'dooray-ai.connect',
                callback: () => this.commandManager.connect()
            },
            {
                command: 'dooray-ai.start',
                callback: () => this.commandManager.start()
            },
            {
                command: 'dooray-ai.taskList',
                callback: () => this.commandManager.showTaskList()
            },
            {
                command: 'dooray-ai.createTask',
                callback: () => this.commandManager.createTask()
            },
            {
                command: 'dooray-ai.aiGenerate',
                callback: () => this.commandManager.generateWithAI()
            }
        ];
        for (const cmd of commands) {
            const disposable = vscode.commands.registerCommand(cmd.command, cmd.callback);
            this.context.subscriptions.push(disposable);
        }
        logger_1.logger.info(`📝 ${commands.length}개 명령어 등록 완료`);
    }
    /**
     * 상태바 설정
     */
    setupStatusBar() {
        this.statusBarItem.text = '$(cloud-download) Dooray AI';
        this.statusBarItem.tooltip = 'Dooray AI - CLI와 연결 중...';
        this.statusBarItem.command = 'dooray-ai.connect';
        this.statusBarItem.show();
        this.context.subscriptions.push(this.statusBarItem);
    }
    /**
     * 자동 연결 확인
     */
    async checkAutoConnect() {
        const config = vscode.workspace.getConfiguration('dooray-ai');
        const enableAutoConnect = config.get('enableAutoConnect', true);
        if (enableAutoConnect) {
            // 워크스페이스에 .dooray-ai/config.json이 있는지 확인
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (workspaceFolder) {
                const configPath = path.join(workspaceFolder.uri.fsPath, '.dooray-ai', 'config.json');
                try {
                    const configStat = await vscode.workspace.fs.stat(vscode.Uri.file(configPath));
                    if (configStat) {
                        logger_1.logger.info('🔄 자동 연결 설정 발견됨, CLI 연결 시도...');
                        await this.commandManager.connect();
                    }
                }
                catch (error) {
                    logger_1.logger.debug('설정 파일이 없음, 자동 연결 건너뜀');
                }
            }
        }
    }
    /**
     * 상태바 업데이트
     */
    updateStatus(status, message) {
        switch (status) {
            case 'connected':
                this.statusBarItem.text = '$(check) Dooray AI';
                this.statusBarItem.tooltip = message || 'Dooray AI - 연결됨';
                this.statusBarItem.backgroundColor = undefined;
                break;
            case 'connecting':
                this.statusBarItem.text = '$(loading~spin) Dooray AI';
                this.statusBarItem.tooltip = message || 'Dooray AI - 연결 중...';
                this.statusBarItem.backgroundColor = undefined;
                break;
            case 'disconnected':
                this.statusBarItem.text = '$(cloud-download) Dooray AI';
                this.statusBarItem.tooltip = message || 'Dooray AI - 연결 안됨';
                this.statusBarItem.backgroundColor = undefined;
                break;
            case 'error':
                this.statusBarItem.text = '$(error) Dooray AI';
                this.statusBarItem.tooltip = message || 'Dooray AI - 오류 발생';
                this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
                break;
        }
    }
    /**
     * 메시지 출력
     */
    showMessage(message, type = 'info') {
        this.outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] ${message}`);
        switch (type) {
            case 'info':
                vscode.window.showInformationMessage(message);
                break;
            case 'warning':
                vscode.window.showWarningMessage(message);
                break;
            case 'error':
                vscode.window.showErrorMessage(message);
                break;
        }
    }
    /**
     * Extension 정리
     */
    dispose() {
        logger_1.logger.info('🧹 DoorayAI Extension 정리 중...');
        // WebSocket 서버 정지
        this.webSocketServer.stop();
        // 파일 감시 정지
        this.fileWatcher.stopWatching();
        // CLI 연결 정리
        this.cliManager.dispose();
        // 상태바 아이템 정리
        this.statusBarItem.dispose();
        // 출력 채널 정리
        this.outputChannel.dispose();
        logger_1.logger.info('✅ DoorayAI Extension 정리 완료');
    }
}
exports.DoorayAIExtension = DoorayAIExtension;
//# sourceMappingURL=doorayAIExtension.js.map