"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
exports.getEnvironmentConfig = getEnvironmentConfig;
exports.maskApiKey = maskApiKey;
exports.displayEnvironmentInfo = displayEnvironmentInfo;
const dotenv_1 = require("dotenv");
const logger_1 = require("../utils/logger");
// 환경 변수 로드
(0, dotenv_1.config)();
/**
 * 필수 환경 변수 목록
 */
const REQUIRED_ENV_VARS = [
    'NODE_ENV'
];
/**
 * 선택적 환경 변수와 기본값
 */
const OPTIONAL_ENV_VARS = {
    LOG_LEVEL: 'info',
    DEFAULT_AI_ENGINE: 'claude-code',
    MAX_TOKENS: '4000',
    REQUEST_TIMEOUT: '30000'
};
/**
 * 환경 변수 유효성 검증
 */
function validateEnvironment() {
    const missing = [];
    // 필수 환경 변수 확인
    for (const envVar of REQUIRED_ENV_VARS) {
        if (!process.env[envVar]) {
            missing.push(envVar);
        }
    }
    if (missing.length > 0) {
        const message = `Missing required environment variables: ${missing.join(', ')}`;
        logger_1.logger.error(message);
        throw new Error(message);
    }
    // AI API 키 중 최소 하나는 있어야 함
    const hasAnyAiKey = !!(process.env['CLAUDE_API_KEY'] ||
        process.env['OPENAI_API_KEY'] ||
        process.env['ANTHROPIC_API_KEY']);
    if (!hasAnyAiKey) {
        logger_1.logger.warn('No AI API keys configured. Some features may not work.');
    }
}
/**
 * 환경 변수 파싱 및 반환
 */
function getEnvironmentConfig() {
    validateEnvironment();
    return {
        // AI API 키들
        claudeApiKey: process.env['CLAUDE_API_KEY'],
        openaiApiKey: process.env['OPENAI_API_KEY'],
        anthropicApiKey: process.env['ANTHROPIC_API_KEY'],
        // 서비스 API 키들
        doorayApiKey: process.env['DOORAY_API_KEY'],
        githubToken: process.env['GITHUB_TOKEN'],
        // 애플리케이션 설정
        nodeEnv: process.env['NODE_ENV'] || 'development',
        logLevel: process.env['LOG_LEVEL'] || OPTIONAL_ENV_VARS.LOG_LEVEL,
        // AI 설정
        defaultAiEngine: process.env['DEFAULT_AI_ENGINE'] || OPTIONAL_ENV_VARS.DEFAULT_AI_ENGINE,
        maxTokens: parseInt(process.env['MAX_TOKENS'] || OPTIONAL_ENV_VARS.MAX_TOKENS, 10),
        requestTimeout: parseInt(process.env['REQUEST_TIMEOUT'] || OPTIONAL_ENV_VARS.REQUEST_TIMEOUT, 10)
    };
}
/**
 * API 키 마스킹 유틸리티
 */
function maskApiKey(apiKey) {
    if (!apiKey || apiKey.length < 8) {
        return '[HIDDEN]';
    }
    return `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
}
/**
 * 환경 변수 정보 표시 (보안 정보 제외)
 */
function displayEnvironmentInfo() {
    const config = getEnvironmentConfig();
    logger_1.logger.info('Environment Configuration:');
    logger_1.logger.info(`  Node Environment: ${config.nodeEnv}`);
    logger_1.logger.info(`  Log Level: ${config.logLevel}`);
    logger_1.logger.info(`  Default AI Engine: ${config.defaultAiEngine}`);
    logger_1.logger.info(`  Max Tokens: ${config.maxTokens}`);
    logger_1.logger.info(`  Request Timeout: ${config.requestTimeout}ms`);
    // API 키 상태 (마스킹)
    logger_1.logger.info('API Keys Status:');
    logger_1.logger.info(`  Claude API Key: ${config.claudeApiKey ? maskApiKey(config.claudeApiKey) : 'Not configured'}`);
    logger_1.logger.info(`  OpenAI API Key: ${config.openaiApiKey ? maskApiKey(config.openaiApiKey) : 'Not configured'}`);
    logger_1.logger.info(`  Anthropic API Key: ${config.anthropicApiKey ? maskApiKey(config.anthropicApiKey) : 'Not configured'}`);
    logger_1.logger.info(`  Dooray API Key: ${config.doorayApiKey ? maskApiKey(config.doorayApiKey) : 'Not configured'}`);
    logger_1.logger.info(`  GitHub Token: ${config.githubToken ? maskApiKey(config.githubToken) : 'Not configured'}`);
}
// 전역 환경 설정 인스턴스
exports.env = getEnvironmentConfig();
//# sourceMappingURL=env.js.map