import * as vscode from 'vscode';
import { logger } from '../utils/logger';

/**
 * 파일 시스템 감시자
 */
export class FileWatcher {
  private watchers: vscode.FileSystemWatcher[] = [];
  private isWatching: boolean = false;

  /**
   * 파일 감시 시작
   */
  public startWatching(): void {
    try {
      logger.info('👁️ 파일 감시 시작...');
      
      // .dooray-ai/ 디렉토리 감시
      const doorayWatcher = vscode.workspace.createFileSystemWatcher(
        '**/.dooray-ai/**/*',
        false, // 생성 감시
        false, // 수정 감시
        false  // 삭제 감시
      );
      
      doorayWatcher.onDidCreate(this.handleFileCreate.bind(this));
      doorayWatcher.onDidChange(this.handleFileChange.bind(this));
      doorayWatcher.onDidDelete(this.handleFileDelete.bind(this));
      
      this.watchers.push(doorayWatcher);
      
      // 설정 파일 감시
      const configWatcher = vscode.workspace.createFileSystemWatcher(
        '**/.dooray-ai/config.json'
      );
      
      configWatcher.onDidChange(this.handleConfigChange.bind(this));
      this.watchers.push(configWatcher);
      
      this.isWatching = true;
      logger.info('✅ 파일 감시 시작됨');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`❌ 파일 감시 시작 실패: ${errorMessage}`);
    }
  }

  /**
   * 파일 생성 처리
   */
  private handleFileCreate(uri: vscode.Uri): void {
    logger.debug(`📁 파일 생성됨: ${uri.fsPath}`);
    // TODO: 파일 생성 이벤트 처리 로직
  }

  /**
   * 파일 변경 처리
   */
  private handleFileChange(uri: vscode.Uri): void {
    logger.debug(`📝 파일 변경됨: ${uri.fsPath}`);
    // TODO: 파일 변경 이벤트 처리 로직
  }

  /**
   * 파일 삭제 처리
   */
  private handleFileDelete(uri: vscode.Uri): void {
    logger.debug(`🗑️ 파일 삭제됨: ${uri.fsPath}`);
    // TODO: 파일 삭제 이벤트 처리 로직
  }

  /**
   * 설정 파일 변경 처리
   */
  private handleConfigChange(uri: vscode.Uri): void {
    logger.info(`⚙️ 설정 파일 변경됨: ${uri.fsPath}`);
    // TODO: 설정 파일 변경 시 자동 동기화 로직
    vscode.window.showInformationMessage('Dooray AI 설정이 변경되었습니다.');
  }

  /**
   * 파일 감시 정지
   */
  public stopWatching(): void {
    if (this.watchers.length > 0) {
      logger.info('🛑 파일 감시 정지 중...');
      
      this.watchers.forEach(watcher => watcher.dispose());
      this.watchers = [];
      this.isWatching = false;
      
      logger.info('✅ 파일 감시 정지됨');
    }
  }

  /**
   * 감시 상태 확인
   */
  public isFileWatching(): boolean {
    return this.isWatching;
  }
} 