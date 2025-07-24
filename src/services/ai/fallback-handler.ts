import { AIEngine, AIClient, CodeGenerationRequest, CodeGenerationResponse, AIError } from './types';
import { engineSelector } from './engine-selector';
import { logger } from '../../utils/logger';

/**
 * 폴백 옵션
 */
export interface FallbackOptions {
  maxRetries: number;
  retryDelay: number; // milliseconds
  enableFallback: boolean;
  fallbackEngines: AIEngine[];
  timeoutMs: number;
}

/**
 * 폴백 시도 정보
 */
export interface FallbackAttempt {
  engine: AIEngine;
  attempt: number;
  error?: Error;
  success: boolean;
  responseTime: number;
  timestamp: Date;
}

/**
 * 폴백 핸들러
 */
export class FallbackHandler {
  private defaultOptions: FallbackOptions = {
    maxRetries: 3,
    retryDelay: 1000,
    enableFallback: true,
    fallbackEngines: [AIEngine.CLAUDE_CODE],
    timeoutMs: 30000
  };
  
  /**
   * 폴백을 포함한 코드 생성 실행
   */
  async executeWithFallback(
    request: CodeGenerationRequest,
    options: Partial<FallbackOptions> = {}
  ): Promise<CodeGenerationResponse> {
    const config = { ...this.defaultOptions, ...options };
    const attempts: FallbackAttempt[] = [];
    
    // 최적의 엔진 선택
    let primaryEngine = await engineSelector.selectBestEngine();
    let availableEngines = [primaryEngine, ...config.fallbackEngines];
    
    // 중복 제거
    availableEngines = [...new Set(availableEngines)];
    
    logger.info(`Starting code generation with fallback. Available engines: ${availableEngines.join(', ')}`);
    
    for (const engine of availableEngines) {
      const maxAttemptsForEngine = engine === primaryEngine ? config.maxRetries : 1;
      
      for (let attempt = 1; attempt <= maxAttemptsForEngine; attempt++) {
        const attemptInfo: FallbackAttempt = {
          engine,
          attempt,
          success: false,
          responseTime: 0,
          timestamp: new Date()
        };
        
        try {
          logger.debug(`Attempting code generation with ${engine} (attempt ${attempt}/${maxAttemptsForEngine})`);
          
          const startTime = Date.now();
          const client = engineSelector.createEngineClient(engine);
          
          // 타임아웃 설정
          const result = await this.executeWithTimeout(
            () => client.generateCode(request),
            config.timeoutMs
          );
          
          attemptInfo.responseTime = Date.now() - startTime;
          attemptInfo.success = true;
          attempts.push(attemptInfo);
          
          // 성공 보고
          engineSelector.reportEngineSuccess(engine);
          
          logger.success(`Code generation successful with ${engine} (attempt ${attempt}, ${attemptInfo.responseTime}ms)`);
          
          // 시도 정보를 메타데이터에 추가
          result.metadata.fallbackAttempts = attempts;
          
          return result;
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          attemptInfo.error = error instanceof Error ? error : new Error(errorMessage);
          attemptInfo.responseTime = Date.now() - Date.now();
          attempts.push(attemptInfo);
          
          // 오류 보고
          engineSelector.reportEngineError(engine, attemptInfo.error);
          
          logger.warn(`Code generation failed with ${engine} (attempt ${attempt}/${maxAttemptsForEngine}): ${errorMessage}`);
          
          // 마지막 시도가 아니면 잠시 대기
          if (attempt < maxAttemptsForEngine) {
            await this.delay(config.retryDelay);
          }
        }
      }
    }
    
    // 모든 시도가 실패한 경우
    const lastError = attempts[attempts.length - 1]?.error;
    const errorMessage = `All engines failed after ${attempts.length} attempts`;
    
    logger.error(errorMessage);
    
    throw new AIError(
      errorMessage,
      'ALL_ENGINES_FAILED',
      primaryEngine
    );
  }
  
  /**
   * 특정 엔진으로만 실행 (폴백 없음)
   */
  async executeWithEngine(
    engine: AIEngine,
    request: CodeGenerationRequest,
    options: Partial<FallbackOptions> = {}
  ): Promise<CodeGenerationResponse> {
    const config = { ...this.defaultOptions, ...options };
    const attempts: FallbackAttempt[] = [];
    
    logger.info(`Executing code generation with specific engine: ${engine}`);
    
    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      const attemptInfo: FallbackAttempt = {
        engine,
        attempt,
        success: false,
        responseTime: 0,
        timestamp: new Date()
      };
      
      try {
        logger.debug(`Attempting with ${engine} (attempt ${attempt}/${config.maxRetries})`);
        
        const startTime = Date.now();
        const client = engineSelector.createEngineClient(engine);
        
        const result = await this.executeWithTimeout(
          () => client.generateCode(request),
          config.timeoutMs
        );
        
        attemptInfo.responseTime = Date.now() - startTime;
        attemptInfo.success = true;
        attempts.push(attemptInfo);
        
        engineSelector.reportEngineSuccess(engine);
        
        logger.success(`Code generation successful with ${engine} (${attemptInfo.responseTime}ms)`);
        
        result.metadata.fallbackAttempts = attempts;
        return result;
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        attemptInfo.error = error instanceof Error ? error : new Error(errorMessage);
        attemptInfo.responseTime = Date.now() - Date.now();
        attempts.push(attemptInfo);
        
        engineSelector.reportEngineError(engine, attemptInfo.error);
        
        logger.warn(`Attempt ${attempt} failed with ${engine}: ${errorMessage}`);
        
        if (attempt < config.maxRetries) {
          await this.delay(config.retryDelay);
        }
      }
    }
    
