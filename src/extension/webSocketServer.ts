import * as WebSocket from 'ws';
import * as vscode from 'vscode';
import { logger } from '../utils/logger';

/**
 * WebSocket 서버 관리자
 */
export class WebSocketServer {
  private server: WebSocket.Server | null = null;
  private port: number = 8080;
  private isRunning: boolean = false;

  /**
   * 서버 시작
   */
  public async start(): Promise<void> {
    try {
      const config = vscode.workspace.getConfiguration('dooray-ai');
      this.port = config.get<number>('websocketPort', 8080);
      
      logger.info(`🌐 WebSocket 서버 시작 중... (포트: ${this.port})`);
      
      this.server = new WebSocket.Server({ port: this.port });
      
      this.server.on('connection', this.handleConnection.bind(this));
      this.server.on('error', this.handleError.bind(this));
      
      this.isRunning = true;
      logger.info(`✅ WebSocket 서버 시작됨 (포트: ${this.port})`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`❌ WebSocket 서버 시작 실패: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 클라이언트 연결 처리
   */
  private handleConnection(ws: WebSocket): void {
    logger.info('🤝 새 WebSocket 클라이언트 연결됨');
    
    ws.on('message', (message: WebSocket.Data) => {
      try {
        const data = JSON.parse(message.toString());
        this.handleMessage(ws, data);
             } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Unknown error';
         logger.error(`❌ WebSocket 메시지 파싱 실패: ${errorMessage}`);
       }
    });
    
    ws.on('close', () => {
      logger.info('👋 WebSocket 클라이언트 연결 종료됨');
    });
    
         ws.on('error', (error) => {
       const errorMessage = error instanceof Error ? error.message : 'Unknown error';
       logger.error(`❌ WebSocket 클라이언트 오류: ${errorMessage}`);
     });
  }

  /**
   * 메시지 처리
   */
  private handleMessage(ws: WebSocket, data: any): void {
    logger.debug('📨 WebSocket 메시지 수신:', data);
    
    // TODO: 메시지 타입별 처리 로직 구현
    
    // 에코 응답 (임시)
    ws.send(JSON.stringify({
      type: 'response',
      data: 'Message received',
      timestamp: new Date().toISOString()
    }));
  }

  /**
   * 오류 처리
   */
     private handleError(error: Error): void {
     const errorMessage = error.message || 'Unknown error';
     logger.error(`❌ WebSocket 서버 오류: ${errorMessage}`);
   }

  /**
   * 모든 클라이언트에게 브로드캐스트
   */
  public broadcast(message: any): void {
    if (!this.server) return;
    
    const messageStr = JSON.stringify(message);
    
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  /**
   * 서버 정지
   */
  public stop(): void {
    if (this.server) {
      logger.info('🛑 WebSocket 서버 정지 중...');
      this.server.close();
      this.server = null;
      this.isRunning = false;
      logger.info('✅ WebSocket 서버 정지됨');
    }
  }

  /**
   * 서버 실행 상태
   */
  public isServerRunning(): boolean {
    return this.isRunning;
  }
} 