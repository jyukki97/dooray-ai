import { Command } from 'commander';
import { logger } from '../../utils/logger';

export const updateTaskCommand = new Command('update')
  .description('Update task status')
  .argument('<taskId>', 'Task ID to update')
  .option('-s, --status <status>', 'New status (working, done, hold)', 'working')
  .option('-c, --comment <comment>', 'Add comment')
  .action(async (taskId: string, options) => {
    try {
      logger.progress(`Updating task ${taskId}...`);
      
      logger.info(`Task ID: ${taskId}`);
      logger.info(`New Status: ${options.status}`);
      
      if (options.comment) {
        logger.info(`Comment: ${options.comment}`);
      }
      
      // TODO: 실제 Dooray! API 호출
      logger.warn('Task update implementation coming soon!');
      logger.success('Task update prepared! ✅');
      
    } catch (error) {
      logger.error(`Task update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  }); 