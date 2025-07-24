#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const package_json_1 = require("../package.json");
const logger_1 = require("./utils/logger");
const init_1 = require("./commands/init");
const config_1 = require("./commands/config");
const task_1 = require("./commands/task");
const branch_1 = require("./commands/branch");
const pr_1 = require("./commands/pr");
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
// 하위 호환성을 위한 기본 명령어 유지
program
    .command('generate')
    .alias('gen')
    .description('Generate code based on task description (legacy)')
    .argument('<description>', 'Task description')
    .action((description) => {
    logger_1.logger.progress('Generating code...');
    logger_1.logger.info(`Task: ${description}`, 'GENERATE');
    logger_1.logger.warn('Use "dooray-ai task create" for new task creation workflow!');
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