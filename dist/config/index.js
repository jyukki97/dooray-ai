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
exports.ConfigManager = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const CONFIG_DIR = path.join(os.homedir(), '.dooray-ai');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
// 기본 설정 값
const DEFAULT_CONFIG = {
    defaultBranch: 'main',
    autoCommit: false,
    autoPush: false,
};
class ConfigManager {
    /**
     * 설정 파일을 로드합니다
     */
    static async loadConfig() {
        try {
            if (await fs.pathExists(CONFIG_FILE)) {
                const configData = await fs.readJson(CONFIG_FILE);
                return { ...DEFAULT_CONFIG, ...configData };
            }
            return DEFAULT_CONFIG;
        }
        catch (error) {
            console.warn('Failed to load config, using defaults:', error);
            return DEFAULT_CONFIG;
        }
    }
    /**
     * 설정을 저장합니다
     */
    static async saveConfig(config) {
        try {
            await fs.ensureDir(CONFIG_DIR);
            const currentConfig = await this.loadConfig();
            const updatedConfig = { ...currentConfig, ...config };
            await fs.writeJson(CONFIG_FILE, updatedConfig, { spaces: 2 });
        }
        catch (error) {
            throw new Error(`Failed to save config: ${error}`);
        }
    }
    /**
     * 특정 설정 값을 가져옵니다
     */
    static async getConfigValue(key) {
        const config = await this.loadConfig();
        return config[key];
    }
    /**
     * 특정 설정 값을 설정합니다
     */
    static async setConfigValue(key, value) {
        await this.saveConfig({ [key]: value });
    }
    /**
     * 설정 디렉터리 경로를 반환합니다
     */
    static getConfigDir() {
        return CONFIG_DIR;
    }
    /**
     * 설정 파일 경로를 반환합니다
     */
    static getConfigFile() {
        return CONFIG_FILE;
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=index.js.map