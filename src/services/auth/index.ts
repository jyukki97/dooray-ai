import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { logger } from '../../utils/logger';

/**
 * 인증 정보 구조
 */
export interface AuthCredentials {
  // Claude Code는 API 키가 필요 없음
  claudeCodeEnabled: boolean;
  
  // 서비스별 인증 정보
  dooray?: {
    apiKey: string;
    userId?: string;
    projectId?: string;
    baseUrl?: string;
  };
  
  github?: {
    token: string;
    username?: string;
  };
  
  // 메타데이터
  metadata: {
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
    version: string;
  };
}

/**
 * 인증 상태
 */
export interface AuthStatus {
  isAuthenticated: boolean;
  claudeCodeAvailable: boolean;
  services: {
    dooray: boolean;
    github: boolean;
  };
  lastLogin?: Date;
}

/**
 * 인증 관리자
 */
export class AuthManager {
  private authDir: string;
  private authFile: string;
  private keyFile: string;
  private encryptionKey: Buffer | null = null;
  
  constructor() {
    this.authDir = path.join(os.homedir(), '.dooray-ai');
    this.authFile = path.join(this.authDir, 'auth.json');
    this.keyFile = path.join(this.authDir, '.key');
  }
  
  /**
   * 인증 시스템 초기화
   */
  async initialize(): Promise<void> {
    try {
      await fs.ensureDir(this.authDir);
      
      // 암호화 키 생성 또는 로드
      await this.loadOrGenerateKey();
      
      // 인증 파일이 없으면 기본값 생성
      if (!await fs.pathExists(this.authFile)) {
        const defaultAuth: AuthCredentials = {
          claudeCodeEnabled: true, // Claude Code는 기본적으로 사용 가능
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: '1.0.0'
          }
        };
        
        await this.saveCredentials(defaultAuth);
        logger.info('Authentication system initialized');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to initialize auth system: ${errorMessage}`);
      throw error;
    }
  }
  
  /**
   * 인증 상태 확인
   */
  async getAuthStatus(): Promise<AuthStatus> {
    try {
      const credentials = await this.loadCredentials();
      
      return {
        isAuthenticated: credentials.claudeCodeEnabled || 
                        !!(credentials.dooray?.apiKey) || 
                        !!(credentials.github?.token),
        claudeCodeAvailable: credentials.claudeCodeEnabled,
        services: {
          dooray: !!(credentials.dooray?.apiKey),
          github: !!(credentials.github?.token)
        },
        lastLogin: credentials.metadata.lastLogin ? new Date(credentials.metadata.lastLogin) : undefined
      };
      
    } catch (error) {
      logger.error('Failed to get auth status');
      return {
        isAuthenticated: false,
        claudeCodeAvailable: false,
        services: {
          dooray: false,
          github: false
        }
      };
    }
  }
  
  /**
   * Dooray 인증 정보 설정
   */
  async setDoorayAuth(apiKey: string, userId?: string, projectId?: string): Promise<void> {
    try {
      const credentials = await this.loadCredentials();
      
      credentials.dooray = {
        apiKey: await this.encrypt(apiKey),
        userId,
        projectId
      };
      
      credentials.metadata.updatedAt = new Date().toISOString();
      credentials.metadata.lastLogin = new Date().toISOString();
      
      await this.saveCredentials(credentials);
      logger.success('Dooray authentication saved');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to save Dooray auth: ${errorMessage}`);
      throw error;
    }
  }
  
  /**
   * GitHub 인증 정보 설정
   */
  async setGitHubAuth(token: string, username?: string): Promise<void> {
    try {
      const credentials = await this.loadCredentials();
      
      credentials.github = {
        token: await this.encrypt(token),
        username
      };
      
      credentials.metadata.updatedAt = new Date().toISOString();
      credentials.metadata.lastLogin = new Date().toISOString();
      
      await this.saveCredentials(credentials);
      logger.success('GitHub authentication saved');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to save GitHub auth: ${errorMessage}`);
      throw error;
    }
  }
  
  /**
   * Dooray 인증 정보 조회
   */
  async getDoorayAuth(): Promise<{ apiKey: string; userId?: string; projectId?: string } | null> {
    try {
      const credentials = await this.loadCredentials();
      
      if (!credentials.dooray?.apiKey) {
        return null;
      }
      
      // Handle both encrypted and plain text (for development)
      let apiKey = credentials.dooray.apiKey;
      try {
        // Try to decrypt if it contains ':'
        if (apiKey.includes(':') && apiKey.length > 50) {
          apiKey = await this.decrypt(apiKey);
        }
      } catch (error) {
        // If decryption fails, assume it's plain text
        logger.debug('Using plain text API key for development');
      }

      return {
        apiKey: apiKey,
        userId: credentials.dooray.userId,
        projectId: credentials.dooray.projectId
      };
      
    } catch (error) {
      logger.error('Failed to get Dooray auth');
      return null;
    }
  }
  
  /**
   * GitHub 인증 정보 조회
   */
  async getGitHubAuth(): Promise<{ token: string; username?: string } | null> {
    try {
      const credentials = await this.loadCredentials();
      
      if (!credentials.github?.token) {
        return null;
      }
      
      // Handle both encrypted and plain text (for development)
      let token = credentials.github.token;
      try {
        // Try to decrypt if it contains ':'
        if (token.includes(':') && token.length > 50) {
          token = await this.decrypt(token);
        }
      } catch (error) {
        // If decryption fails, assume it's plain text
        logger.debug('Using plain text GitHub token for development');
      }

      return {
        token: token,
        username: credentials.github.username
      };
      
    } catch (error) {
      logger.error('Failed to get GitHub auth');
      return null;
    }
  }
  
  /**
   * 특정 서비스 인증 정보 제거
   */
  async removeAuth(service: 'dooray' | 'github'): Promise<void> {
    try {
      const credentials = await this.loadCredentials();
      
      if (service === 'dooray') {
        delete credentials.dooray;
      } else if (service === 'github') {
        delete credentials.github;
      }
      
      credentials.metadata.updatedAt = new Date().toISOString();
      
      await this.saveCredentials(credentials);
      logger.success(`${service} authentication removed`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to remove ${service} auth: ${errorMessage}`);
      throw error;
    }
  }
  
  /**
   * 모든 인증 정보 제거
   */
  async clearAll(): Promise<void> {
    try {
      const defaultAuth: AuthCredentials = {
        claudeCodeEnabled: true,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0'
        }
      };
      
      await this.saveCredentials(defaultAuth);
      logger.success('All authentication data cleared');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to clear auth data: ${errorMessage}`);
      throw error;
    }
  }
  
  /**
   * 인증 정보 검증
   */
  async validateAuth(service: 'dooray' | 'github'): Promise<boolean> {
    try {
      if (service === 'dooray') {
        const auth = await this.getDoorayAuth();
        return !!(auth?.apiKey);
      } else if (service === 'github') {
        const auth = await this.getGitHubAuth();
        return !!(auth?.token);
      }
      
      return false;
      
    } catch (error) {
      logger.error(`Failed to validate ${service} auth`);
      return false;
    }
  }
  
  /**
   * Claude Code 가용성 확인
   */
  async validateClaudeCode(): Promise<boolean> {
    try {
      // Claude Code CLI 실행 가능 여부 확인
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      await execAsync('claude --version');
      return true;
      
    } catch (error) {
      logger.warn('Claude Code CLI not available');
      return false;
    }
  }
  
  /**
   * 암호화 키 생성 또는 로드
   */
  private async loadOrGenerateKey(): Promise<void> {
    try {
      if (await fs.pathExists(this.keyFile)) {
        // 기존 키 로드
        const keyData = await fs.readFile(this.keyFile);
        this.encryptionKey = keyData;
      } else {
        // 새 키 생성
        this.encryptionKey = crypto.randomBytes(32);
        await fs.writeFile(this.keyFile, this.encryptionKey);
        
        // 키 파일 권한 설정 (소유자만 읽기 가능)
        await fs.chmod(this.keyFile, 0o600);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to load/generate encryption key: ${errorMessage}`);
      throw error;
    }
  }
  
  /**
   * 데이터 암호화
   */
  private async encrypt(text: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not loaded');
    }
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    cipher.setAutoPadding(true);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // IV와 암호화된 데이터를 결합
    return iv.toString('hex') + ':' + encrypted;
  }
  
  /**
   * 데이터 복호화
   */
  private async decrypt(encryptedData: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not loaded');
    }
    
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    decipher.setAutoPadding(true);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  /**
   * 인증 정보 로드
   */
  private async loadCredentials(): Promise<AuthCredentials> {
    try {
      if (!await fs.pathExists(this.authFile)) {
        throw new Error('Auth file not found');
      }
      
      return await fs.readJSON(this.authFile);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to load credentials: ${errorMessage}`);
      throw error;
    }
  }
  
  /**
   * 인증 정보 저장
   */
  private async saveCredentials(credentials: AuthCredentials): Promise<void> {
    try {
      await fs.writeJSON(this.authFile, credentials, { spaces: 2 });
      
      // 인증 파일 권한 설정 (소유자만 읽기/쓰기 가능)
      await fs.chmod(this.authFile, 0o600);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to save credentials: ${errorMessage}`);
      throw error;
    }
  }
}

/**
 * 글로벌 인증 관리자 인스턴스
 */
export const authManager = new AuthManager();