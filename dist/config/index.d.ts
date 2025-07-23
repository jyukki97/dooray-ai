import { Config } from '../types';
export declare class ConfigManager {
    /**
     * 설정 파일을 로드합니다
     */
    static loadConfig(): Promise<Config>;
    /**
     * 설정을 저장합니다
     */
    static saveConfig(config: Partial<Config>): Promise<void>;
    /**
     * 특정 설정 값을 가져옵니다
     */
    static getConfigValue<K extends keyof Config>(key: K): Promise<Config[K]>;
    /**
     * 특정 설정 값을 설정합니다
     */
    static setConfigValue<K extends keyof Config>(key: K, value: Config[K]): Promise<void>;
    /**
     * 설정 디렉터리 경로를 반환합니다
     */
    static getConfigDir(): string;
    /**
     * 설정 파일 경로를 반환합니다
     */
    static getConfigFile(): string;
}
//# sourceMappingURL=index.d.ts.map