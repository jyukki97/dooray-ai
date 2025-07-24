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
exports.CONFIG_DIR = exports.CONFIG_FILE = exports.configCommand = void 0;
exports.loadConfig = loadConfig;
const commander_1 = require("commander");
const logger_1 = require("../utils/logger");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const CONFIG_DIR = path_1.default.join(os_1.default.homedir(), '.dooray-ai');
exports.CONFIG_DIR = CONFIG_DIR;
const CONFIG_FILE = path_1.default.join(CONFIG_DIR, 'config.json');
exports.CONFIG_FILE = CONFIG_FILE;
const defaultConfig = {
    ai: {
        provider: 'claude',
        model: 'claude-3-sonnet-20240229',
        temperature: 0.7,
        maxTokens: 4000,
    },
    dooray: {
        domain: '',
        defaultProject: undefined,
        apiToken: undefined,
    },
    git: {
        defaultBranch: 'main',
        branchPrefix: 'feat/',
        autoCommit: true,
        autoPush: false,
    },
    github: {
        owner: undefined,
        repo: undefined,
        token: undefined,
        autoCreatePR: true,
    },
    workflow: {
        autoMode: false,
        confirmSteps: true,
        parallelTasks: false,
    },
    ui: {
        colorOutput: true,
        progressBar: true,
        verbose: false,
    },
};
async function ensureConfigDir() {
    await fs_extra_1.default.ensureDir(CONFIG_DIR);
}
async function loadConfig() {
    try {
        if (await fs_extra_1.default.pathExists(CONFIG_FILE)) {
            const configData = await fs_extra_1.default.readJson(CONFIG_FILE);
            return { ...defaultConfig, ...configData };
        }
    }
    catch (error) {
        logger_1.logger.warn('설정 파일 로드 중 오류 발생, 기본 설정을 사용합니다.');
    }
    return defaultConfig;
}
async function saveConfig(config) {
    await ensureConfigDir();
    await fs_extra_1.default.writeJson(CONFIG_FILE, config, { spaces: 2 });
    logger_1.logger.info('설정이 저장되었습니다.');
}
async function getConfigValue(key) {
    const config = await loadConfig();
    const keys = key.split('.');
    let value = config;
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        }
        else {
            return undefined;
        }
    }
    return value;
}
async function setConfigValue(key, value) {
    const config = await loadConfig();
    const keys = key.split('.');
    let current = config;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current)) {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }
    const lastKey = keys[keys.length - 1];
    // 타입 변환
    if (value === 'true')
        current[lastKey] = true;
    else if (value === 'false')
        current[lastKey] = false;
    else if (!isNaN(Number(value)))
        current[lastKey] = Number(value);
    else
        current[lastKey] = value;
    await saveConfig(config);
}
const configCommand = new commander_1.Command('config')
    .description('Dooray AI 설정 관리');
