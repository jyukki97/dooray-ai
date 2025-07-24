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
exports.FileWatcher = void 0;
const vscode = __importStar(require("vscode"));
const logger_1 = require("../utils/logger");
/**
 * 파일 시스템 감시자
 */
class FileWatcher {
    constructor() {
        this.watchers = [];
        this.isWatching = false;
    }
    /**
     * 파일 감시 시작
     */
    startWatching() {
        try {
            logger_1.logger.info('👁️ 파일 감시 시작...');
            // .dooray-ai/ 디렉토리 감시
            const doorayWatcher = vscode.workspace.createFileSystemWatcher('**/.dooray-ai/**/*', false, // 생성 감시
            false, // 수정 감시
            false // 삭제 감시
            );
            doorayWatcher.onDidCreate(this.handleFileCreate.bind(this));
            doorayWatcher.onDidChange(this.handleFileChange.bind(this));
            doorayWatcher.onDidDelete(this.handleFileDelete.bind(this));
            this.watchers.push(doorayWatcher);
            // 설정 파일 감시
            const configWatcher = vscode.workspace.createFileSystemWatcher('**/.dooray-ai/config.json');
            configWatcher.onDidChange(this.handleConfigChange.bind(this));
            this.watchers.push(configWatcher);
            this.isWatching = true;
            logger_1.logger.info('✅ 파일 감시 시작됨');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`❌ 파일 감시 시작 실패: ${errorMessage}`);
        }
    }
    /**
     * 파일 생성 처리
     */
    handleFileCreate(uri) {
        logger_1.logger.debug(`📁 파일 생성됨: ${uri.fsPath}`);
        // TODO: 파일 생성 이벤트 처리 로직
    }
    /**
     * 파일 변경 처리
     */
    handleFileChange(uri) {
        logger_1.logger.debug(`📝 파일 변경됨: ${uri.fsPath}`);
        // TODO: 파일 변경 이벤트 처리 로직
    }
    /**
     * 파일 삭제 처리
     */
    handleFileDelete(uri) {
        logger_1.logger.debug(`🗑️ 파일 삭제됨: ${uri.fsPath}`);
        // TODO: 파일 삭제 이벤트 처리 로직
    }
    /**
     * 설정 파일 변경 처리
     */
    handleConfigChange(uri) {
        logger_1.logger.info(`⚙️ 설정 파일 변경됨: ${uri.fsPath}`);
        // TODO: 설정 파일 변경 시 자동 동기화 로직
        vscode.window.showInformationMessage('Dooray AI 설정이 변경되었습니다.');
    }
    /**
     * 파일 감시 정지
     */
    stopWatching() {
        if (this.watchers.length > 0) {
            logger_1.logger.info('🛑 파일 감시 정지 중...');
            this.watchers.forEach(watcher => watcher.dispose());
            this.watchers = [];
            this.isWatching = false;
            logger_1.logger.info('✅ 파일 감시 정지됨');
        }
    }
    /**
     * 감시 상태 확인
     */
    isFileWatching() {
        return this.isWatching;
    }
}
exports.FileWatcher = FileWatcher;
//# sourceMappingURL=fileWatcher.js.map