#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const package_json_1 = require("../package.json");
const program = new commander_1.Command();
program
    .name('dooray-ai')
    .description('AI-powered CLI tool for automated development workflow with Dooray! integration')
    .version(package_json_1.version);
// 기본 명령어
program
    .command('init')
    .description('Initialize dooray-ai in current project')
    .action(() => {
    console.log(chalk_1.default.green('🚀 Initializing dooray-ai...'));
    console.log(chalk_1.default.blue('This feature will be implemented in upcoming tasks!'));
});
program
    .command('generate')
    .alias('gen')
    .description('Generate code based on task description')
    .argument('<description>', 'Task description')
    .action((description) => {
    console.log(chalk_1.default.green('🤖 Generating code...'));
    console.log(chalk_1.default.blue(`Task: ${description}`));
    console.log(chalk_1.default.yellow('This feature will be implemented in upcoming tasks!'));
});
program
    .command('test')
    .description('Test the CLI setup')
    .action(() => {
    console.log(chalk_1.default.green('✅ dooray-ai CLI is working!'));
    console.log(chalk_1.default.blue(`Version: ${package_json_1.version}`));
    console.log(chalk_1.default.yellow('All systems operational! 🎉'));
});
// 에러 처리
program.on('command:*', () => {
    console.error(chalk_1.default.red('Invalid command: %s\nSee --help for a list of available commands.'), program.args.join(' '));
    process.exit(1);
});
// 프로그램 파싱 및 실행
if (require.main === module) {
    program.parse();
}
exports.default = program;
//# sourceMappingURL=cli.js.map