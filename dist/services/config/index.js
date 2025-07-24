"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.configManager = exports.ConfigManager = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const logger_1 = require("../../utils/logger");
/**
 * 기본 설정값
 */
const DEFAULT_CONFIG = {
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
class ConfigManager {
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
    async initialize(force = false) {
        logger_1.logger.info('Initializing dooray-ai configuration...');
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
                    }
                    catch (error) {
                        logger_1.logger.warn('Failed to read package.json');
                    }
                }
                await fs.writeJSON(this.configFile, projectConfig, { spaces: 2 });
                logger_1.logger.success(`Created project config: ${this.configFile}`);
            }
            // 글로벌 설정 파일 생성
            if (!await fs.pathExists(this.globalConfigFile) || force) {
                const globalConfig = { ...DEFAULT_CONFIG };
                globalConfig.project = {}; // 글로벌에는 프로젝트 정보 없음
                await fs.writeJSON(this.globalConfigFile, globalConfig, { spaces: 2 });
                logger_1.logger.success(`Created global config: ${this.globalConfigFile}`);
            }
            logger_1.logger.success('Configuration initialized successfully');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`Failed to initialize configuration: ${errorMessage}`);
            throw error;
        }
    }
    /**
     * 설정 로드 (프로젝트 우선, 글로벌 fallback)
     */
    async load() {
        try {
            let config;
            // 프로젝트 설정 우선
            if (await fs.pathExists(this.configFile)) {
                config = await fs.readJSON(this.configFile);
                logger_1.logger.debug('Loaded project configuration');
            }
            else if (await fs.pathExists(this.globalConfigFile)) {
                config = await fs.readJSON(this.globalConfigFile);
                logger_1.logger.debug('Loaded global configuration');
            }
            else {
                // 설정 파일이 없으면 기본값 사용
                config = { ...DEFAULT_CONFIG };
                logger_1.logger.warn('No configuration found, using defaults');
            }
            // 기본값과 병합 (누락된 필드 채우기)
            config = this.mergeWithDefaults(config);
            return config;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`Failed to load configuration: ${errorMessage}`);
            return { ...DEFAULT_CONFIG };
        }
    }
    /**
     * 설정 저장
     */
    async save(config, global = false) {
        try {
            const targetFile = global ? this.globalConfigFile : this.configFile;
            // 기존 설정 로드
            let existingConfig;
            if (await fs.pathExists(targetFile)) {
                existingConfig = await fs.readJSON(targetFile);
            }
            else {
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
            logger_1.logger.success(`Configuration saved (${scope})`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`Failed to save configuration: ${errorMessage}`);
            throw error;
        }
    }
    /**
     * 특정 설정값 조회
     */
    async get(key) {
        const config = await this.load();
        return config[key];
    }
    /**
     * 특정 설정값 설정
     */
    async set(key, value, global = false) {
        const partialConfig = { [key]: value };
        await this.save(partialConfig, global);
    }
    /**
     * 설정 파일 경로 조회
     */
    getConfigPaths() {
        return {
            project: this.configFile,
            global: this.globalConfigFile
        };
    }
    /**
     * 설정 파일 존재 여부 확인
     */
    async exists() {
        return {
            project: await fs.pathExists(this.configFile),
            global: await fs.pathExists(this.globalConfigFile)
        };
    }
    /**
     * 설정 파일 삭제
     */
    async remove(global = false) {
        const targetFile = global ? this.globalConfigFile : this.configFile;
        if (await fs.pathExists(targetFile)) {
            await fs.remove(targetFile);
            const scope = global ? 'global' : 'project';
            logger_1.logger.success(`Configuration removed (${scope})`);
        }
    }
    /**
     * 설정 마이그레이션
     */
    async migration(fromVersion, toVersion) {
        logger_1.logger.info(`Migrating configuration from ${fromVersion} to ${toVersion}`);
        const config = await this.load();
        // 버전별 마이그레이션 로직
        if (fromVersion === '1.0.0' && toVersion === '1.1.0') {
            // 예: 새로운 설정 필드 추가
            // config.newField = defaultValue;
        }
        config.metadata.version = toVersion;
        config.metadata.updatedAt = new Date().toISOString();
        await this.save(config);
        logger_1.logger.success(`Configuration migrated to ${toVersion}`);
    }
    /**
     * 설정 검증
     */
    validateConfig(config) {
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
    mergeWithDefaults(config) {
        return this.deepMerge(DEFAULT_CONFIG, config);
    }
    /**
     * 깊은 객체 병합
     */
    deepMerge(target, source) {
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
                }
                else {
                    result[key] = source[key];
                }
            }
        }
        return result;
    }
}
exports.ConfigManager = ConfigManager;
/**
 * 글로벌 설정 관리자 인스턴스
 */
exports.configManager = new ConfigManager();
//# sourceMappingURL=index.js.map