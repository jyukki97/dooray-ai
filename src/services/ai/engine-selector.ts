import { AIEngine, AIClient } from './types';
import { ClaudeCodeClient } from './claude-code-client';
import { configManager } from '../config';
import { authManager } from '../auth';
import { logger } from '../../utils/logger';

/**
 * AI 엔진 선택 설정
 */
export interface EngineSelectionConfig {
  preferredEngine: AIEngine;
  fallbackEnabled: boolean;
  autoSelect: boolean;
  selectionCriteria: {
    prioritizeAvailability: boolean;
    prioritizePerformance: boolean;
    prioritizeCost: boolean;
  };
}

/**
 * 엔진 상태 정보
 */
export interface EngineStatus {
  engine: AIEngine;
  available: boolean;
  authenticated: boolean;
  performance: number; // 0-100 점수
  cost: number; // 0-100 점수 (낮을수록 저렴)
  lastUsed?: Date;
  errorCount: number;
}

/**
 * AI 엔진 선택기
 */
export class EngineSelector {
  private engines: Map<AIEngine, EngineStatus> = new Map();
  private config: EngineSelectionConfig;
  
  constructor() {
    // 기본 설정
    this.config = {
      preferredEngine: AIEngine.CLAUDE_CODE,
      fallbackEnabled: true,
      autoSelect: true,
      selectionCriteria: {
        prioritizeAvailability: true,
        prioritizePerformance: false,
        prioritizeCost: true
      }
    };
    
    // 엔진 상태 초기화
    this.initializeEngineStatus();
  }
  
  /**
   * 엔진 상태 초기화
   */
  private initializeEngineStatus(): void {
    // Claude Code는 항상 기본으로 사용 가능 (CLI 기반)
    this.engines.set(AIEngine.CLAUDE_CODE, {
      engine: AIEngine.CLAUDE_CODE,
      available: true,
      authenticated: true, // API 키 불필요
      performance: 85,
      cost: 100, // 무료이므로 최고 점수
      errorCount: 0
    });
  }
  
  /**
   * 설정 로드
   */
  async loadConfig(): Promise<void> {
    try {
      const appConfig = await configManager.load();
      
      // 설정에서 엔진 선택 관련 정보 로드
      if (appConfig.ai) {
        // 현재는 Claude Code만 지원하므로 기본값 유지
        this.config.preferredEngine = AIEngine.CLAUDE_CODE;
      }
      
      logger.debug('Engine selector config loaded');
      
    } catch (error) {
      logger.warn('Failed to load engine selector config, using defaults');
    }
  }
  
  /**
   * 엔진 상태 업데이트
   */
  async updateEngineStatus(): Promise<void> {
    try {
      // Claude Code CLI 가용성 확인
      const claudeCodeStatus = await this.checkClaudeCodeStatus();
      this.engines.set(AIEngine.CLAUDE_CODE, claudeCodeStatus);
      
      logger.debug('Engine status updated');
      
    } catch (error) {
      logger.error('Failed to update engine status');
    }
  }
  
  /**
   * Claude Code 상태 확인
   */
  private async checkClaudeCodeStatus(): Promise<EngineStatus> {
    const currentStatus = this.engines.get(AIEngine.CLAUDE_CODE)!;
    
    try {
      // CLI 가용성 확인
      const isAvailable = await authManager.validateClaudeCode();
      
      return {
        ...currentStatus,
        available: isAvailable,
        authenticated: true, // API 키 불필요
        lastUsed: isAvailable ? new Date() : currentStatus.lastUsed
      };
      
    } catch (error) {
      return {
        ...currentStatus,
        available: false,
        errorCount: currentStatus.errorCount + 1
      };
    }
  }
  
  /**
   * 최적의 엔진 선택
   */
  async selectBestEngine(): Promise<AIEngine> {
    await this.updateEngineStatus();
    
    if (this.config.autoSelect) {
      return this.selectEngineAutomatically();
    } else {
      return this.config.preferredEngine;
    }
  }
  
  /**
   * 자동 엔진 선택
   */
  private selectEngineAutomatically(): AIEngine {
    const availableEngines = Array.from(this.engines.values())
      .filter(status => status.available && status.authenticated)
      .sort((a, b) => this.calculateEngineScore(b) - this.calculateEngineScore(a));
    
    if (availableEngines.length === 0) {
      logger.warn('No available engines found, using Claude Code as fallback');
      return AIEngine.CLAUDE_CODE;
    }
    
    const selectedEngine = availableEngines[0].engine;
    logger.info(`Auto-selected engine: ${selectedEngine}`);
    
    return selectedEngine;
  }
  
