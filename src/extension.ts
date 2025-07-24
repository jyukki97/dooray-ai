import * as vscode from 'vscode';
import { DoorayAIExtension } from './extension/doorayAIExtension';
import { logger } from './utils/logger';

let extension: DoorayAIExtension | undefined;

/**
 * Extension 활성화 함수
 */
export function activate(context: vscode.ExtensionContext) {
  logger.info('🚀 Dooray AI Extension이 활성화되었습니다!');
  
  try {
    // DoorayAI Extension 인스턴스 생성
    extension = new DoorayAIExtension(context);
    
    // Extension 초기화
    extension.initialize();
    
    logger.info('✅ Dooray AI Extension 초기화 완료');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`❌ Extension 활성화 실패: ${errorMessage}`);
    
    vscode.window.showErrorMessage(
      `Dooray AI Extension 활성화에 실패했습니다: ${errorMessage}`
    );
  }
}

/**
 * Extension 비활성화 함수
 */
export function deactivate() {
  logger.info('🔌 Dooray AI Extension이 비활성화됩니다...');
  
  if (extension) {
    extension.dispose();
    extension = undefined;
  }
  
  logger.info('✅ Dooray AI Extension 비활성화 완료');
} 