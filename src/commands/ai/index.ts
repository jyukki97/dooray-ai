import { Command } from 'commander';
import { claudeCodeCommand } from './claude-code';

/**
 * AI 관련 명령어들 (Claude Code 전용)
 */
export const aiCommand = new Command('ai')
  .description('AI 코드 생성 (Claude Code CLI 사용, API 키 불필요)')
  .addCommand(claudeCodeCommand);

// Claude Code 명령어 export
export { claudeCodeCommand } from './claude-code';