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
exports.initCommand = void 0;
const commander_1 = require("commander");
const logger_1 = require("../utils/logger");
// inquirer는 ES Module이므로 dynamic import 사용
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
exports.initCommand = new commander_1.Command('init')
    .description('Initialize dooray-ai in current project')
    .option('-f, --force', 'Overwrite existing configuration')
    .option('-t, --template <type>', 'Configuration template to use', 'default')
    .action(async (options) => {
    try {
        logger_1.logger.progress('Initializing dooray-ai...');
        const configDir = path_1.default.join(os_1.default.homedir(), '.dooray-ai');
        const configFile = path_1.default.join(configDir, 'config.json');
        // 기존 설정 확인
        if (await fs_extra_1.default.pathExists(configFile) && !options.force) {
            const inquirer = await Promise.resolve().then(() => __importStar(require('inquirer')));
            const { overwrite } = await inquirer.default.prompt([
                {
                    type: 'confirm',
                    name: 'overwrite',
                    message: 'Configuration already exists. Overwrite?',
                    default: false
                }
            ]);
            if (!overwrite) {
                logger_1.logger.info('Initialization cancelled.');
                return;
            }
        }
        // 설정 디렉토리 생성
        await fs_extra_1.default.ensureDir(configDir);
        // 기본 설정 생성
        const defaultConfig = {
            version: '0.1.0',
            dooray: {
                baseUrl: '',
                apiKey: '',
                projectId: ''
            },
            github: {
                token: '',
                username: '',
                defaultBranch: 'main'
            },
            ai: {
                provider: 'openai',
                apiKey: '',
                model: 'gpt-4'
            },
            preferences: {
                autoCommit: true,
                autoPush: false,
                createPR: true,
                branchPrefix: 'feature/',
                commitPrefix: 'feat: '
            }
        };
        // 설정 파일 저장
        await fs_extra_1.default.writeJson(configFile, defaultConfig, { spaces: 2 });
        logger_1.logger.success('dooray-ai initialized successfully!');
        logger_1.logger.info(`Configuration saved to: ${configFile}`);
        logger_1.logger.info('Next steps:');
        logger_1.logger.info('1. Run "dooray-ai config" to set up your credentials');
        logger_1.logger.info('2. Start using "dooray-ai task" commands');
    }
    catch (error) {
        logger_1.logger.error(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
});
//# sourceMappingURL=init.js.map