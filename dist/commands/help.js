"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.helpCommand = void 0;
const commander_1 = require("commander");
const logger_1 = require("../utils/logger");
const help_1 = require("../utils/help");
const helpData_1 = require("../utils/helpData");
const chalk_1 = __importDefault(require("chalk"));
exports.helpCommand = new commander_1.Command('help')
    .description('명령어에 대한 상세 도움말을 표시합니다')
    .argument('[command]', '도움말을 볼 명령어')
    .option('--quick-start', '빠른 시작 가이드를 표시합니다')
    .option('--categories', '명령어를 카테고리별로 표시합니다')
    .action(async (command, _options, cmd) => {
    try {
        const opts = cmd.opts();
        // 빠른 시작 가이드
        if (opts.quickStart) {
            console.log(help_1.helpFormatter.formatQuickStart());
            return;
        }
        // 카테고리별 명령어 표시
        if (opts.categories) {
            showCommandCategories();
            return;
        }
        // 특정 명령어 도움말
        if (command) {
            showCommandHelp(command);
            return;
        }
        // 전체 도움말 (기본)
        showGeneralHelp();
    }
    catch (error) {
        logger_1.logger.error(`도움말 표시 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
});
/**
 * 특정 명령어 도움말 표시
 */
function showCommandHelp(commandName) {
    const helpInfo = helpData_1.helpData[commandName];
    if (helpInfo) {
        console.log(help_1.helpFormatter.formatCommandHelp(helpInfo));
    }
    else {
        console.log(chalk_1.default.red(`❌ "${commandName}" 명령어에 대한 도움말을 찾을 수 없습니다.`));
        console.log('');
        console.log(chalk_1.default.yellow('사용 가능한 명령어:'));
        Object.keys(helpData_1.helpData).forEach(cmd => {
            console.log(`  ${chalk_1.default.cyan(cmd)}`);
        });
        console.log('');
        console.log(chalk_1.default.gray('전체 명령어 목록: dooray-ai --help'));
    }
}
/**
 * 카테고리별 명령어 표시
 */
function showCommandCategories() {
    console.log(chalk_1.default.bold.blue('📚 dooray-ai 명령어 카테고리'));
    console.log('');
    Object.entries(helpData_1.commandCategories).forEach(([category, commands]) => {
        console.log(chalk_1.default.bold.yellow(`${category}:`));
        commands.forEach(command => {
            const helpInfo = helpData_1.helpData[command];
            const description = helpInfo ? helpInfo.description : '설명 없음';
            console.log(`  ${chalk_1.default.cyan(command).padEnd(20)} ${chalk_1.default.gray(description)}`);
        });
        console.log('');
    });
    console.log(chalk_1.default.gray('특정 명령어의 자세한 도움말: dooray-ai help <command>'));
}
/**
 * 전체 도움말 표시
 */
function showGeneralHelp() {
    console.log(chalk_1.default.bold.blue('🤖 dooray-ai - AI 기반 개발 자동화 CLI'));
    console.log('');
    console.log(chalk_1.default.white('Dooray!와 연동하여 자연어 기반 개발 작업을 자동화합니다.'));
    console.log('');
    console.log(chalk_1.default.bold.yellow('주요 기능:'));
    console.log(`  ${chalk_1.default.green('•')} 자연어로 작업 생성 및 브랜치 관리`);
    console.log(`  ${chalk_1.default.green('•')} AI 기반 코드 생성 및 수정`);
    console.log(`  ${chalk_1.default.green('•')} Dooray! 연동 및 작업 동기화`);
    console.log(`  ${chalk_1.default.green('•')} GitHub PR 자동 생성 및 관리`);
    console.log('');
    console.log(chalk_1.default.bold.yellow('빠른 시작:'));
    console.log(`  ${chalk_1.default.cyan('dooray-ai help --quick-start')} - 빠른 시작 가이드`);
    console.log(`  ${chalk_1.default.cyan('dooray-ai init')} - 프로젝트 초기화`);
    console.log(`  ${chalk_1.default.cyan('dooray-ai config')} - 설정 구성`);
    console.log('');
    console.log(chalk_1.default.bold.yellow('자주 사용하는 명령어:'));
    const frequentCommands = ['init', 'config', 'task create', 'task list'];
    frequentCommands.forEach(command => {
        const helpInfo = helpData_1.helpData[command];
        if (helpInfo) {
            console.log(`  ${chalk_1.default.cyan(command).padEnd(15)} ${chalk_1.default.gray(helpInfo.description)}`);
        }
    });
    console.log('');
    console.log(chalk_1.default.bold.yellow('추가 도움말:'));
    console.log(`  ${chalk_1.default.cyan('dooray-ai help <command>')} - 특정 명령어 상세 도움말`);
    console.log(`  ${chalk_1.default.cyan('dooray-ai help --categories')} - 카테고리별 명령어 목록`);
    console.log(`  ${chalk_1.default.cyan('dooray-ai <command> --help')} - 명령어 옵션 확인`);
    console.log('');
    console.log(chalk_1.default.gray('문서: https://github.com/dooray/dooray-ai'));
    console.log(chalk_1.default.gray('버그 신고: https://github.com/dooray/dooray-ai/issues'));
}
//# sourceMappingURL=help.js.map