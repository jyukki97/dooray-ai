"use strict";
/**
 * AI 서비스 공통 타입 정의
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIError = exports.AIEngine = void 0;
// AI 엔진 종류
var AIEngine;
(function (AIEngine) {
    AIEngine["CLAUDE_CODE"] = "claude-code";
    AIEngine["OPENAI"] = "openai";
    AIEngine["ANTHROPIC"] = "anthropic";
})(AIEngine || (exports.AIEngine = AIEngine = {}));
// 오류 타입
class AIError extends Error {
    constructor(message, code, engine, requestId) {
        super(message);
        this.name = 'AIError';
        this.code = code;
        this.engine = engine;
        this.requestId = requestId;
        Object.setPrototypeOf(this, AIError.prototype);
    }
}
exports.AIError = AIError;
//# sourceMappingURL=types.js.map