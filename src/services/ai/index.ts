/**
 * AI 서비스 모듈 인덱스
 */

// 타입과 인터페이스
export * from './types';

// Claude 클라이언트
export { ClaudeClient } from './claude-client';

// AI 클라이언트 팩토리
import { ClaudeClient } from './claude-client';
import { AIEngine, AIClient, AIConfig, AIError } from './types';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

/**
 * AI 클라이언트 팩토리
 */
export class AIClientFactory {
  /**
   * 설정에 따라 적절한 AI 클라이언트 생성
   */
  static createClient(config?: Partial<AIConfig>): AIClient {
    const engine = config?.engine || env.defaultAiEngine as AIEngine;
    const apiKey = config?.apiKey;

    logger.info(`Creating AI client for engine: ${engine}`);

    switch (engine) {
      case AIEngine.CLAUDE_CODE:
      case AIEngine.ANTHROPIC:
        return new ClaudeClient(apiKey);
      
      case AIEngine.OPENAI:
        throw new AIError(
          'OpenAI client not yet implemented',
          'CLIENT_NOT_IMPLEMENTED',
          AIEngine.OPENAI
        );
      
      default:
        throw new AIError(
          `Unsupported AI engine: ${engine}`,
          'UNSUPPORTED_ENGINE',
          engine
        );
    }
  }

  /**
   * 기본 클라이언트 생성 (설정에서 기본 엔진 사용)
   */
  static createDefaultClient(): AIClient {
    return this.createClient();
  }

  /**
   * 사용 가능한 AI 엔진 목록 반환
   */
  static getAvailableEngines(): AIEngine[] {
    const engines: AIEngine[] = [];

    // Claude API 키가 있으면 추가
    if (env.claudeApiKey) {
      engines.push(AIEngine.CLAUDE_CODE);
    }

    // OpenAI API 키가 있으면 추가 (미구현)
    if (env.openaiApiKey) {
      engines.push(AIEngine.OPENAI);
    }

    return engines;
  }

  /**
   * 모든 설정된 클라이언트의 연결 상태 확인
   */
  static async validateAllConnections(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    const availableEngines = this.getAvailableEngines();

    for (const engine of availableEngines) {
      try {
        const client = this.createClient({ engine });
        results[engine] = await client.validateConnection();
             } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Unknown error';
         logger.error(`Failed to validate ${engine}: ${errorMessage}`);
         results[engine] = false;
       }
    }

    return results;
  }
}

/**
 * 기본 AI 클라이언트 인스턴스 (싱글톤)
 */
let defaultClient: AIClient | null = null;

export function getDefaultAIClient(): AIClient {
  if (!defaultClient) {
    defaultClient = AIClientFactory.createDefaultClient();
  }
  return defaultClient;
}

/**
 * 기본 클라이언트 재설정
 */
export function resetDefaultAIClient(): void {
  defaultClient = null;
} 