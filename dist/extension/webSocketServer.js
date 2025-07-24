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
exports.WebSocketServer = void 0;
const WebSocket = __importStar(require("ws"));
const vscode = __importStar(require("vscode"));
const logger_1 = require("../utils/logger");
/**
 * WebSocket 서버 관리자
 */
class WebSocketServer {
    constructor() {
        this.server = null;
        this.port = 8080;
        this.isRunning = false;
    }
    /**
     * 서버 시작
     */
    async start() {
        try {
            const config = vscode.workspace.getConfiguration('dooray-ai');
            this.port = config.get('websocketPort', 8080);
            logger_1.logger.info(`🌐 WebSocket 서버 시작 중... (포트: ${this.port})`);
            this.server = new WebSocket.Server({ port: this.port });
            this.server.on('connection', this.handleConnection.bind(this));
            this.server.on('error', this.handleError.bind(this));
            this.isRunning = true;
            logger_1.logger.info(`✅ WebSocket 서버 시작됨 (포트: ${this.port})`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`❌ WebSocket 서버 시작 실패: ${errorMessage}`);
            throw error;
        }
    }
    /**
     * 클라이언트 연결 처리
     */
    handleConnection(ws) {
        logger_1.logger.info('🤝 새 WebSocket 클라이언트 연결됨');
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                this.handleMessage(ws, data);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                logger_1.logger.error(`❌ WebSocket 메시지 파싱 실패: ${errorMessage}`);
            }
        });
        ws.on('close', () => {
            logger_1.logger.info('👋 WebSocket 클라이언트 연결 종료됨');
        });
        ws.on('error', (error) => {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`❌ WebSocket 클라이언트 오류: ${errorMessage}`);
        });
    }
    /**
     * 메시지 처리
     */
    handleMessage(ws, data) {
        logger_1.logger.debug('📨 WebSocket 메시지 수신:', data);
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
    handleError(error) {
        const errorMessage = error.message || 'Unknown error';
        logger_1.logger.error(`❌ WebSocket 서버 오류: ${errorMessage}`);
    }
    /**
     * 모든 클라이언트에게 브로드캐스트
     */
    broadcast(message) {
        if (!this.server)
            return;
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
    stop() {
        if (this.server) {
            logger_1.logger.info('🛑 WebSocket 서버 정지 중...');
            this.server.close();
            this.server = null;
            this.isRunning = false;
            logger_1.logger.info('✅ WebSocket 서버 정지됨');
        }
    }
    /**
     * 서버 실행 상태
     */
    isServerRunning() {
        return this.isRunning;
    }
}
exports.WebSocketServer = WebSocketServer;
//# sourceMappingURL=webSocketServer.js.map