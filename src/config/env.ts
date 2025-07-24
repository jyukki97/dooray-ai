import { logger } from '../utils/logger';

/**
 * 환경 변수 설정 (Claude Code 전용, API 키 불필요)
 */
export interface EnvironmentConfig {
  // 애플리케이션 설정
  nodeEnv: string;
  logLevel: string;
  
  // AI 설정 (Claude Code 전용)
  defaultAiEngine: string;
  maxTokens: number;
  requestTimeout: number;
}

/**
 * 선택적 환경 변수와 기본값
 */
const DEFAULT_ENV_VARS = {
  LOG_LEVEL: 'info',
  DEFAULT_AI_ENGINE: 'claude-code',
  MAX_TOKENS: '4000',
  REQUEST_TIMEOUT: '30000'
};

/**
 * 환경 변수 파싱 및 반환
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  return {
    // 애플리케이션 설정
    nodeEnv: process.env['NODE_ENV'] || 'development',
    logLevel: process.env['LOG_LEVEL'] || DEFAULT_ENV_VARS.LOG_LEVEL,
    
    // AI 설정 (Claude Code 전용)
    defaultAiEngine: process.env['DEFAULT_AI_ENGINE'] || DEFAULT_ENV_VARS.DEFAULT_AI_ENGINE,
    maxTokens: parseInt(process.env['MAX_TOKENS'] || DEFAULT_ENV_VARS.MAX_TOKENS, 10),
    requestTimeout: parseInt(process.env['REQUEST_TIMEOUT'] || DEFAULT_ENV_VARS.REQUEST_TIMEOUT, 10)
  };
}

/**
 * 환경 변수 정보 표시
 */
export function displayEnvironmentInfo(): void {
  const config = getEnvironmentConfig();
  
  logger.info('Environment Configuration (Claude Code):');
  logger.info(`  Node Environment: ${config.nodeEnv}`);
  logger.info(`  Log Level: ${config.logLevel}`);
  logger.info(`  AI Engine: ${config.defaultAiEngine} (no API key required)`);
  logger.info(`  Max Tokens: ${config.maxTokens}`);
  logger.info(`  Request Timeout: ${config.requestTimeout}ms`);
  logger.info(`  Claude Code CLI: Required for AI functionality`);
}

// 전역 환경 설정 인스턴스
export const env = getEnvironmentConfig();