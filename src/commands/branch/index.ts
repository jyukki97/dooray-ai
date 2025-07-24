import { Command } from 'commander';
import { createBranchCommand } from './create';
import { switchBranchCommand } from './switch';
import { cleanupBranchCommand } from './cleanup';

export const branchCommand = new Command('branch')
  .description('Manage Git branches for tasks')
  .addCommand(createBranchCommand)
  .addCommand(switchBranchCommand)
  .addCommand(cleanupBranchCommand); 