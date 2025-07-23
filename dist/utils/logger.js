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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = exports.LogLevel = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["SILENT"] = 4] = "SILENT";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor() {
        this.logLevel = LogLevel.INFO;
        this.enableConsole = true;
        this.enableFile = false;
        // 환경 변수로 로그 레벨 설정
        const envLogLevel = process.env['DOORAY_AI_LOG_LEVEL'];
        if (envLogLevel) {
            this.logLevel = this.parseLogLevel(envLogLevel);
        }
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    /**
     * 로거 설정
     */
    configure(options) {
        if (options.level !== undefined)
            this.logLevel = options.level;
        if (options.enableConsole !== undefined)
            this.enableConsole = options.enableConsole;
        if (options.enableFile !== undefined)
            this.enableFile = options.enableFile;
        if (options.logFile) {
            this.logFile = options.logFile;
            this.enableFile = true;
        }
    }
    /**
     * 기본 로그 파일 경로 설정
     */
    async initializeFileLogging() {
        if (!this.logFile) {
            const logDir = path.join(os.homedir(), '.dooray-ai', 'logs');
            await fs.ensureDir(logDir);
            this.logFile = path.join(logDir, `dooray-ai-${new Date().toISOString().split('T')[0]}.log`);
        }
    }
    /**
     * 디버그 로그
     */
    debug(message, context, data) {
        this.log(LogLevel.DEBUG, message, context, data);
    }
    /**
     * 정보 로그
     */
    info(message, context, data) {
        this.log(LogLevel.INFO, message, context, data);
    }
    /**
     * 경고 로그
     */
    warn(message, context, data) {
        this.log(LogLevel.WARN, message, context, data);
    }
    /**
     * 에러 로그
     */
    error(message, context, data) {
        this.log(LogLevel.ERROR, message, context, data);
    }
    /**
     * 성공 메시지 (항상 표시)
     */
    success(message) {
        if (this.enableConsole) {
            console.log(chalk_1.default.green('✅ ' + message));
        }
        this.log(LogLevel.INFO, `SUCCESS: ${message}`);
    }
    /**
     * 실패 메시지 (항상 표시)
     */
    failure(message) {
        if (this.enableConsole) {
            console.log(chalk_1.default.red('❌ ' + message));
        }
        this.log(LogLevel.ERROR, `FAILURE: ${message}`);
    }
    /**
     * 진행 상황 표시
     */
    progress(message) {
        if (this.enableConsole) {
            console.log(chalk_1.default.blue('🔄 ' + message));
        }
        this.log(LogLevel.INFO, `PROGRESS: ${message}`);
    }
    /**
     * 내부 로그 처리
     */
    log(level, message, context, data) {
        if (level < this.logLevel)
            return;
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...(context && { context }),
            ...(data && { data }),
        };
        // 콘솔 출력
        if (this.enableConsole) {
            this.writeToConsole(entry);
        }
        // 파일 출력
        if (this.enableFile && this.logFile) {
            this.writeToFile(entry).catch(err => {
                console.error('Failed to write to log file:', err);
            });
        }
    }
    /**
     * 콘솔에 로그 출력
     */
    writeToConsole(entry) {
        const timestamp = chalk_1.default.gray(entry.timestamp);
        const context = entry.context ? chalk_1.default.cyan(`[${entry.context}]`) : '';
        let levelStr = '';
        let coloredMessage = entry.message;
        switch (entry.level) {
            case LogLevel.DEBUG:
                levelStr = chalk_1.default.magenta('DEBUG');
                coloredMessage = chalk_1.default.gray(entry.message);
                break;
            case LogLevel.INFO:
                levelStr = chalk_1.default.blue('INFO ');
                break;
            case LogLevel.WARN:
                levelStr = chalk_1.default.yellow('WARN ');
                coloredMessage = chalk_1.default.yellow(entry.message);
                break;
            case LogLevel.ERROR:
                levelStr = chalk_1.default.red('ERROR');
                coloredMessage = chalk_1.default.red(entry.message);
                break;
        }
        const logLine = `${timestamp} ${levelStr} ${context} ${coloredMessage}`;
        console.log(logLine);
        if (entry.data) {
            console.log(chalk_1.default.gray(JSON.stringify(entry.data, null, 2)));
        }
    }
    /**
     * 파일에 로그 기록
     */
    async writeToFile(entry) {
        if (!this.logFile)
            return;
        const logLine = `${entry.timestamp} [${LogLevel[entry.level]}] ${entry.context ? `[${entry.context}] ` : ''}${entry.message}${entry.data ? ' ' + JSON.stringify(entry.data) : ''}\n`;
        await fs.appendFile(this.logFile, logLine);
    }
    /**
     * 로그 레벨 파싱
     */
    parseLogLevel(level) {
        switch (level.toUpperCase()) {
            case 'DEBUG':
                return LogLevel.DEBUG;
            case 'INFO':
                return LogLevel.INFO;
            case 'WARN':
                return LogLevel.WARN;
            case 'ERROR':
                return LogLevel.ERROR;
            case 'SILENT':
                return LogLevel.SILENT;
            default:
                return LogLevel.INFO;
        }
    }
}
exports.Logger = Logger;
// 전역 로거 인스턴스
exports.logger = Logger.getInstance();
//# sourceMappingURL=logger.js.map