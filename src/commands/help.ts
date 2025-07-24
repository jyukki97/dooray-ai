import { Command } from 'commander';
import { logger } from '../utils/logger';
import { helpFormatter } from '../utils/help';
import { helpData, commandCategories } from '../utils/helpData';
import chalk from 'chalk';

export const helpCommand = new Command('help')
  .description('명령어에 대한 상세 도움말을 표시합니다')
  .argument('[command]', '도움말을 볼 명령어')
  .option('--quick-start', '빠른 시작 가이드를 표시합니다')
  .option('--categories', '명령어를 카테고리별로 표시합니다')
  .action(async (command: string | undefined, _options, cmd) => {
    try {
      const opts = cmd.opts();
      
      // 빠른 시작 가이드
      if (opts.quickStart) {
        console.log(helpFormatter.formatQuickStart());
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

    } catch (error) {
      logger.error(`도움말 표시 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

/**
 * 특정 명령어 도움말 표시
 */
function showCommandHelp(commandName: string): void {
  const helpInfo = helpData[commandName as keyof typeof helpData];
  
  if (helpInfo) {
    console.log(helpFormatter.formatCommandHelp(helpInfo));
  } else {
    console.log(chalk.red(`❌ "${commandName}" 명령어에 대한 도움말을 찾을 수 없습니다.`));
    console.log('');
    console.log(chalk.yellow('사용 가능한 명령어:'));
    Object.keys(helpData).forEach(cmd => {
      console.log(`  ${chalk.cyan(cmd)}`);
    });
    console.log('');
    console.log(chalk.gray('전체 명령어 목록: dooray-ai --help'));
  }
}

/**
 * 카테고리별 명령어 표시
 */
function showCommandCategories(): void {
  console.log(chalk.bold.blue('📚 dooray-ai 명령어 카테고리'));
  console.log('');

  Object.entries(commandCategories).forEach(([category, commands]) => {
    console.log(chalk.bold.yellow(`${category}:`));
    commands.forEach(command => {
      const helpInfo = helpData[command as keyof typeof helpData];
      const description = helpInfo ? helpInfo.description : '설명 없음';
      console.log(`  ${chalk.cyan(command).padEnd(20)} ${chalk.gray(description)}`);
    });
    console.log('');
  });

  console.log(chalk.gray('특정 명령어의 자세한 도움말: dooray-ai help <command>'));
}

/**
 * 전체 도움말 표시
 */
function showGeneralHelp(): void {
  console.log(chalk.bold.blue('🤖 dooray-ai - AI 기반 개발 자동화 CLI'));
  console.log('');
  console.log(chalk.white('Dooray!와 연동하여 자연어 기반 개발 작업을 자동화합니다.'));
  console.log('');
  
  console.log(chalk.bold.yellow('주요 기능:'));
  console.log(`  ${chalk.green('•')} 자연어로 작업 생성 및 브랜치 관리`);
  console.log(`  ${chalk.green('•')} AI 기반 코드 생성 및 수정`);
  console.log(`  ${chalk.green('•')} Dooray! 연동 및 작업 동기화`);
  console.log(`  ${chalk.green('•')} GitHub PR 자동 생성 및 관리`);
  console.log('');

  console.log(chalk.bold.yellow('빠른 시작:'));
  console.log(`  ${chalk.cyan('dooray-ai help --quick-start')} - 빠른 시작 가이드`);
  console.log(`  ${chalk.cyan('dooray-ai init')} - 프로젝트 초기화`);
  console.log(`  ${chalk.cyan('dooray-ai config')} - 설정 구성`);
  console.log('');

  console.log(chalk.bold.yellow('자주 사용하는 명령어:'));
  const frequentCommands = ['init', 'config', 'task create', 'task list'];
  frequentCommands.forEach(command => {
    const helpInfo = helpData[command as keyof typeof helpData];
    if (helpInfo) {
      console.log(`  ${chalk.cyan(command).padEnd(15)} ${chalk.gray(helpInfo.description)}`);
    }
  });
  console.log('');

  console.log(chalk.bold.yellow('추가 도움말:'));
  console.log(`  ${chalk.cyan('dooray-ai help <command>')} - 특정 명령어 상세 도움말`);
  console.log(`  ${chalk.cyan('dooray-ai help --categories')} - 카테고리별 명령어 목록`);
  console.log(`  ${chalk.cyan('dooray-ai <command> --help')} - 명령어 옵션 확인`);
  console.log('');

  console.log(chalk.gray('문서: https://github.com/dooray/dooray-ai'));
  console.log(chalk.gray('버그 신고: https://github.com/dooray/dooray-ai/issues'));
} 