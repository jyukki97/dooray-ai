import * as vscode from 'vscode';
import * as path from 'path';
import { logger } from '../utils/logger';
import { CLIManager } from './cliManager';
import { WebSocketServer } from './webSocketServer';
import { FileWatcher } from './fileWatcher';
import { CommandManager } from './commandManager';

/**
 * Dooray AI Extension 메인 클래스
 */
export class DoorayAIExtension {
  private context: vscode.ExtensionContext;
  private cliManager: CLIManager;
  private webSocketServer: WebSocketServer;
  private fileWatcher: FileWatcher;
  private commandManager: CommandManager;
  private statusBarItem: vscode.StatusBarItem;
  private outputChannel: vscode.OutputChannel;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    
    // 상태바 아이템 생성
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    
    // 출력 채널 생성
    this.outputChannel = vscode.window.createOutputChannel('Dooray AI');
    
    // 각 매니저 인스턴스 생성
    this.cliManager = new CLIManager(this.outputChannel);
    this.webSocketServer = new WebSocketServer();
    this.fileWatcher = new FileWatcher();
    this.commandManager = new CommandManager(this.cliManager, this.webSocketServer);
  }

  /**
   * Extension 초기화
   */
  public async initialize(): Promise<void> {
    try {
      logger.info('🔧 DoorayAI Extension 초기화 시작...');
      
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
      
      logger.info('✅ DoorayAI Extension 초기화 완료');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`❌ Extension 초기화 실패: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 명령어 등록
   */
  private registerCommands(): void {
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

    logger.info(`📝 ${commands.length}개 명령어 등록 완료`);
  }

  /**
   * 상태바 설정
   */
  private setupStatusBar(): void {
    this.statusBarItem.text = '$(cloud-download) Dooray AI';
    this.statusBarItem.tooltip = 'Dooray AI - CLI와 연결 중...';
    this.statusBarItem.command = 'dooray-ai.connect';
    this.statusBarItem.show();
    
    this.context.subscriptions.push(this.statusBarItem);
  }

  /**
   * 자동 연결 확인
   */
  private async checkAutoConnect(): Promise<void> {
    const config = vscode.workspace.getConfiguration('dooray-ai');
    const enableAutoConnect = config.get<boolean>('enableAutoConnect', true);
    
    if (enableAutoConnect) {
      // 워크스페이스에 .dooray-ai/config.json이 있는지 확인
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (workspaceFolder) {
        const configPath = path.join(workspaceFolder.uri.fsPath, '.dooray-ai', 'config.json');
        
        try {
          const configStat = await vscode.workspace.fs.stat(vscode.Uri.file(configPath));
          if (configStat) {
            logger.info('🔄 자동 연결 설정 발견됨, CLI 연결 시도...');
            await this.commandManager.connect();
          }
        } catch (error) {
          logger.debug('설정 파일이 없음, 자동 연결 건너뜀');
        }
      }
    }
  }

  /**
   * 상태바 업데이트
   */
  public updateStatus(status: 'connected' | 'disconnected' | 'connecting' | 'error', message?: string): void {
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
  public showMessage(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
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
  public dispose(): void {
    logger.info('🧹 DoorayAI Extension 정리 중...');
    
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
    
    logger.info('✅ DoorayAI Extension 정리 완료');
  }
} 