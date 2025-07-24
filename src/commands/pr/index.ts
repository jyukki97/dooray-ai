import { Command } from 'commander';
import { createPRCommand } from './create';
import { updatePRCommand } from './update';

export const prCommand = new Command('pr')
  .description('Manage Pull Requests')
  .addCommand(createPRCommand)
  .addCommand(updatePRCommand); 