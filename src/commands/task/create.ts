import { Command } from 'commander';
import { logger } from '../../utils/logger';
import { createStringValidator } from '../../validators';
import { sanitizeInput, getOptionValue } from '../../utils/input';
import { createValidationError } from '../../utils/errors';
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
            validate: (input: string) => {
              const validator = createStringValidator('Task description')
                .required()
                .minLength(3)
                .maxLength(200);
                
              const result = validator.validate(input);
              return result.isValid || result.errors[0];
            }
          }
        ]);
        taskDescription = desc;
      } else {
        // 직접 입력된 description 검증
        const validator = createStringValidator('Task description')
          .required()
          .minLength(3)
          .maxLength(200);
          
        const result = validator.validate(taskDescription!);
        if (!result.isValid) {
          throw createValidationError(result.errors[0] || 'Validation failed', 'description', taskDescription);
        }
        taskDescription = result.value;
      }

      // 우선순위 검증
      const priority = getOptionValue(options, 'priority', 'medium');
      const priorityValidator = createStringValidator('Priority')
        .oneOf(['low', 'medium', 'high']);
        
      const priorityResult = priorityValidator.validate(priority);
      if (!priorityResult.isValid) {
        throw createValidationError(priorityResult.errors[0] || 'Validation failed', 'priority', priority);
      }

             // 브랜치 이름 검증 및 생성
       let branchName = getOptionValue(options, 'branch');
       if (!branchName && options.branch !== false && taskDescription) {
         // 안전한 브랜치 이름 생성
         branchName = sanitizeInput(taskDescription!)
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50);
        branchName = `feature/${branchName}`;
      }

      // 브랜치 이름이 있으면 검증
      if (branchName) {
        const branchValidator = createStringValidator('Branch name')
          .pattern(/^[a-zA-Z0-9/_-]+$/, 'Branch name can only contain letters, numbers, slashes, hyphens, and underscores');
          
        const branchResult = branchValidator.validate(branchName);
        if (!branchResult.isValid) {
          throw createValidationError(branchResult.errors[0] || 'Validation failed', 'branch', branchName);
        }
      }
      
      logger.info(`Task Description: ${taskDescription}`);
      logger.info(`Priority: ${priorityResult.value}`);
      
      if (branchName) {
        logger.info(`Branch Name: ${branchName}`);
      }
      
      // TODO: 실제 Dooray! API 호출 및 Git 브랜치 생성
      logger.warn('Task creation implementation coming soon!');
      logger.success('Task structure prepared! 🎯');
      
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        // DoorayAIError 처리
        logger.error((error as any).toUserString());
      } else {
        logger.error(`Task creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      process.exit(1);
    }
  }); 