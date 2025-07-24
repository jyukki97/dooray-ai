import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { logger } from '../../utils/logger';

/**
 * 설정 파일 구조 정의
 */
export interface DoorayAIConfig {
  // 프로젝트 설정
  project: {
    name?: string;
    description?: string;
    version?: string;
  };
  
  // AI 설정
  ai: {
    engine: 'claude-code';
    maxTokens: number;
    temperature: number;
    timeout: number;
  };
  
  // Git 설정
  git: {
    defaultBranch: string;
    autoCommit: boolean;
    commitMessageTemplate: string;
  };
  
  // Dooray 설정
  dooray?: {
    projectId?: string;
    apiUrl?: string;
  };
  
  // GitHub 설정
  github?: {
    username?: string;
    repository?: string;
  };
  
  // 사용자 기본 설정
  preferences: {
    language: 'ko' | 'en';
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    colorOutput: boolean;
  };
  
  // 메타데이터
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
  };
}

/**
 * 기본 설정값
 */
const DEFAULT_CONFIG: DoorayAIConfig = {
  project: {
    name: '',
    description: '',
    version: '1.0.0'
  },
  ai: {
    engine: 'claude-code',
    maxTokens: 4000,
    temperature: 0.7,
    timeout: 30000
  },
  git: {
    defaultBranch: 'main',
    autoCommit: false,
    commitMessageTemplate: 'feat: {description}\n\n🤖 Generated with dooray-ai'
  },
  preferences: {
    language: 'ko',
    logLevel: 'info',
    colorOutput: true
  },
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0'
  }
};

/**
 * 설정 파일 관리자
 */
export class ConfigManager {
  private configDir: string;
  private configFile: string;
  private globalConfigDir: string;
  private globalConfigFile: string;
  
  constructor() {
    // 프로젝트 설정 파일 (.dooray-ai/config.json)
    this.configDir = path.join(process.cwd(), '.dooray-ai');
    this.configFile = path.join(this.configDir, 'config.json');
    
    // 글로벌 설정 파일 (~/.dooray-ai/config.json)
    this.globalConfigDir = path.join(os.homedir(), '.dooray-ai');
    this.globalConfigFile = path.join(this.globalConfigDir, 'config.json');
  }
  
