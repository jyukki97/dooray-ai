import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private logFile?: string;
  private enableConsole: boolean = true;
  private enableFile: boolean = false;

  private constructor() {
    // 환경 변수로 로그 레벨 설정
    const envLogLevel = process.env['DOORAY_AI_LOG_LEVEL'];
    if (envLogLevel) {
      this.logLevel = this.parseLogLevel(envLogLevel);
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * 로거 설정
   */
  public configure(options: {
    level?: LogLevel;
    enableConsole?: boolean;
    enableFile?: boolean;
    logFile?: string;
  }): void {
    if (options.level !== undefined) this.logLevel = options.level;
    if (options.enableConsole !== undefined) this.enableConsole = options.enableConsole;
    if (options.enableFile !== undefined) this.enableFile = options.enableFile;
    if (options.logFile) {
      this.logFile = options.logFile;
      this.enableFile = true;
    }
  }

  /**
   * 기본 로그 파일 경로 설정
   */
  public async initializeFileLogging(): Promise<void> {
    if (!this.logFile) {
      const logDir = path.join(os.homedir(), '.dooray-ai', 'logs');
      await fs.ensureDir(logDir);
      this.logFile = path.join(logDir, `dooray-ai-${new Date().toISOString().split('T')[0]}.log`);
    }
  }

  /**
   * 디버그 로그
   */
  public debug(message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  /**
   * 정보 로그
   */
  public info(message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  /**
   * 경고 로그
   */
  public warn(message: string, context?: string, data?: any): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  /**
   * 에러 로그
   */
  public error(message: string, context?: string, data?: any): void {
    this.log(LogLevel.ERROR, message, context, data);
  }

  /**
   * 성공 메시지 (항상 표시)
   */
  public success(message: string): void {
    if (this.enableConsole) {
      console.log(chalk.green('✅ ' + message));
    }
    this.log(LogLevel.INFO, `SUCCESS: ${message}`);
  }

  /**
   * 실패 메시지 (항상 표시)
   */
  public failure(message: string): void {
    if (this.enableConsole) {
      console.log(chalk.red('❌ ' + message));
    }
    this.log(LogLevel.ERROR, `FAILURE: ${message}`);
  }

  /**
   * 진행 상황 표시
   */
  public progress(message: string): void {
    if (this.enableConsole) {
      console.log(chalk.blue('🔄 ' + message));
    }
    this.log(LogLevel.INFO, `PROGRESS: ${message}`);
  }

  /**
   * 내부 로그 처리
   */
  private log(level: LogLevel, message: string, context?: string, data?: any): void {
    if (level < this.logLevel) return;

    const entry: LogEntry = {
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
  private writeToConsole(entry: LogEntry): void {
    const timestamp = chalk.gray(entry.timestamp);
    const context = entry.context ? chalk.cyan(`[${entry.context}]`) : '';
    let levelStr = '';
    let coloredMessage = entry.message;

    switch (entry.level) {
      case LogLevel.DEBUG:
        levelStr = chalk.magenta('DEBUG');
        coloredMessage = chalk.gray(entry.message);
        break;
      case LogLevel.INFO:
        levelStr = chalk.blue('INFO ');
        break;
      case LogLevel.WARN:
        levelStr = chalk.yellow('WARN ');
        coloredMessage = chalk.yellow(entry.message);
        break;
      case LogLevel.ERROR:
        levelStr = chalk.red('ERROR');
        coloredMessage = chalk.red(entry.message);
        break;
    }

    const logLine = `${timestamp} ${levelStr} ${context} ${coloredMessage}`;
    console.log(logLine);

    if (entry.data) {
      console.log(chalk.gray(JSON.stringify(entry.data, null, 2)));
    }
  }

  /**
   * 파일에 로그 기록
   */
  private async writeToFile(entry: LogEntry): Promise<void> {
    if (!this.logFile) return;

    const logLine = `${entry.timestamp} [${LogLevel[entry.level]}] ${entry.context ? `[${entry.context}] ` : ''}${entry.message}${
      entry.data ? ' ' + JSON.stringify(entry.data) : ''
    }\n`;

    await fs.appendFile(this.logFile, logLine);
  }

  /**
   * 로그 레벨 파싱
   */
  private parseLogLevel(level: string): LogLevel {
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

// 전역 로거 인스턴스
export const logger = Logger.getInstance(); 