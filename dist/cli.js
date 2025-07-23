#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const package_json_1 = require("../package.json");
const logger_1 = require("./utils/logger");
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
    logger_1.logger.progress('Initializing dooray-ai...');
    logger_1.logger.info('This feature will be implemented in upcoming tasks!');
});
program
    .command('generate')
    .alias('gen')
    .description('Generate code based on task description')
    .argument('<description>', 'Task description')
    .action((description) => {
    logger_1.logger.progress('Generating code...');
    logger_1.logger.info(`Task: ${description}`, 'GENERATE');
    logger_1.logger.warn('This feature will be implemented in upcoming tasks!');
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