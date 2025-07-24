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
exports.logoutCommand = exports.loginCommand = void 0;
const commander_1 = require("commander");
const logger_1 = require("../utils/logger");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const claude_client_1 = require("../services/ai/claude-client");
const env_1 = require("../config/env");
exports.loginCommand = new commander_1.Command('login')
    .description('Login and authenticate with various services')
    .option('-s, --service <service>', 'Login to specific service (claude, openai, dooray, github)')
    .option('-k, --key <key>', 'Provide API key directly')
    .option('--status', 'Check login status')
    .action(async (options) => {
    try {
        const configDir = path_1.default.join(os_1.default.homedir(), '.dooray-ai');
        const configFile = path_1.default.join(configDir, 'config.json');
        // 설정 디렉토리 생성
        await fs_extra_1.default.ensureDir(configDir);
        if (options.status) {
            await showLoginStatus(configFile);
            return;
        }
        // 기존 설정 로드
        let config = {};
        if (await fs_extra_1.default.pathExists(configFile)) {
            config = await fs_extra_1.default.readJson(configFile);
        }
        // 서비스별 로그인 또는 전체 로그인
        if (options.service) {
            await loginToService(options.service, options.key, config, configFile);
        }
        else {
            await interactiveLogin(config, configFile);
        }
    }
    catch (error) {
        logger_1.logger.error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
});
exports.logoutCommand = new commander_1.Command('logout')
    .description('Logout and clear stored credentials')
    .option('-s, --service <service>', 'Logout from specific service')
    .option('-a, --all', 'Logout from all services')
    .action(async (options) => {
    try {
        const configDir = path_1.default.join(os_1.default.homedir(), '.dooray-ai');
        const configFile = path_1.default.join(configDir, 'config.json');
        if (!await fs_extra_1.default.pathExists(configFile)) {
            logger_1.logger.info('No credentials found to logout from.');
            return;
        }
        const config = await fs_extra_1.default.readJson(configFile);
        if (options.all) {
            await logoutFromAllServices(config, configFile);
        }
        else if (options.service) {
            await logoutFromService(options.service, config, configFile);
        }
        else {
            // 대화형 로그아웃
            await interactiveLogout(config, configFile);
        }
    }
    catch (error) {
        logger_1.logger.error(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
});
async function showLoginStatus(configFile) {
    logger_1.logger.info('Authentication Status:');
    if (!await fs_extra_1.default.pathExists(configFile)) {
        logger_1.logger.info('❌ Not logged in to any services');
        logger_1.logger.info('Run "dooray-ai login" to authenticate');
        return;
    }
    const config = await fs_extra_1.default.readJson(configFile);
    const credentials = extractCredentials(config);
    logger_1.logger.info(`\n🔐 Login Status:`);
    logger_1.logger.info(`  Claude API: ${credentials.claudeApiKey ? '✅ Authenticated' : '❌ Not configured'}`);
    logger_1.logger.info(`  OpenAI API: ${credentials.openaiApiKey ? '✅ Authenticated' : '❌ Not configured'}`);
    logger_1.logger.info(`  Anthropic API: ${credentials.anthropicApiKey ? '✅ Authenticated' : '❌ Not configured'}`);
    logger_1.logger.info(`  Dooray API: ${credentials.doorayApiKey ? '✅ Authenticated' : '❌ Not configured'}`);
    logger_1.logger.info(`  GitHub Token: ${credentials.githubToken ? '✅ Authenticated' : '❌ Not configured'}`);
    if (credentials.lastLogin) {
        logger_1.logger.info(`\n📅 Last Login: ${new Date(credentials.lastLogin).toLocaleString()}`);
    }
    const status = getOverallLoginStatus(credentials);
    const statusEmoji = status === 'authenticated' ? '✅' : status === 'partial' ? '⚠️ ' : '❌';
    logger_1.logger.info(`\n${statusEmoji} Overall Status: ${status.toUpperCase()}`);
    if (status === 'partial') {
        logger_1.logger.info('💡 Some services are not configured. Run "dooray-ai login" to complete setup.');
    }
    else if (status === 'none') {
        logger_1.logger.info('💡 Run "dooray-ai login" to authenticate with services.');
    }
}
async function loginToService(service, apiKey, config, configFile) {
    const supportedServices = ['claude', 'openai', 'anthropic', 'dooray', 'github'];
    if (!supportedServices.includes(service)) {
        logger_1.logger.error(`Unsupported service: ${service}`);
        logger_1.logger.info(`Supported services: ${supportedServices.join(', ')}`);
        process.exit(1);
    }
    let key = apiKey;
    // API 키가 제공되지 않은 경우 입력 요청
    if (!key) {
        const inquirer = await Promise.resolve().then(() => __importStar(require('inquirer')));
        const { inputKey } = await inquirer.default.prompt([
            {
                type: 'password',
                name: 'inputKey',
                message: `Enter ${service.toUpperCase()} API key:`,
                mask: '*'
            }
        ]);
        key = inputKey;
    }
    if (!key || key.trim() === '') {
        logger_1.logger.error('API key is required');
        process.exit(1);
    }
    // 서비스별 설정 업데이트
    await updateServiceCredentials(service, key, config);
    // API 키 검증
    const isValid = await validateServiceCredentials(service, key);
    if (isValid) {
        // 설정 저장
        config.auth = config.auth || {};
        config.auth.lastLogin = new Date();
        await fs_extra_1.default.writeJson(configFile, config, { spaces: 2 });
        logger_1.logger.success(`✅ Successfully logged in to ${service.toUpperCase()}`);
        logger_1.logger.info(`   API Key: ${(0, env_1.maskApiKey)(key)}`);
    }
    else {
        logger_1.logger.error(`❌ Failed to authenticate with ${service.toUpperCase()}`);
        logger_1.logger.error('Please check your API key and try again.');
        process.exit(1);
    }
}
async function interactiveLogin(config, configFile) {
    logger_1.logger.info('🔐 Interactive Login to Dooray AI Services');
    const inquirer = await Promise.resolve().then(() => __importStar(require('inquirer')));
    // 서비스 선택
    const { services } = await inquirer.default.prompt([
        {
            type: 'checkbox',
            name: 'services',
            message: 'Select services to login to:',
            choices: [
                { name: 'Claude API (Anthropic)', value: 'claude', checked: true },
                { name: 'OpenAI API', value: 'openai' },
                { name: 'Anthropic API (Direct)', value: 'anthropic' },
                { name: 'Dooray! API', value: 'dooray' },
                { name: 'GitHub Token', value: 'github' }
            ]
        }
    ]);
    if (services.length === 0) {
        logger_1.logger.info('No services selected. Exiting...');
        return;
    }
    // 각 서비스별 API 키 입력
    const credentials = {};
    for (const service of services) {
        const { apiKey } = await inquirer.default.prompt([
            {
                type: 'password',
                name: 'apiKey',
                message: `Enter ${service.toUpperCase()} API key:`,
                mask: '*',
                validate: (input) => {
                    if (!input || input.trim() === '') {
                        return 'API key is required';
                    }
                    return true;
                }
            }
        ]);
        credentials[service] = apiKey;
    }
    // 각 서비스 인증 검증 및 저장
    let successCount = 0;
    for (const [service, apiKey] of Object.entries(credentials)) {
        logger_1.logger.info(`Validating ${service.toUpperCase()} credentials...`);
        const isValid = await validateServiceCredentials(service, apiKey);
        if (isValid) {
            await updateServiceCredentials(service, apiKey, config);
            logger_1.logger.success(`✅ ${service.toUpperCase()}: Authentication successful`);
            successCount++;
        }
        else {
            logger_1.logger.error(`❌ ${service.toUpperCase()}: Authentication failed`);
        }
    }
    // 설정 저장
    config.auth = config.auth || {};
    config.auth.lastLogin = new Date();
    await fs_extra_1.default.writeJson(configFile, config, { spaces: 2 });
    // 결과 요약
    logger_1.logger.info(`\n📊 Login Summary:`);
    logger_1.logger.info(`   Successful: ${successCount}/${services.length} services`);
    if (successCount === services.length) {
        logger_1.logger.success('🎉 All services authenticated successfully!');
    }
    else if (successCount > 0) {
        logger_1.logger.warn('⚠️  Some services failed to authenticate. Check your API keys.');
    }
    else {
        logger_1.logger.error('❌ All authentication attempts failed.');
    }
}
async function logoutFromAllServices(config, configFile) {
    // 모든 인증 정보 제거
    if (config.ai)
        delete config.ai.apiKey;
    if (config.dooray)
        delete config.dooray.apiKey;
    if (config.github)
        delete config.github.token;
    if (config.auth)
        delete config.auth;
    // 환경 변수도 제거 (현재 세션에서만)
    delete process.env['CLAUDE_API_KEY'];
    delete process.env['OPENAI_API_KEY'];
    delete process.env['ANTHROPIC_API_KEY'];
    delete process.env['DOORAY_API_KEY'];
    delete process.env['GITHUB_TOKEN'];
    await fs_extra_1.default.writeJson(configFile, config, { spaces: 2 });
    logger_1.logger.success('✅ Logged out from all services');
}
async function logoutFromService(service, config, configFile) {
    // 서비스별 인증 정보 제거
    switch (service) {
        case 'claude':
        case 'openai':
        case 'anthropic':
            if (config.ai)
                delete config.ai.apiKey;
            break;
        case 'dooray':
            if (config.dooray)
                delete config.dooray.apiKey;
            break;
        case 'github':
            if (config.github)
                delete config.github.token;
            break;
        default:
            logger_1.logger.error(`Unknown service: ${service}`);
            return;
    }
    await fs_extra_1.default.writeJson(configFile, config, { spaces: 2 });
    logger_1.logger.success(`✅ Logged out from ${service.toUpperCase()}`);
}
async function interactiveLogout(config, configFile) {
    const credentials = extractCredentials(config);
    const authenticatedServices = [];
    if (credentials.claudeApiKey)
        authenticatedServices.push('claude');
    if (credentials.openaiApiKey)
        authenticatedServices.push('openai');
    if (credentials.anthropicApiKey)
        authenticatedServices.push('anthropic');
    if (credentials.doorayApiKey)
        authenticatedServices.push('dooray');
    if (credentials.githubToken)
        authenticatedServices.push('github');
    if (authenticatedServices.length === 0) {
        logger_1.logger.info('No authenticated services found.');
        return;
    }
    const inquirer = await Promise.resolve().then(() => __importStar(require('inquirer')));
    const { action } = await inquirer.default.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                { name: 'Logout from specific services', value: 'specific' },
                { name: 'Logout from all services', value: 'all' },
                { name: 'Cancel', value: 'cancel' }
            ]
        }
    ]);
    if (action === 'cancel') {
        logger_1.logger.info('Logout cancelled.');
        return;
    }
    if (action === 'all') {
        const { confirm } = await inquirer.default.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Are you sure you want to logout from all services?',
                default: false
            }
        ]);
        if (confirm) {
            await logoutFromAllServices(config, configFile);
        }
        return;
    }
    const { services } = await inquirer.default.prompt([
        {
            type: 'checkbox',
            name: 'services',
            message: 'Select services to logout from:',
            choices: authenticatedServices.map(service => ({
                name: service.toUpperCase(),
                value: service
            }))
        }
    ]);
    for (const service of services) {
        await logoutFromService(service, config, configFile);
    }
}
async function updateServiceCredentials(service, apiKey, config) {
    // 설정 구조 초기화
    config.ai = config.ai || {};
    config.dooray = config.dooray || {};
    config.github = config.github || {};
    switch (service) {
        case 'claude':
            config.ai.provider = 'claude';
            config.ai.apiKey = apiKey;
            process.env['CLAUDE_API_KEY'] = apiKey;
            break;
        case 'openai':
            config.ai.provider = 'openai';
            config.ai.apiKey = apiKey;
            process.env['OPENAI_API_KEY'] = apiKey;
            break;
        case 'anthropic':
            config.ai.provider = 'anthropic';
            config.ai.apiKey = apiKey;
            process.env['ANTHROPIC_API_KEY'] = apiKey;
            break;
        case 'dooray':
            config.dooray.apiKey = apiKey;
            process.env['DOORAY_API_KEY'] = apiKey;
            break;
        case 'github':
            config.github.token = apiKey;
            process.env['GITHUB_TOKEN'] = apiKey;
            break;
    }
}
async function validateServiceCredentials(service, apiKey) {
    try {
        switch (service) {
            case 'claude':
                const claudeClient = new claude_client_1.ClaudeClient(apiKey);
                return await claudeClient.validateConnection();
            case 'openai':
                // OpenAI 검증 로직 (추후 구현)
                return true;
            case 'anthropic':
                // Anthropic 검증 로직 (추후 구현)  
                return true;
            case 'dooray':
                // Dooray API 검증 로직 (추후 구현)
                return true;
            case 'github':
                // GitHub API 검증 로직 (추후 구현)
                return true;
            default:
                return false;
        }
    }
    catch (error) {
        logger_1.logger.debug(`Validation failed for ${service}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return false;
    }
}
function extractCredentials(config) {
    const credentials = {
        loginStatus: 'none'
    };
    if (config.ai?.provider === 'claude' && config.ai?.apiKey) {
        credentials.claudeApiKey = config.ai.apiKey;
    }
    if (config.ai?.provider === 'openai' && config.ai?.apiKey) {
        credentials.openaiApiKey = config.ai.apiKey;
    }
    if (config.ai?.provider === 'anthropic' && config.ai?.apiKey) {
        credentials.anthropicApiKey = config.ai.apiKey;
    }
    if (config.dooray?.apiKey) {
        credentials.doorayApiKey = config.dooray.apiKey;
    }
    if (config.github?.token) {
        credentials.githubToken = config.github.token;
    }
    if (config.auth?.lastLogin) {
        credentials.lastLogin = new Date(config.auth.lastLogin);
    }
    return credentials;
}
function getOverallLoginStatus(credentials) {
    const hasAnyAI = !!(credentials.claudeApiKey || credentials.openaiApiKey || credentials.anthropicApiKey);
    const hasAnyService = !!(credentials.doorayApiKey || credentials.githubToken);
    if (hasAnyAI && hasAnyService) {
        return 'authenticated';
    }
    else if (hasAnyAI || hasAnyService) {
        return 'partial';
    }
    else {
        return 'none';
    }
}
//# sourceMappingURL=login.js.map