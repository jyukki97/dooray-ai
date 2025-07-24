import * as vscode from 'vscode';
import { logger } from '../utils/logger';
import { CLIManager } from './cliManager';
import { WebSocketServer } from './webSocketServer';

/**
 * VSCode 명령어 관리자
 */
export class CommandManager {
  private cliManager: CLIManager;
  private webSocketServer: WebSocketServer;

  constructor(cliManager: CLIManager, webSocketServer: WebSocketServer) {
    this.cliManager = cliManager;
    this.webSocketServer = webSocketServer;
    logger.debug(`명령어 매니저 초기화 (WebSocket 서버 실행 중: ${webSocketServer.isServerRunning()})`);
  }

  /**
   * CLI 연결 명령
   */
  public async connect(): Promise<void> {
    try {
      vscode.window.showInformationMessage('Dooray AI CLI에 연결 중...');
      
      const success = await this.cliManager.connect();
      
      if (success) {
        vscode.window.showInformationMessage('✅ Dooray AI CLI 연결 성공!');
        logger.info('CLI 연결 완료');
      } else {
        vscode.window.showErrorMessage('❌ Dooray AI CLI 연결 실패');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Connect 명령 실행 실패: ${errorMessage}`);
      vscode.window.showErrorMessage(`연결 실패: ${errorMessage}`);
    }
  }

  /**
   * Dooray AI 시작 명령
   */
  public async start(): Promise<void> {
    try {
      logger.info('Dooray AI 시작 명령 실행');
      
      // CLI 연결 상태 확인
      if (!this.cliManager.isCliConnected()) {
        const shouldConnect = await vscode.window.showInformationMessage(
          'CLI에 연결되지 않았습니다. 연결하시겠습니까?',
          '연결',
          '취소'
        );
        
        if (shouldConnect === '연결') {
          await this.connect();
        } else {
          return;
        }
      }
      
      // 시작 메뉴 표시
      const action = await vscode.window.showQuickPick([
        '프로젝트 초기화',
        '작업 목록 보기',
        '새 작업 생성',
        'AI 코드 생성'
      ], {
        placeHolder: 'Dooray AI로 무엇을 하시겠습니까?'
      });
      
      switch (action) {
        case '프로젝트 초기화':
          await this.initializeProject();
          break;
        case '작업 목록 보기':
          await this.showTaskList();
          break;
        case '새 작업 생성':
          await this.createTask();
          break;
        case 'AI 코드 생성':
          await this.generateWithAI();
          break;
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Start 명령 실행 실패: ${errorMessage}`);
      vscode.window.showErrorMessage(`시작 실패: ${errorMessage}`);
    }
  }

