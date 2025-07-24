/**
 * Dooray 서비스 모듈
 */

export * from './types';
export { DoorayClient } from './client';

import { DoorayClient } from './client';
import { DoorayCredentials, DoorayApiOptions } from './types';
import { authManager } from '../auth';
import { logger } from '../../utils/logger';

/**
 * Dooray 클라이언트 팩토리
 */
export class DoorayClientFactory {
  private static instance: DoorayClient | null = null;

  /**
   * Dooray 클라이언트 생성
   */
  static async createClient(options: DoorayApiOptions = {}): Promise<DoorayClient> {
    try {
      // 저장된 인증 정보 로드
      const credentials = await authManager.getDoorayAuth();
      
      if (!credentials || !credentials.apiKey) {
        throw new Error('Dooray credentials not found. Please run: dooray-ai auth login');
      }

      const client = new DoorayClient(credentials, options);
      
      // 연결 테스트
      const isValid = await client.validateConnection();
      if (!isValid) {
        throw new Error('Failed to connect to Dooray API. Please check your credentials.');
      }

      this.instance = client;
      logger.success('Dooray client created successfully');
      
      return client;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to create Dooray client: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 기존 클라이언트 인스턴스 반환 또는 새로 생성
   */
  static async getInstance(options: DoorayApiOptions = {}): Promise<DoorayClient> {
    if (!this.instance) {
      this.instance = await this.createClient(options);
    }
    return this.instance;
  }

  /**
   * 클라이언트 인스턴스 재설정
   */
  static resetInstance(): void {
    this.instance = null;
  }

  /**
   * Dooray 연결 상태 확인
   */
  static async validateConnection(): Promise<boolean> {
    try {
      const client = await this.getInstance();
      return await client.validateConnection();
    } catch (error) {
      return false;
    }
  }
}

/**
 * 기본 Dooray 클라이언트 인스턴스 가져오기
 */
export async function getDoorayClient(): Promise<DoorayClient> {
  return await DoorayClientFactory.getInstance();
}

/**
 * Dooray 연결 상태 확인
 */
export async function validateDoorayConnection(): Promise<boolean> {
  return await DoorayClientFactory.validateConnection();
}