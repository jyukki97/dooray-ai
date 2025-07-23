export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    SILENT = 4
}
export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: string;
    data?: any;
}
export declare class Logger {
    private static instance;
    private logLevel;
    private logFile?;
    private enableConsole;
    private enableFile;
    private constructor();
    static getInstance(): Logger;
    /**
     * 로거 설정
     */
    configure(options: {
        level?: LogLevel;
        enableConsole?: boolean;
        enableFile?: boolean;
        logFile?: string;
    }): void;
    /**
     * 기본 로그 파일 경로 설정
     */
    initializeFileLogging(): Promise<void>;
    /**
     * 디버그 로그
     */
    debug(message: string, context?: string, data?: any): void;
    /**
     * 정보 로그
     */
    info(message: string, context?: string, data?: any): void;
    /**
     * 경고 로그
     */
    warn(message: string, context?: string, data?: any): void;
    /**
     * 에러 로그
     */
    error(message: string, context?: string, data?: any): void;
    /**
     * 성공 메시지 (항상 표시)
     */
    success(message: string): void;
    /**
     * 실패 메시지 (항상 표시)
     */
    failure(message: string): void;
    /**
     * 진행 상황 표시
     */
    progress(message: string): void;
    /**
     * 내부 로그 처리
     */
    private log;
    /**
     * 콘솔에 로그 출력
     */
    private writeToConsole;
    /**
     * 파일에 로그 기록
     */
    private writeToFile;
    /**
     * 로그 레벨 파싱
     */
    private parseLogLevel;
}
export declare const logger: Logger;
//# sourceMappingURL=logger.d.ts.map