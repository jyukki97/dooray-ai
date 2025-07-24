/**
 * Git 서비스 모듈
 */

export * from './types';
export { GitClient } from './client';

import { GitClient } from './client';
import { GitConfig } from './types';
import { configManager } from '../config';
import { logger } from '../../utils/logger';

/**
 * Git 클라이언트 팩토리
 */
export class GitClientFactory {
  private static instance: GitClient | null = null;

  /**
   * Git 클라이언트 생성
   */
  static async createClient(repositoryPath?: string): Promise<GitClient> {
    try {
      const repoPath = repositoryPath || process.cwd();
      
      // 설정 로드
      const appConfig = await configManager.load();
      const gitConfig: Partial<GitConfig> = appConfig.git || {};

      const client = new GitClient(repoPath, gitConfig);
      
      // Git 저장소 검증
      const isValidRepo = await client.validateRepository();
      if (!isValidRepo) {
        throw new Error(`Not a git repository: ${repoPath}`);
      }

      this.instance = client;
      logger.success('Git client created successfully');
      
      return client;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to create Git client: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 기존 클라이언트 인스턴스 반환 또는 새로 생성
   */
  static async getInstance(repositoryPath?: string): Promise<GitClient> {
    if (!this.instance) {
      this.instance = await this.createClient(repositoryPath);
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
   * Git 저장소 검증
   */
  static async validateRepository(repositoryPath?: string): Promise<boolean> {
    try {
      const client = new GitClient(repositoryPath || process.cwd());
      return await client.validateRepository();
    } catch (error) {
      return false;
    }
  }
}

/**
 * 기본 Git 클라이언트 인스턴스 가져오기
 */
export async function getGitClient(repositoryPath?: string): Promise<GitClient> {
  return await GitClientFactory.getInstance(repositoryPath);
}

/**
 * Git 저장소 검증
 */
export async function validateGitRepository(repositoryPath?: string): Promise<boolean> {
  return await GitClientFactory.validateRepository(repositoryPath);
}