  /**
   * 설정 파일 초기화
   */
  async initialize(force: boolean = false): Promise<void> {
    logger.info('Initializing dooray-ai configuration...');
    
    try {
      // 디렉토리 생성
      await fs.ensureDir(this.configDir);
      await fs.ensureDir(this.globalConfigDir);
      
      // 프로젝트 설정 파일 생성
      if (!await fs.pathExists(this.configFile) || force) {
        const projectConfig = { ...DEFAULT_CONFIG };
        
        // 프로젝트 정보 자동 감지
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        if (await fs.pathExists(packageJsonPath)) {
          try {
            const packageJson = await fs.readJSON(packageJsonPath);
            projectConfig.project.name = packageJson.name || '';
            projectConfig.project.description = packageJson.description || '';
            projectConfig.project.version = packageJson.version || '1.0.0';
          } catch (error) {
            logger.warn('Failed to read package.json');
          }
        }
        
        await fs.writeJSON(this.configFile, projectConfig, { spaces: 2 });
        logger.success(`Created project config: ${this.configFile}`);
      }
      
      // 글로벌 설정 파일 생성
      if (!await fs.pathExists(this.globalConfigFile) || force) {
        const globalConfig = { ...DEFAULT_CONFIG };
        globalConfig.project = {}; // 글로벌에는 프로젝트 정보 없음
        
        await fs.writeJSON(this.globalConfigFile, globalConfig, { spaces: 2 });
        logger.success(`Created global config: ${this.globalConfigFile}`);
      }
      
      logger.success('Configuration initialized successfully');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to initialize configuration: ${errorMessage}`);
      throw error;
    }
  }
  
  /**
   * 설정 로드 (프로젝트 우선, 글로벌 fallback)
   */
  async load(): Promise<DoorayAIConfig> {
    try {
      let config: DoorayAIConfig;
      
      // 프로젝트 설정 우선
      if (await fs.pathExists(this.configFile)) {
        config = await fs.readJSON(this.configFile);
        logger.debug('Loaded project configuration');
      } else if (await fs.pathExists(this.globalConfigFile)) {
        config = await fs.readJSON(this.globalConfigFile);
        logger.debug('Loaded global configuration');
      } else {
        // 설정 파일이 없으면 기본값 사용
        config = { ...DEFAULT_CONFIG };
        logger.warn('No configuration found, using defaults');
      }
      
      // 기본값과 병합 (누락된 필드 채우기)
      config = this.mergeWithDefaults(config);
      
      return config;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to load configuration: ${errorMessage}`);
      return { ...DEFAULT_CONFIG };
    }
  }
  
  /**
   * 설정 저장
   */
  async save(config: Partial<DoorayAIConfig>, global: boolean = false): Promise<void> {
    try {
      const targetFile = global ? this.globalConfigFile : this.configFile;
      
      // 기존 설정 로드
      let existingConfig: DoorayAIConfig;
      if (await fs.pathExists(targetFile)) {
        existingConfig = await fs.readJSON(targetFile);
      } else {
        existingConfig = { ...DEFAULT_CONFIG };
      }
      
      // 설정 병합
      const updatedConfig = this.deepMerge(existingConfig, config);
      updatedConfig.metadata.updatedAt = new Date().toISOString();
      
      // 설정 검증
      this.validateConfig(updatedConfig);
      
      // 파일 저장
      await fs.writeJSON(targetFile, updatedConfig, { spaces: 2 });
      
      const scope = global ? 'global' : 'project';
      logger.success(`Configuration saved (${scope})`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to save configuration: ${errorMessage}`);
      throw error;
    }
  }
  
  /**
   * 특정 설정값 조회
   */
  async get<K extends keyof DoorayAIConfig>(key: K): Promise<DoorayAIConfig[K]> {
    const config = await this.load();
    return config[key];
  }
  
  /**
   * 특정 설정값 설정
   */
  async set<K extends keyof DoorayAIConfig>(
    key: K, 
    value: DoorayAIConfig[K], 
    global: boolean = false
  ): Promise<void> {
    const partialConfig = { [key]: value } as Partial<DoorayAIConfig>;
    await this.save(partialConfig, global);
  }
  
  /**
   * 설정 파일 경로 조회
   */
  getConfigPaths(): { project: string; global: string } {
    return {
      project: this.configFile,
      global: this.globalConfigFile
    };
  }
  
  /**
   * 설정 파일 존재 여부 확인
   */
  async exists(): Promise<{ project: boolean; global: boolean }> {
    return {
      project: await fs.pathExists(this.configFile),
      global: await fs.pathExists(this.globalConfigFile)
    };
  }
  
  /**
   * 설정 파일 삭제
   */
  async remove(global: boolean = false): Promise<void> {
    const targetFile = global ? this.globalConfigFile : this.configFile;
    
    if (await fs.pathExists(targetFile)) {
      await fs.remove(targetFile);
      const scope = global ? 'global' : 'project';
      logger.success(`Configuration removed (${scope})`);
    }
  }
  
  /**
   * 설정 마이그레이션
   */
  async migration(fromVersion: string, toVersion: string): Promise<void> {
    logger.info(`Migrating configuration from ${fromVersion} to ${toVersion}`);
    
    const config = await this.load();
    
    // 버전별 마이그레이션 로직
    if (fromVersion === '1.0.0' && toVersion === '1.1.0') {
      // 예: 새로운 설정 필드 추가
      // config.newField = defaultValue;
    }
    
    config.metadata.version = toVersion;
    config.metadata.updatedAt = new Date().toISOString();
    
    await this.save(config);
    logger.success(`Configuration migrated to ${toVersion}`);
  }
  
  /**
   * 설정 검증
   */
  private validateConfig(config: DoorayAIConfig): void {
    // AI 설정 검증
    if (config.ai.maxTokens < 100 || config.ai.maxTokens > 100000) {
      throw new Error('maxTokens must be between 100 and 100000');
    }
    
    if (config.ai.temperature < 0 || config.ai.temperature > 2) {
      throw new Error('temperature must be between 0 and 2');
    }
    
    if (config.ai.timeout < 1000 || config.ai.timeout > 300000) {
      throw new Error('timeout must be between 1000 and 300000 ms');
    }
    
    // 언어 설정 검증
    if (!['ko', 'en'].includes(config.preferences.language)) {
      throw new Error('language must be "ko" or "en"');
    }
    
    // 로그 레벨 검증
    if (!['error', 'warn', 'info', 'debug'].includes(config.preferences.logLevel)) {
      throw new Error('logLevel must be one of: error, warn, info, debug');
    }
  }
  
  /**
   * 기본값과 병합
   */
  private mergeWithDefaults(config: any): DoorayAIConfig {
    return this.deepMerge(DEFAULT_CONFIG, config);
  }
  
  /**
   * 깊은 객체 병합
   */
  private deepMerge(target: any, source: any): any {
    if (source === null || source === undefined) {
      return target;
    }
    
    if (typeof source !== 'object' || Array.isArray(source)) {
      return source;
    }
    
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && !Array.isArray(source[key]) && source[key] !== null) {
          result[key] = this.deepMerge(target[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    
    return result;
  }
}

/**
 * 글로벌 설정 관리자 인스턴스
 */
export const configManager = new ConfigManager();