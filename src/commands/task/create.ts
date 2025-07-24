import { Command } from 'commander';
import { logger } from '../../utils/logger';
// inquirer는 ES Module이므로 dynamic import 사용

export const createTaskCommand = new Command('create')
  .description('Create a new task and corresponding branch')
  .argument('[description]', 'Task description')
  .option('-b, --branch <name>', 'Custom branch name')
  .option('-p, --priority <level>', 'Task priority (low, medium, high)', 'medium')
  .option('--no-branch', 'Do not create a branch')
  .action(async (description: string | undefined, options) => {
    try {
      logger.progress('Creating new task...');
      
      let taskDescription = description;
      
      // 설명이 없으면 사용자에게 입력 요청
      if (!taskDescription) {
        const inquirer = await import('inquirer');
        const { desc } = await inquirer.default.prompt([
          {
            type: 'input',
            name: 'desc',
            message: 'Enter task description:',
            validate: (input: string) => input.trim().length > 0 || 'Description is required'
          }
        ]);
        taskDescription = desc;
      }
      
             // 브랜치 이름 생성 또는 사용자 입력
       let branchName = options.branch;
       if (!branchName && options.branch !== false && taskDescription) {
         branchName = taskDescription
           .toLowerCase()
           .replace(/[^a-z0-9\s-]/g, '')
           .replace(/\s+/g, '-')
           .substring(0, 50);
         branchName = `feature/${branchName}`;
       }
      
      logger.info(`Task Description: ${taskDescription}`);
      logger.info(`Priority: ${options.priority}`);
      
      if (branchName) {
        logger.info(`Branch Name: ${branchName}`);
      }
      
      // TODO: 실제 Dooray! API 호출 및 Git 브랜치 생성
      logger.warn('Task creation implementation coming soon!');
      logger.success('Task structure prepared! 🎯');
      
    } catch (error) {
      logger.error(`Task creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  }); 