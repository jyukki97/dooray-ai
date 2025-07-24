/**
 * GitHub 서비스 모듈
 */

export * from './types';
export { GitHubClient } from './client';

import { GitHubClient } from './client';
import { GitHubCredentials, GitHubApiOptions } from './types';
import { authManager } from '../auth';
import { logger } from '../../utils/logger';

/**
 * GitHub 클라이언트 팩토리
 */
export class GitHubClientFactory {
  private static instance: GitHubClient | null = null;

  /**
   * GitHub 클라이언트 생성
   */
  static async createClient(options: GitHubApiOptions = {}): Promise<GitHubClient> {
    try {
      // 저장된 인증 정보 로드
      const credentials = await authManager.getGitHubAuth();
      
      if (!credentials || !credentials.token) {
        throw new Error('GitHub credentials not found. Please run: dooray-ai auth login');
      }

      const client = new GitHubClient(credentials, options);
      
      // 연결 테스트
      const isValid = await client.validateConnection();
      if (!isValid) {
        throw new Error('Failed to connect to GitHub API. Please check your token.');
      }

      this.instance = client;
      logger.success('GitHub client created successfully');
      
      return client;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to create GitHub client: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 기존 클라이언트 인스턴스 반환 또는 새로 생성
   */
  static async getInstance(options: GitHubApiOptions = {}): Promise<GitHubClient> {
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
   * GitHub 연결 상태 확인
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
 * 기본 GitHub 클라이언트 인스턴스 가져오기
 */
export async function getGitHubClient(): Promise<GitHubClient> {
  return await GitHubClientFactory.getInstance();
}

/**
 * GitHub 연결 상태 확인
 */
export async function validateGitHubConnection(): Promise<boolean> {
  return await GitHubClientFactory.validateConnection();
}