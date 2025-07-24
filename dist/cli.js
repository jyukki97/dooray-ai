#!/usr/bin/env node
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
const commander_1 = require("commander");
const package_json_1 = require("../package.json");
const logger_1 = require("./utils/logger");
const init_1 = require("./commands/init");
const config_1 = require("./commands/config");
const task_1 = require("./commands/task");
const branch_1 = require("./commands/branch");
const pr_1 = require("./commands/pr");
const help_1 = require("./commands/help");
const ai_1 = require("./commands/ai");
const auth_1 = require("./commands/auth");
const workflow_1 = __importDefault(require("./commands/workflow"));
const program = new commander_1.Command();
program
    .name('dooray-ai')
    .description('AI-powered CLI tool for automated development workflow with Dooray! integration')
    .version(package_json_1.version);
// 전역 옵션
program
    .option('-v, --verbose', 'Enable verbose logging')
    .option('-s, --silent', 'Minimize output')
    .option('--no-color', 'Disable colored output')
    .option('-c, --config <path>', 'Specify config file path');
// 전역 옵션 처리
program.hook('preAction', (thisCommand, _actionCommand) => {
    const opts = thisCommand.opts();
    if (opts['verbose']) {
        logger_1.logger.configure({ level: logger_1.LogLevel.DEBUG });
    }
    if (opts['silent']) {
        logger_1.logger.configure({ level: logger_1.LogLevel.ERROR });
    }
    // 컬러 비활성화는 현재 logger에서 지원하지 않음
    // TODO: 향후 logger 클래스에 컬러 옵션 추가 필요
});
// 명령어 등록
program.addCommand(init_1.initCommand);
program.addCommand(config_1.configCommand);
program.addCommand(task_1.taskCommand);
program.addCommand(branch_1.branchCommand);
program.addCommand(pr_1.prCommand);
program.addCommand(help_1.helpCommand);
program.addCommand(ai_1.aiCommand);
program.addCommand(auth_1.authCommand);
program.addCommand(workflow_1.default);
// 하위 호환성을 위한 기본 명령어 유지
program
    .command('generate')
    .alias('gen')
    .description('Generate code using Claude Code CLI (no API key required)')
    .argument('<description>', 'Description of code to generate')
    .option('--language <lang>', 'Programming language', 'typescript')
    .action(async (description, options) => {
    try {
        logger_1.logger.info('🔄 Redirecting to Claude Code generator...');
        // 동적으로 Claude Code 클라이언트 사용
        const { ClaudeCodeClient } = await Promise.resolve().then(() => __importStar(require('./services/ai/claude-code-client')));
        const client = new ClaudeCodeClient();
        const result = await client.generateCode({
            prompt: description,
            language: options.language,
            maxTokens: 2000
        });
        console.log('\n🚀 Generated Code:');
        console.log('```' + options.language);
        console.log(result.code);
        console.log('```');
        if (result.explanation) {
            console.log('\n💡 Explanation:');
            console.log(result.explanation);
        }
        logger_1.logger.success('Code generation completed! Use "dooray-ai ai generate" for more options.');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.logger.error(`Code generation failed: ${errorMessage}`);
        logger_1.logger.info('💡 Make sure Claude Code CLI is installed: https://claude.ai/cli');
    }
});
program
    .command('test')
    .description('Test the CLI setup')
    .action(() => {
    logger_1.logger.success('dooray-ai CLI is working!');
    logger_1.logger.info(`Version: ${package_json_1.version}`, 'TEST');
    logger_1.logger.success('All systems operational! 🎉');
});
// 에러 처리
program.on('command:*', () => {
    logger_1.logger.error(`Invalid command: ${program.args.join(' ')}\nSee --help for a list of available commands.`, 'CLI');
    process.exit(1);
});
// 프로그램 파싱 및 실행
if (require.main === module) {
    program.parse();
}
exports.default = program;
//# sourceMappingURL=cli.js.map