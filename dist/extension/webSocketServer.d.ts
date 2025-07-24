/**
 * WebSocket 서버 관리자
 */
export declare class WebSocketServer {
    private server;
    private port;
    private isRunning;
    /**
     * 서버 시작
     */
    start(): Promise<void>;
    /**
     * 클라이언트 연결 처리
     */
    private handleConnection;
    /**
     * 메시지 처리
     */
    private handleMessage;
    /**
     * 오류 처리
     */
    private handleError;
    /**
     * 모든 클라이언트에게 브로드캐스트
     */
    broadcast(message: any): void;
    /**
     * 서버 정지
     */
    stop(): void;
    /**
     * 서버 실행 상태
     */
    isServerRunning(): boolean;
}
//# sourceMappingURL=webSocketServer.d.ts.map