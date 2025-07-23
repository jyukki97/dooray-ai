#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { version } from '../package.json';

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
    console.log(chalk.green('🚀 Initializing dooray-ai...'));
    console.log(chalk.blue('This feature will be implemented in upcoming tasks!'));
  });

program
  .command('generate')
  .alias('gen')
  .description('Generate code based on task description')
  .argument('<description>', 'Task description')
  .action((description: string) => {
    console.log(chalk.green('🤖 Generating code...'));
    console.log(chalk.blue(`Task: ${description}`));
    console.log(chalk.yellow('This feature will be implemented in upcoming tasks!'));
  });

program
  .command('test')
  .description('Test the CLI setup')
  .action(() => {
    console.log(chalk.green('✅ dooray-ai CLI is working!'));
    console.log(chalk.blue(`Version: ${version}`));
    console.log(chalk.yellow('All systems operational! 🎉'));
  });

// 에러 처리
program.on('command:*', () => {
  console.error(chalk.red('Invalid command: %s\nSee --help for a list of available commands.'), program.args.join(' '));
  process.exit(1);
});

// 프로그램 파싱 및 실행
if (require.main === module) {
  program.parse();
}

export default program; 