exports.configCommand = configCommand;
// 설정 초기화
configCommand
    .command('init')
    .description('기본 설정 파일 생성')
    .option('-f, --force', '기존 설정 파일 덮어쓰기')
    .action(async (options) => {
    try {
        if (!options.force && await fs_extra_1.default.pathExists(CONFIG_FILE)) {
            logger_1.logger.error('설정 파일이 이미 존재합니다. --force 옵션을 사용하여 덮어쓸 수 있습니다.');
            return;
        }
        await saveConfig(defaultConfig);
        logger_1.logger.success('기본 설정 파일이 생성되었습니다.');
        logger_1.logger.info(`설정 파일 위치: ${CONFIG_FILE}`);
    }
    catch (error) {
        logger_1.logger.error('설정 파일 생성 중 오류가 발생했습니다:', error);
    }
});
// 설정 값 조회
configCommand
    .command('get <key>')
    .description('설정 값 조회')
    .action(async (key) => {
    try {
        const value = await getConfigValue(key);
        if (value === undefined) {
            logger_1.logger.error(`설정 키 '${key}'를 찾을 수 없습니다.`);
            return;
        }
        console.log(`${key} = ${JSON.stringify(value, null, 2)}`);
    }
    catch (error) {
        logger_1.logger.error('설정 조회 중 오류가 발생했습니다:', error);
    }
});
// 설정 값 변경
configCommand
    .command('set <key> <value>')
    .description('설정 값 변경')
    .action(async (key, value) => {
    try {
        await setConfigValue(key, value);
        logger_1.logger.success(`설정 '${key}'가 '${value}'로 변경되었습니다.`);
    }
    catch (error) {
        logger_1.logger.error('설정 변경 중 오류가 발생했습니다:', error);
    }
});
// 전체 설정 출력
configCommand
    .command('list')
    .alias('ls')
    .description('전체 설정 보기')
    .option('-k, --keys-only', '설정 키만 표시')
    .action(async (options) => {
    try {
        const config = await loadConfig();
        if (options.keysOnly) {
            const printKeys = (obj, prefix = '') => {
                Object.keys(obj).forEach(key => {
                    const fullKey = prefix ? `${prefix}.${key}` : key;
                    if (typeof obj[key] === 'object' && obj[key] !== null) {
                        printKeys(obj[key], fullKey);
                    }
                    else {
                        console.log(fullKey);
                    }
                });
            };
            printKeys(config);
        }
        else {
            console.log(JSON.stringify(config, null, 2));
        }
    }
    catch (error) {
        logger_1.logger.error('설정 목록 조회 중 오류가 발생했습니다:', error);
    }
});
// 설정 파일 위치 출력
configCommand
    .command('path')
    .description('설정 파일 경로 출력')
    .action(() => {
    console.log(CONFIG_FILE);
});
// 설정 검증
configCommand
    .command('validate')
    .description('설정 파일 유효성 검사')
    .action(async () => {
    try {
        const config = await loadConfig();
        const errors = [];
        // AI 설정 검증
        if (!['claude', 'openai', 'auto'].includes(config.ai.provider)) {
            errors.push('ai.provider는 claude, openai, auto 중 하나여야 합니다.');
        }
        if (config.ai.temperature < 0 || config.ai.temperature > 2) {
            errors.push('ai.temperature는 0과 2 사이의 값이어야 합니다.');
        }
        if (config.ai.maxTokens <= 0) {
            errors.push('ai.maxTokens는 양수여야 합니다.');
        }
        // Dooray 설정 검증
        if (!config.dooray.domain) {
            errors.push('dooray.domain은 필수 설정입니다.');
        }
        // Git 설정 검증
        if (!config.git.defaultBranch) {
            errors.push('git.defaultBranch는 필수 설정입니다.');
        }
        if (errors.length === 0) {
            logger_1.logger.success('설정 파일이 유효합니다.');
        }
        else {
            logger_1.logger.error('설정 파일에 다음 오류가 있습니다:');
            errors.forEach(error => logger_1.logger.error(`- ${error}`));
        }
    }
    catch (error) {
        logger_1.logger.error('설정 검증 중 오류가 발생했습니다:', error);
    }
});
// 설정 백업
configCommand
    .command('backup')
    .description('설정 파일 백업')
    .option('-o, --output <path>', '백업 파일 경로')
    .action(async (options) => {
    try {
        if (!await fs_extra_1.default.pathExists(CONFIG_FILE)) {
            logger_1.logger.error('백업할 설정 파일이 존재하지 않습니다.');
            return;
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = options.output || path_1.default.join(CONFIG_DIR, `config-backup-${timestamp}.json`);
        await fs_extra_1.default.copy(CONFIG_FILE, backupPath);
        logger_1.logger.success(`설정 파일이 백업되었습니다: ${backupPath}`);
    }
    catch (error) {
        logger_1.logger.error('설정 백업 중 오류가 발생했습니다:', error);
    }
});
// 설정 복원
configCommand
    .command('restore <backupPath>')
    .description('백업에서 설정 복원')
    .action(async (backupPath) => {
    try {
        if (!await fs_extra_1.default.pathExists(backupPath)) {
            logger_1.logger.error('백업 파일이 존재하지 않습니다.');
            return;
        }
        // 백업 파일 검증
        const backupConfig = await fs_extra_1.default.readJson(backupPath);
        await fs_extra_1.default.copy(backupPath, CONFIG_FILE);
        logger_1.logger.success('설정이 복원되었습니다.');
    }
    catch (error) {
        logger_1.logger.error('설정 복원 중 오류가 발생했습니다:', error);
    }
});
// 대화형 설정 마법사
configCommand
    .command('wizard')
    .description('대화형 설정 마법사')
    .action(async () => {
    const inquirer = await Promise.resolve().then(() => __importStar(require('inquirer')));
    try {
        logger_1.logger.info('Dooray AI 설정 마법사를 시작합니다...');
        const answers = await inquirer.default.prompt([
            {
                type: 'list',
                name: 'aiProvider',
                message: 'AI 제공자를 선택하세요:',
                choices: [
                    { name: 'Claude (Anthropic)', value: 'claude' },
                    { name: 'OpenAI GPT', value: 'openai' },
                    { name: '자동 선택', value: 'auto' }
                ],
                default: 'claude'
            },
            {
                type: 'input',
                name: 'doorayDomain',
                message: 'Dooray 도메인을 입력하세요 (예: company.dooray.com):',
                validate: (input) => input.trim() !== '' || 'Dooray 도메인은 필수입니다.'
            },
            {
                type: 'input',
                name: 'defaultBranch',
                message: 'Git 기본 브랜치명을 입력하세요:',
                default: 'main'
            },
            {
                type: 'input',
                name: 'branchPrefix',
                message: '브랜치 접두사를 입력하세요:',
                default: 'feat/'
            },
            {
                type: 'confirm',
                name: 'autoCommit',
                message: '자동 커밋을 활성화하시겠습니까?',
                default: true
            },
            {
                type: 'confirm',
                name: 'autoCreatePR',
                message: 'PR 자동 생성을 활성화하시겠습니까?',
                default: true
            }
        ]);
        const config = await loadConfig();
        config.ai.provider = answers.aiProvider;
        config.dooray.domain = answers.doorayDomain;
        config.git.defaultBranch = answers.defaultBranch;
        config.git.branchPrefix = answers.branchPrefix;
        config.git.autoCommit = answers.autoCommit;
        config.github.autoCreatePR = answers.autoCreatePR;
        await saveConfig(config);
        logger_1.logger.success('설정이 완료되었습니다!');
    }
    catch (error) {
        logger_1.logger.error('설정 마법사 실행 중 오류가 발생했습니다:', error);
    }
});
//# sourceMappingURL=config.js.map