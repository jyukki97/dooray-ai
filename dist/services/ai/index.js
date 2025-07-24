"use strict";
/**
 * AI 서비스 모듈 인덱스
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
exports.AIClientFactory = exports.ClaudeClient = void 0;
exports.getDefaultAIClient = getDefaultAIClient;
exports.resetDefaultAIClient = resetDefaultAIClient;
// 타입과 인터페이스
__exportStar(require("./types"), exports);
// Claude 클라이언트
var claude_client_1 = require("./claude-client");
Object.defineProperty(exports, "ClaudeClient", { enumerable: true, get: function () { return claude_client_1.ClaudeClient; } });
// AI 클라이언트 팩토리
const claude_client_2 = require("./claude-client");
const types_1 = require("./types");
const env_1 = require("../../config/env");
const logger_1 = require("../../utils/logger");
/**
 * AI 클라이언트 팩토리
 */
class AIClientFactory {
    /**
     * 설정에 따라 적절한 AI 클라이언트 생성
     */
    static createClient(config) {
        const engine = config?.engine || env_1.env.defaultAiEngine;
        const apiKey = config?.apiKey;
        logger_1.logger.info(`Creating AI client for engine: ${engine}`);
        switch (engine) {
            case types_1.AIEngine.CLAUDE_CODE:
            case types_1.AIEngine.ANTHROPIC:
                return new claude_client_2.ClaudeClient(apiKey);
            case types_1.AIEngine.OPENAI:
                throw new types_1.AIError('OpenAI client not yet implemented', 'CLIENT_NOT_IMPLEMENTED', types_1.AIEngine.OPENAI);
            default:
                throw new types_1.AIError(`Unsupported AI engine: ${engine}`, 'UNSUPPORTED_ENGINE', engine);
        }
    }
    /**
     * 기본 클라이언트 생성 (설정에서 기본 엔진 사용)
     */
    static createDefaultClient() {
        return this.createClient();
    }
    /**
     * 사용 가능한 AI 엔진 목록 반환
     */
    static getAvailableEngines() {
        const engines = [];
        // Claude API 키가 있으면 추가
        if (env_1.env.claudeApiKey) {
            engines.push(types_1.AIEngine.CLAUDE_CODE);
        }
        // OpenAI API 키가 있으면 추가 (미구현)
        if (env_1.env.openaiApiKey) {
            engines.push(types_1.AIEngine.OPENAI);
        }
        return engines;
    }
    /**
     * 모든 설정된 클라이언트의 연결 상태 확인
     */
    static async validateAllConnections() {
        const results = {};
        const availableEngines = this.getAvailableEngines();
        for (const engine of availableEngines) {
            try {
                const client = this.createClient({ engine });
                results[engine] = await client.validateConnection();
            }
            catch (error) {
                logger_1.logger.error(`Failed to validate ${engine}:`, error);
                results[engine] = false;
            }
        }
        return results;
    }
}
exports.AIClientFactory = AIClientFactory;
/**
 * 기본 AI 클라이언트 인스턴스 (싱글톤)
 */
let defaultClient = null;
function getDefaultAIClient() {
    if (!defaultClient) {
        defaultClient = AIClientFactory.createDefaultClient();
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