  /**
   * 엔진 점수 계산
   */
  private calculateEngineScore(status: EngineStatus): number {
    let score = 0;
    
    if (this.config.selectionCriteria.prioritizeAvailability) {
      score += status.available ? 40 : 0;
      score += status.authenticated ? 20 : 0;
    }
    
    if (this.config.selectionCriteria.prioritizePerformance) {
      score += status.performance * 0.2;
    }
    
    if (this.config.selectionCriteria.prioritizeCost) {
      score += status.cost * 0.2;
    }
    
    // 오류 횟수에 따른 페널티
    score -= status.errorCount * 5;
    
    // 선호하는 엔진에 보너스
    if (status.engine === this.config.preferredEngine) {
      score += 10;
    }
    
    return Math.max(0, score);
  }
  
  /**
   * 엔진 클라이언트 생성
   */
  createEngineClient(engine: AIEngine): AIClient {
    switch (engine) {
      case AIEngine.CLAUDE_CODE:
        return new ClaudeCodeClient();
      
      default:
        logger.warn(`Unsupported engine: ${engine}, falling back to Claude Code`);
        return new ClaudeCodeClient();
    }
  }
  
  /**
   * 최적의 클라이언트 생성
   */
  async createBestClient(): Promise<AIClient> {
    const selectedEngine = await this.selectBestEngine();
    return this.createEngineClient(selectedEngine);
  }
  
  /**
   * 엔진 상태 조회
   */
  getEngineStatus(engine?: AIEngine): EngineStatus | EngineStatus[] {
    if (engine) {
      return this.engines.get(engine) || {
        engine,
        available: false,
        authenticated: false,
        performance: 0,
        cost: 0,
        errorCount: 0
      };
    }
    
    return Array.from(this.engines.values());
  }
  
  /**
   * 사용 가능한 엔진 목록
   */
  getAvailableEngines(): AIEngine[] {
    return Array.from(this.engines.values())
      .filter(status => status.available && status.authenticated)
      .map(status => status.engine);
  }
  
  /**
   * 엔진 오류 보고
   */
  reportEngineError(engine: AIEngine, error: Error): void {
    const status = this.engines.get(engine);
    if (status) {
      status.errorCount += 1;
      logger.warn(`Engine error reported for ${engine}: ${error.message}`);
      
      // 오류가 많으면 일시적으로 비활성화
      if (status.errorCount >= 5) {
        status.available = false;
        logger.error(`Engine ${engine} temporarily disabled due to multiple errors`);
      }
    }
  }
  
  /**
   * 엔진 성공 보고
   */
  reportEngineSuccess(engine: AIEngine): void {
    const status = this.engines.get(engine);
    if (status) {
      status.lastUsed = new Date();
      status.errorCount = Math.max(0, status.errorCount - 1); // 성공하면 오류 카운트 감소
      
      // 비활성화된 엔진 재활성화
      if (!status.available && status.errorCount === 0) {
        status.available = true;
        logger.info(`Engine ${engine} reactivated after successful operation`);
      }
    }
  }
  
  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<EngineSelectionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Engine selector configuration updated');
  }
  
  /**
   * 상태 정보 표시
   */
  displayStatus(): void {
    console.log('\n🤖 AI Engine Status');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log(`📋 Current Configuration:`);
    console.log(`   Preferred Engine: ${this.config.preferredEngine}`);
    console.log(`   Auto Selection: ${this.config.autoSelect ? '✅' : '❌'}`);
    console.log(`   Fallback Enabled: ${this.config.fallbackEnabled ? '✅' : '❌'}`);
    
    console.log('\n🔍 Engine Status:');
    
    for (const status of this.engines.values()) {
      const availIcon = status.available ? '✅' : '❌';
      const authIcon = status.authenticated ? '🔑' : '🚫';
      
      console.log(`   ${availIcon} ${status.engine}:`);
      console.log(`      Available: ${status.available}`);
      console.log(`      Authenticated: ${status.authenticated}`);
      console.log(`      Performance: ${status.performance}/100`);
      console.log(`      Cost Score: ${status.cost}/100`);
      console.log(`      Error Count: ${status.errorCount}`);
      
      if (status.lastUsed) {
        console.log(`      Last Used: ${status.lastUsed.toLocaleString()}`);
      }
    }
    
    console.log(`\n💡 Selection Criteria:`);
    console.log(`   Prioritize Availability: ${this.config.selectionCriteria.prioritizeAvailability ? '✅' : '❌'}`);
    console.log(`   Prioritize Performance: ${this.config.selectionCriteria.prioritizePerformance ? '✅' : '❌'}`);
    console.log(`   Prioritize Cost: ${this.config.selectionCriteria.prioritizeCost ? '✅' : '❌'}`);
  }
}

/**
 * 글로벌 엔진 선택기 인스턴스
 */
export const engineSelector = new EngineSelector();