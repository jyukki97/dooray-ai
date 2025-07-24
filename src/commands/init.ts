import { Command } from 'commander';
import { logger } from '../utils/logger';
// inquirer는 ES Module이므로 dynamic import 사용
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

export const initCommand = new Command('init')
  .description('Initialize dooray-ai in current project')
  .option('-f, --force', 'Overwrite existing configuration')
  .option('-t, --template <type>', 'Configuration template to use', 'default')
  .action(async (options) => {
    try {
      logger.progress('Initializing dooray-ai...');
      
      const configDir = path.join(os.homedir(), '.dooray-ai');
      const configFile = path.join(configDir, 'config.json');
      
      // 기존 설정 확인
      if (await fs.pathExists(configFile) && !options.force) {
        const inquirer = await import('inquirer');
        const { overwrite } = await inquirer.default.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: 'Configuration already exists. Overwrite?',
            default: false
          }
        ]);
        
        if (!overwrite) {
          logger.info('Initialization cancelled.');
          return;
        }
      }
      
      // 설정 디렉토리 생성
      await fs.ensureDir(configDir);
      
      // 기본 설정 생성
      const defaultConfig = {
        version: '0.1.0',
        dooray: {
          baseUrl: '',
          apiKey: '',
          projectId: ''
        },
        github: {
          token: '',
          username: '',
          defaultBranch: 'main'
        },
        ai: {
          provider: 'openai',
          apiKey: '',
          model: 'gpt-4'
        },
        preferences: {
          autoCommit: true,
          autoPush: false,
          createPR: true,
          branchPrefix: 'feature/',
          commitPrefix: 'feat: '
        }
      };
      
      // 설정 파일 저장
      await fs.writeJson(configFile, defaultConfig, { spaces: 2 });
      
      logger.success('dooray-ai initialized successfully!');
      logger.info(`Configuration saved to: ${configFile}`);
      logger.info('Next steps:');
      logger.info('1. Run "dooray-ai config" to set up your credentials');
      logger.info('2. Start using "dooray-ai task" commands');
      
    } catch (error) {
      logger.error(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  }); 