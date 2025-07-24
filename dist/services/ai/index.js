"use strict";
/**
 * AI 서비스 모듈 인덱스 (Claude Code 전용)
 */
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIClientFactory = exports.fallbackHandler = exports.engineSelector = exports.codeGenerator = exports.ClaudeCodeClient = void 0;
exports.getDefaultAIClient = getDefaultAIClient;
exports.resetDefaultAIClient = resetDefaultAIClient;
// 타입과 인터페이스
__exportStar(require("./types"), exports);
// Claude Code 클라이언트
var claude_code_client_1 = require("./claude-code-client");
Object.defineProperty(exports, "ClaudeCodeClient", { enumerable: true, get: function () { return claude_code_client_1.ClaudeCodeClient; } });
// 고급 AI 서비스
var code_generator_1 = require("./code-generator");
Object.defineProperty(exports, "codeGenerator", { enumerable: true, get: function () { return code_generator_1.codeGenerator; } });
var engine_selector_1 = require("./engine-selector");
Object.defineProperty(exports, "engineSelector", { enumerable: true, get: function () { return engine_selector_1.engineSelector; } });
var fallback_handler_1 = require("./fallback-handler");
Object.defineProperty(exports, "fallbackHandler", { enumerable: true, get: function () { return fallback_handler_1.fallbackHandler; } });
// AI 클라이언트 팩토리
const claude_code_client_2 = require("./claude-code-client");
const engine_selector_2 = require("./engine-selector");
const types_1 = require("./types");
const logger_1 = require("../../utils/logger");
/**
 * AI 클라이언트 팩토리 (Claude Code 전용)
 */
class AIClientFactory {
    /**
     * Claude Code 클라이언트 생성
     */
    static createClient(config) {
        const engine = config?.engine || types_1.AIEngine.CLAUDE_CODE;
        logger_1.logger.info(`Creating AI client for engine: ${engine}`);
        if (engine !== types_1.AIEngine.CLAUDE_CODE) {
            throw new types_1.AIError(`Only Claude Code is supported. Unsupported engine: ${engine}`, 'UNSUPPORTED_ENGINE', engine);
        }
        logger_1.logger.info('Using Claude Code CLI client (no API key required)');
        return new claude_code_client_2.ClaudeCodeClient();
    }
    /**
     * 기본 클라이언트 생성 (엔진 선택기 사용)
     */
    static async createDefaultClient() {
        return await engine_selector_2.engineSelector.createBestClient();
    }
    /**
     * 사용 가능한 AI 엔진 목록 반환
     */
    static getAvailableEngines() {
        return [types_1.AIEngine.CLAUDE_CODE];
    }
    /**
     * Claude Code CLI 연결 상태 확인
     */
    static async validateConnection() {
        try {
            const client = this.createClient();
            return await client.validateConnection();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`Failed to validate Claude Code: ${errorMessage}`);
            return false;
        }
    }
}
exports.AIClientFactory = AIClientFactory;
/**
 * 기본 AI 클라이언트 인스턴스 (싱글톤)
 */
let defaultClient = null;
async function getDefaultAIClient() {
    if (!defaultClient) {
        defaultClient = await AIClientFactory.createDefaultClient();
    }
    return defaultClient;
}
/**
 * 기본 클라이언트 재설정
 */
function resetDefaultAIClient() {
    defaultClient = null;
}
//# sourceMappingURL=index.js.map