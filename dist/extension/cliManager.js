"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIManager = void 0;
const logger_1 = require("../utils/logger");
/**
 * CLI 통신 관리자
 */
class CLIManager {
    constructor(outputChannel) {
        this.cliProcess = null;
        this.isConnected = false;
        this.outputChannel = outputChannel;
        logger_1.logger.debug(`CLI 매니저 초기화 (출력 채널: ${outputChannel.name})`);
    }
    /**
     * CLI 연결
     */
    async connect() {
        try {
            logger_1.logger.info('🔌 CLI 연결 시도 중...');
            // TODO: 실제 CLI 연결 로직 구현
            this.isConnected = true;
            logger_1.logger.info('✅ CLI 연결 성공');
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`❌ CLI 연결 실패: ${errorMessage}`);
            return false;
        }
    }
    /**
     * CLI 명령 실행
     */
    async executeCommand(command, args = []) {
        return new Promise((resolve, reject) => {
            try {
                logger_1.logger.debug(`🔧 CLI 명령 실행: ${command} ${args.join(' ')}`);
                this.outputChannel.appendLine(`[CLI] ${command} ${args.join(' ')}`);
                // TODO: 실제 명령 실행 로직 구현
                const result = 'CLI 명령 실행 완료';
                this.outputChannel.appendLine(`[CLI] ${result}`);
                resolve(result);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                logger_1.logger.error(`❌ CLI 명령 실행 실패: ${errorMessage}`);
                this.outputChannel.appendLine(`[CLI ERROR] ${errorMessage}`);
                reject(error);
            }
        });
    }
    /**
     * 연결 상태 확인
     */
    isCliConnected() {
        return this.isConnected;
    }
    /**
     * 리소스 정리
     */
    dispose() {
        if (this.cliProcess) {
            this.cliProcess.kill();
            this.cliProcess = null;
        }
        this.isConnected = false;
    }
}
exports.CLIManager = CLIManager;
//# sourceMappingURL=cliManager.js.map