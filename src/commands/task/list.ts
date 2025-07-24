import { Command } from 'commander';
import { logger } from '../../utils/logger';

export const listTaskCommand = new Command('list')
  .alias('ls')
  .description('List Dooray! tasks')
  .option('-s, --status <status>', 'Filter by status (open, closed, all)', 'open')
  .option('-a, --assignee <user>', 'Filter by assignee')
  .option('-l, --limit <number>', 'Limit number of results', '10')
  .action(async (options) => {
    try {
      logger.progress('Fetching tasks from Dooray!...');
      
      logger.info(`Status Filter: ${options.status}`);
      if (options.assignee) {
        logger.info(`Assignee Filter: ${options.assignee}`);
      }
      logger.info(`Limit: ${options.limit}`);
      
      // TODO: 실제 Dooray! API 호출
      logger.warn('Task listing implementation coming soon!');
      logger.success('Task query prepared! 📋');
      
    } catch (error) {
      logger.error(`Task listing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  }); 