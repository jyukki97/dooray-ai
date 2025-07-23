import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { Config } from '../types';

const CONFIG_DIR = path.join(os.homedir(), '.dooray-ai');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// 기본 설정 값
const DEFAULT_CONFIG: Config = {
  defaultBranch: 'main',
  autoCommit: false,
  autoPush: false,
};

export class ConfigManager {
  /**
   * 설정 파일을 로드합니다
   */
  static async loadConfig(): Promise<Config> {
    try {
      if (await fs.pathExists(CONFIG_FILE)) {
        const configData = await fs.readJson(CONFIG_FILE);
        return { ...DEFAULT_CONFIG, ...configData };
      }
      return DEFAULT_CONFIG;
    } catch (error) {
      console.warn('Failed to load config, using defaults:', error);
      return DEFAULT_CONFIG;
    }
  }

  /**
   * 설정을 저장합니다
   */
  static async saveConfig(config: Partial<Config>): Promise<void> {
    try {
      await fs.ensureDir(CONFIG_DIR);
      const currentConfig = await this.loadConfig();
      const updatedConfig = { ...currentConfig, ...config };
      await fs.writeJson(CONFIG_FILE, updatedConfig, { spaces: 2 });
    } catch (error) {
      throw new Error(`Failed to save config: ${error}`);
    }
  }

  /**
   * 특정 설정 값을 가져옵니다
   */
  static async getConfigValue<K extends keyof Config>(
    key: K
  ): Promise<Config[K]> {
    const config = await this.loadConfig();
    return config[key];
  }

  /**
   * 특정 설정 값을 설정합니다
   */
  static async setConfigValue<K extends keyof Config>(
    key: K,
    value: Config[K]
  ): Promise<void> {
    await this.saveConfig({ [key]: value } as Partial<Config>);
  }

  /**
   * 설정 디렉터리 경로를 반환합니다
   */
  static getConfigDir(): string {
    return CONFIG_DIR;
  }

  /**
   * 설정 파일 경로를 반환합니다
   */
  static getConfigFile(): string {
    return CONFIG_FILE;
  }
}
