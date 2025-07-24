/**
 * AI 서비스 모듈 인덱스 (Claude Code 전용)
 */

// 타입과 인터페이스
export * from './types';

// Claude Code 클라이언트
export { ClaudeCodeClient } from './claude-code-client';

// 고급 AI 서비스
export { codeGenerator } from './code-generator';
export { engineSelector } from './engine-selector';
export { fallbackHandler } from './fallback-handler';

// AI 클라이언트 팩토리
import { ClaudeCodeClient } from './claude-code-client';
import { engineSelector } from './engine-selector';
import { AIEngine, AIClient, AIConfig, AIError } from './types';
import { logger } from '../../utils/logger';

/**
 * AI 클라이언트 팩토리 (Claude Code 전용)
 */
export class AIClientFactory {
  /**
   * Claude Code 클라이언트 생성
   */
  static createClient(config?: Partial<AIConfig>): AIClient {
    const engine = config?.engine || AIEngine.CLAUDE_CODE;

    logger.info(`Creating AI client for engine: ${engine}`);

    if (engine !== AIEngine.CLAUDE_CODE) {
      throw new AIError(
        `Only Claude Code is supported. Unsupported engine: ${engine}`,
        'UNSUPPORTED_ENGINE',
        engine
      );
    }

    logger.info('Using Claude Code CLI client (no API key required)');
    return new ClaudeCodeClient();
  }

  /**
   * 기본 클라이언트 생성 (엔진 선택기 사용)
   */
  static async createDefaultClient(): Promise<AIClient> {
    return await engineSelector.createBestClient();
  }

  /**
   * 사용 가능한 AI 엔진 목록 반환
   */
  static getAvailableEngines(): AIEngine[] {
    return [AIEngine.CLAUDE_CODE];
  }

  /**
   * Claude Code CLI 연결 상태 확인
   */
  static async validateConnection(): Promise<boolean> {
    try {
      const client = this.createClient();
      return await client.validateConnection();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to validate Claude Code: ${errorMessage}`);
      return false;
    }
  }
}

/**
 * 기본 AI 클라이언트 인스턴스 (싱글톤)
 */
let defaultClient: AIClient | null = null;

export async function getDefaultAIClient(): Promise<AIClient> {
  if (!defaultClient) {
    defaultClient = await AIClientFactory.createDefaultClient();
  }
  return defaultClient;
}

/**
 * 기본 클라이언트 재설정
 */
export function resetDefaultAIClient(): void {
  defaultClient = null;
}