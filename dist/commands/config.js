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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configCommand = void 0;
const commander_1 = require("commander");
const logger_1 = require("../utils/logger");
// inquirer는 ES Module이므로 dynamic import 사용
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
exports.configCommand = new commander_1.Command('config')
    .description('Manage dooray-ai configuration')
    .option('-g, --get <key>', 'Get configuration value')
    .option('-s, --set <key=value>', 'Set configuration value')
    .option('-l, --list', 'List all configuration')
    .option('-r, --reset', 'Reset configuration to defaults')
    .action(async (options) => {
    try {
        const configDir = path_1.default.join(os_1.default.homedir(), '.dooray-ai');
        const configFile = path_1.default.join(configDir, 'config.json');
        // 설정 파일이 없으면 안내
        if (!await fs_extra_1.default.pathExists(configFile)) {
            logger_1.logger.error('Configuration not found. Run "dooray-ai init" first.');
            process.exit(1);
        }
        const config = await fs_extra_1.default.readJson(configFile);
        if (options.list) {
            logger_1.logger.info('Current Configuration:');
            console.log(JSON.stringify(config, null, 2));
            return;
        }
        if (options.get) {
            const value = getNestedValue(config, options.get);
            if (value !== undefined) {
                logger_1.logger.info(`${options.get}: ${JSON.stringify(value)}`);
            }
            else {
                logger_1.logger.error(`Configuration key not found: ${options.get}`);
            }
            return;
        }
        if (options.set) {
            const [key, value] = options.set.split('=');
            if (!key || value === undefined) {
                logger_1.logger.error('Invalid format. Use: --set key=value');
                process.exit(1);
            }
            setNestedValue(config, key, value);
            await fs_extra_1.default.writeJson(configFile, config, { spaces: 2 });
            logger_1.logger.success(`Set ${key} = ${value}`);
            return;
        }
        if (options.reset) {
            const inquirer = await Promise.resolve().then(() => __importStar(require('inquirer')));
            const { confirm } = await inquirer.default.prompt([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: 'Are you sure you want to reset all configuration?',
                    default: false
                }
            ]);
            if (confirm) {
                await fs_extra_1.default.remove(configFile);
                logger_1.logger.success('Configuration reset. Run "dooray-ai init" to reconfigure.');
            }
            return;
        }
        // 대화형 설정 모드
        await interactiveConfig(config, configFile);
    }
    catch (error) {
        logger_1.logger.error(`Configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
});
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}
function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
        if (!current[key])
            current[key] = {};
        return current[key];
    }, obj);
    // 값 타입 추론
    if (value === 'true')
        target[lastKey] = true;
    else if (value === 'false')
        target[lastKey] = false;
    else if (!isNaN(Number(value)))
        target[lastKey] = Number(value);
    else
        target[lastKey] = value;
}
async function interactiveConfig(config, configFile) {
    logger_1.logger.info('Interactive Configuration Mode');
    const inquirer = await Promise.resolve().then(() => __importStar(require('inquirer')));
    const answers = await inquirer.default.prompt([
        {
            type: 'input',
            name: 'doorayApiKey',
            message: 'Dooray! API Key:',
            default: config.dooray?.apiKey || ''
        },
        {
            type: 'input',
            name: 'doorayProjectId',
            message: 'Dooray! Project ID:',
            default: config.dooray?.projectId || ''
        },
        {
            type: 'input',
            name: 'githubToken',
            message: 'GitHub Personal Access Token:',
            default: config.github?.token || ''
        },
        {
            type: 'input',
            name: 'githubUsername',
            message: 'GitHub Username:',
            default: config.github?.username || ''
        },
        {
            type: 'list',
            name: 'aiProvider',
            message: 'AI Provider:',
            choices: ['openai', 'anthropic'],
            default: config.ai?.provider || 'openai'
        },
        {
            type: 'input',
            name: 'aiApiKey',
            message: 'AI API Key:',
            default: config.ai?.apiKey || ''
        }
    ]);
    // 설정 업데이트
    config.dooray.apiKey = answers.doorayApiKey;
    config.dooray.projectId = answers.doorayProjectId;
    config.github.token = answers.githubToken;
    config.github.username = answers.githubUsername;
    config.ai.provider = answers.aiProvider;
    config.ai.apiKey = answers.aiApiKey;
    await fs_extra_1.default.writeJson(configFile, config, { spaces: 2 });
    logger_1.logger.success('Configuration updated successfully!');
}
//# sourceMappingURL=config.js.map