import { Command } from 'commander';
import { createTaskCommand } from './create';
import { listTaskCommand } from './list';
import { updateTaskCommand } from './update';
import { syncTaskCommand } from './sync';

export const taskCommand = new Command('task')
  .description('Manage Dooray! tasks')
  .addCommand(createTaskCommand)
  .addCommand(listTaskCommand)
  .addCommand(updateTaskCommand)
  .addCommand(syncTaskCommand); 