  /**
   * 작업 목록 표시 명령
   */
  public async showTaskList(): Promise<void> {
    try {
      logger.info('작업 목록 표시 명령 실행');
      
      // TODO: 실제 작업 목록 조회 로직
      const result = await this.cliManager.executeCommand('task', ['list']);
      
      // 웹뷰 패널로 작업 목록 표시
      const panel = vscode.window.createWebviewPanel(
        'doorayTaskList',
        'Dooray AI - 작업 목록',
        vscode.ViewColumn.One,
        {
          enableScripts: true
        }
      );
      
      panel.webview.html = this.getTaskListWebviewContent(result);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`작업 목록 표시 실패: ${errorMessage}`);
      vscode.window.showErrorMessage(`작업 목록 조회 실패: ${errorMessage}`);
    }
  }

  /**
   * 새 작업 생성 명령
   */
  public async createTask(): Promise<void> {
    try {
      logger.info('새 작업 생성 명령 실행');
      
      // 작업 제목 입력
      const title = await vscode.window.showInputBox({
        prompt: '작업 제목을 입력하세요',
        placeHolder: '예: 사용자 인증 기능 구현'
      });
      
      if (!title) return;
      
      // 작업 설명 입력
      const description = await vscode.window.showInputBox({
        prompt: '작업 설명을 입력하세요',
        placeHolder: '작업에 대한 상세한 설명...'
      });
      
             // TODO: 실제 작업 생성 로직
       await this.cliManager.executeCommand('task', ['create', title, description || '']);
       
       vscode.window.showInformationMessage(`✅ 작업이 생성되었습니다: ${title}`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`작업 생성 실패: ${errorMessage}`);
      vscode.window.showErrorMessage(`작업 생성 실패: ${errorMessage}`);
    }
  }

  /**
   * AI 코드 생성 명령
   */
  public async generateWithAI(): Promise<void> {
    try {
      logger.info('AI 코드 생성 명령 실행');
      
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('활성화된 편집기가 없습니다.');
        return;
      }
      
      // 선택된 텍스트 또는 현재 줄 가져오기
      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      
      // AI 요청 입력
      const prompt = await vscode.window.showInputBox({
        prompt: 'AI에게 요청할 내용을 입력하세요',
        placeHolder: '예: 이 함수를 TypeScript로 변환해주세요',
        value: selectedText ? `다음 코드를 개선해주세요:\n${selectedText}` : ''
      });
      
      if (!prompt) return;
      
             // TODO: 실제 AI 코드 생성 로직
       vscode.window.showInformationMessage('🤖 AI가 코드를 생성 중입니다...');
       
       // WebSocket을 통해 실시간 상태 브로드캐스트
       this.webSocketServer.broadcast({
         type: 'ai-generation-start',
         prompt: prompt,
         timestamp: new Date().toISOString()
       });
       
       const result = await this.cliManager.executeCommand('ai-test', ['--generate', prompt]);
       
       this.webSocketServer.broadcast({
         type: 'ai-generation-complete',
         result: result,
         timestamp: new Date().toISOString()
       });
      
      // 결과를 새 문서로 표시
      const doc = await vscode.workspace.openTextDocument({
        content: result,
        language: editor.document.languageId
      });
      
      await vscode.window.showTextDocument(doc);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`AI 코드 생성 실패: ${errorMessage}`);
      vscode.window.showErrorMessage(`AI 코드 생성 실패: ${errorMessage}`);
    }
  }

  /**
   * 프로젝트 초기화
   */
  private async initializeProject(): Promise<void> {
    try {
      logger.info('프로젝트 초기화 실행');
      
      const shouldInit = await vscode.window.showInformationMessage(
        '현재 워크스페이스에 Dooray AI를 초기화하시겠습니까?',
        '초기화',
        '취소'
      );
      
      if (shouldInit === '초기화') {
        await this.cliManager.executeCommand('init');
        vscode.window.showInformationMessage('✅ Dooray AI 프로젝트 초기화 완료!');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`프로젝트 초기화 실패: ${errorMessage}`);
      vscode.window.showErrorMessage(`초기화 실패: ${errorMessage}`);
    }
  }

  /**
   * 작업 목록 웹뷰 HTML 생성
   */
  private getTaskListWebviewContent(data: string): string {
    return `<!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dooray AI - 작업 목록</title>
        <style>
            body {
                font-family: var(--vscode-font-family);
                font-size: var(--vscode-font-size);
                color: var(--vscode-foreground);
                background-color: var(--vscode-editor-background);
                padding: 20px;
            }
            .task-item {
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                padding: 12px;
                margin-bottom: 8px;
                background-color: var(--vscode-editor-background);
            }
            .task-title {
                font-weight: bold;
                margin-bottom: 8px;
            }
            .task-description {
                color: var(--vscode-descriptionForeground);
            }
        </style>
    </head>
    <body>
        <h1>📋 작업 목록</h1>
        <div class="task-item">
            <div class="task-title">작업 목록 불러오기</div>
            <div class="task-description">CLI 연결 후 실제 작업 목록이 표시됩니다.</div>
        </div>
        <pre>${data}</pre>
    </body>
    </html>`;
  }
} 