"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claudeCodeCommand = exports.aiCommand = void 0;
const commander_1 = require("commander");
const claude_code_1 = require("./claude-code");
/**
 * AI 관련 명령어들 (Claude Code 전용)
 */
exports.aiCommand = new commander_1.Command('ai')
    .description('AI 코드 생성 (Claude Code CLI 사용, API 키 불필요)')
    .addCommand(claude_code_1.claudeCodeCommand);
// Claude Code 명령어 export
var claude_code_2 = require("./claude-code");
Object.defineProperty(exports, "claudeCodeCommand", { enumerable: true, get: function () { return claude_code_2.claudeCodeCommand; } });
//# sourceMappingURL=index.js.map