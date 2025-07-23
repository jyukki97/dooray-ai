#!/usr/bin/env node

import { Command } from 'commander';
import { version } from '../package.json';
import { logger } from './utils/logger';

const program = new Command();

program
  .name('dooray-ai')
  .description('AI-powered CLI tool for automated development workflow with Dooray! integration')
  .version(version);

// 기본 명령어
program
  .command('init')
  .description('Initialize dooray-ai in current project')
  .action(() => {
    logger.progress('Initializing dooray-ai...');
    logger.info('This feature will be implemented in upcoming tasks!');
  });

program
  .command('generate')
  .alias('gen')
  .description('Generate code based on task description')
  .argument('<description>', 'Task description')
  .action((description: string) => {
    logger.progress('Generating code...');
    logger.info(`Task: ${description}`, 'GENERATE');
    logger.warn('This feature will be implemented in upcoming tasks!');
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