    const lastError = attempts[attempts.length - 1]?.error;
    const errorMessage = `Engine ${engine} failed after ${attempts.length} attempts`;
    
    logger.error(errorMessage);
    
    throw new AIError(
      errorMessage,
      'ENGINE_FAILED',
      engine
    );
  }
  
  /**
   * 타임아웃을 포함한 실행
   */
  private async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      
      operation()
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }
  
  /**
   * 지연 함수
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * 폴백 통계 조회
   */
  analyzeFallbackAttempts(attempts: FallbackAttempt[]): {
    totalAttempts: number;
    successfulAttempts: number;
    failedAttempts: number;
    averageResponseTime: number;
    engineUsage: Record<string, number>;
    mostReliableEngine: AIEngine | null;
  } {
    const successful = attempts.filter(a => a.success);
    const failed = attempts.filter(a => !a.success);
    
    const engineUsage: Record<string, number> = {};
    attempts.forEach(attempt => {
      engineUsage[attempt.engine] = (engineUsage[attempt.engine] || 0) + 1;
    });
    
    const avgResponseTime = successful.length > 0
      ? successful.reduce((sum, a) => sum + a.responseTime, 0) / successful.length
      : 0;
    
    // 가장 신뢰할 수 있는 엔진 찾기 (성공률 기준)
    const engineSuccessRates = new Map<AIEngine, number>();
    
    for (const engine of Object.keys(engineUsage) as AIEngine[]) {
      const engineAttempts = attempts.filter(a => a.engine === engine);
      const engineSuccesses = engineAttempts.filter(a => a.success);
      const successRate = engineSuccesses.length / engineAttempts.length;
      engineSuccessRates.set(engine, successRate);
    }
    
    const mostReliableEngine = Array.from(engineSuccessRates.entries())
      .sort(([, a], [, b]) => b - a)[0]?.[0] || null;
    
    return {
      totalAttempts: attempts.length,
      successfulAttempts: successful.length,
      failedAttempts: failed.length,
      averageResponseTime: Math.round(avgResponseTime),
      engineUsage,
      mostReliableEngine
    };
  }
  
  /**
   * 엔진 건강도 체크
   */
  async performHealthCheck(): Promise<Record<AIEngine, boolean>> {
    const results: Record<AIEngine, boolean> = {
      [AIEngine.CLAUDE_CODE]: false
    };
    const availableEngines = engineSelector.getAvailableEngines();
    
    logger.info('Performing engine health check...');
    
    for (const engine of availableEngines) {
      try {
        const client = engineSelector.createEngineClient(engine);
        
        // 간단한 테스트 요청
        const testRequest: CodeGenerationRequest = {
          prompt: 'console.log("health check");',
          language: 'javascript',
          maxTokens: 50
        };
        
        await this.executeWithTimeout(
          () => client.generateCode(testRequest),
          5000 // 5초 타임아웃
        );
        
        results[engine] = true;
        engineSelector.reportEngineSuccess(engine);
        logger.success(`Health check passed for ${engine}`);
        
      } catch (error) {
        results[engine] = false;
        engineSelector.reportEngineError(engine, error instanceof Error ? error : new Error('Health check failed'));
        logger.warn(`Health check failed for ${engine}`);
      }
    }
    
    return results;
  }
  
  /**
   * 폴백 리포트 생성
   */
  generateFallbackReport(attempts: FallbackAttempt[]): string {
    const analysis = this.analyzeFallbackAttempts(attempts);
    
    let report = '\n📊 Fallback Execution Report\n';
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    report += `📈 Total Attempts: ${analysis.totalAttempts}\n`;
    report += `✅ Successful: ${analysis.successfulAttempts}\n`;
    report += `❌ Failed: ${analysis.failedAttempts}\n`;
    report += `⏱️  Average Response Time: ${analysis.averageResponseTime}ms\n`;
    
    if (analysis.mostReliableEngine) {
      report += `🏆 Most Reliable Engine: ${analysis.mostReliableEngine}\n`;
    }
    
    report += '\n🔧 Engine Usage:\n';
    for (const [engine, count] of Object.entries(analysis.engineUsage)) {
      report += `   ${engine}: ${count} attempts\n`;
    }
    
    report += '\n📋 Attempt Details:\n';
    attempts.forEach((attempt, index) => {
      const status = attempt.success ? '✅' : '❌';
      const time = attempt.success ? `${attempt.responseTime}ms` : 'failed';
      report += `   ${index + 1}. ${status} ${attempt.engine} (attempt ${attempt.attempt}) - ${time}\n`;
      
      if (attempt.error) {
        report += `      Error: ${attempt.error.message}\n`;
      }
    });
    
    return report;
  }
}

/**
 * 글로벌 폴백 핸들러 인스턴스
 */
export const fallbackHandler = new FallbackHandler();