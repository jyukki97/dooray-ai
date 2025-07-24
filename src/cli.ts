#!/usr/bin/env node

import { Command } from 'commander';
import { version } from '../package.json';
import { logger, LogLevel } from './utils/logger';
import { initCommand } from './commands/init';
import { configCommand } from './commands/config';
import { taskCommand } from './commands/task';
import { branchCommand } from './commands/branch';
import { prCommand } from './commands/pr';

const program = new Command();

program
  .name('dooray-ai')
  .description('AI-powered CLI tool for automated development workflow with Dooray! integration')
  .version(version);

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
    logger.configure({ level: LogLevel.DEBUG });
  }
  
  if (opts['silent']) {
    logger.configure({ level: LogLevel.ERROR });
  }
  
  // 컬러 비활성화는 현재 logger에서 지원하지 않음
  // TODO: 향후 logger 클래스에 컬러 옵션 추가 필요
});

// 명령어 등록
program.addCommand(initCommand);
program.addCommand(configCommand);
program.addCommand(taskCommand);
program.addCommand(branchCommand);
program.addCommand(prCommand);

// 하위 호환성을 위한 기본 명령어 유지
program
  .command('generate')
  .alias('gen')
  .description('Generate code based on task description (legacy)')
  .argument('<description>', 'Task description')
  .action((description: string) => {
    logger.progress('Generating code...');
    logger.info(`Task: ${description}`, 'GENERATE');
    logger.warn('Use "dooray-ai task create" for new task creation workflow!');
  });

program
  .command('test')
  .description('Test the CLI setup')
  .action(() => {
    logger.success('dooray-ai CLI is working!');
    logger.info(`Version: ${version}`, 'TEST');
    logger.success('All systems operational! 🎉');
  });

// 에러 처리
program.on('command:*', () => {
  logger.error(`Invalid command: ${program.args.join(' ')}\nSee --help for a list of available commands.`, 'CLI');
  process.exit(1);
});

// 프로그램 파싱 및 실행
if (require.main === module) {
  program.parse();
}

export default program; 