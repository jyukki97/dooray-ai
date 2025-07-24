import { Command } from 'commander';
import { logger } from '../utils/logger';
// inquirer는 ES Module이므로 dynamic import 사용
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

export const configCommand = new Command('config')
  .description('Manage dooray-ai configuration')
  .option('-g, --get <key>', 'Get configuration value')
  .option('-s, --set <key=value>', 'Set configuration value')
  .option('-l, --list', 'List all configuration')
  .option('-r, --reset', 'Reset configuration to defaults')
  .action(async (options) => {
    try {
      const configDir = path.join(os.homedir(), '.dooray-ai');
      const configFile = path.join(configDir, 'config.json');
      
      // 설정 파일이 없으면 안내
      if (!await fs.pathExists(configFile)) {
        logger.error('Configuration not found. Run "dooray-ai init" first.');
        process.exit(1);
      }
      
      const config = await fs.readJson(configFile);
      
      if (options.list) {
        logger.info('Current Configuration:');
        console.log(JSON.stringify(config, null, 2));
        return;
      }
      
      if (options.get) {
        const value = getNestedValue(config, options.get);
        if (value !== undefined) {
          logger.info(`${options.get}: ${JSON.stringify(value)}`);
        } else {
          logger.error(`Configuration key not found: ${options.get}`);
        }
        return;
      }
      
      if (options.set) {
        const [key, value] = options.set.split('=');
        if (!key || value === undefined) {
          logger.error('Invalid format. Use: --set key=value');
          process.exit(1);
        }
        
        setNestedValue(config, key, value);
        await fs.writeJson(configFile, config, { spaces: 2 });
        logger.success(`Set ${key} = ${value}`);
        return;
      }
      
      if (options.reset) {
        const inquirer = await import('inquirer');
        const { confirm } = await inquirer.default.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: 'Are you sure you want to reset all configuration?',
            default: false
          }
        ]);
        
        if (confirm) {
          await fs.remove(configFile);
          logger.success('Configuration reset. Run "dooray-ai init" to reconfigure.');
        }
        return;
      }
      
      // 대화형 설정 모드
      await interactiveConfig(config, configFile);
      
    } catch (error) {
      logger.error(`Configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function setNestedValue(obj: any, path: string, value: string): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  
  // 값 타입 추론
  if (value === 'true') target[lastKey] = true;
  else if (value === 'false') target[lastKey] = false;
  else if (!isNaN(Number(value))) target[lastKey] = Number(value);
  else target[lastKey] = value;
}

async function interactiveConfig(config: any, configFile: string): Promise<void> {
  logger.info('Interactive Configuration Mode');
  
  const inquirer = await import('inquirer');
  const answers = await inquirer.default.prompt([
    {
      type: 'input',
      name: 'doorayApiKey',
      message: 'Dooray! API Key:',
      default: config.dooray?.apiKey || ''
    },
    {
      type: 'input',
      name: 'doorayProjectId',
      message: 'Dooray! Project ID:',
      default: config.dooray?.projectId || ''
    },
    {
      type: 'input',
      name: 'githubToken',
      message: 'GitHub Personal Access Token:',
      default: config.github?.token || ''
    },
    {
      type: 'input',
      name: 'githubUsername',
      message: 'GitHub Username:',
      default: config.github?.username || ''
    },
    {
      type: 'list',
      name: 'aiProvider',
      message: 'AI Provider:',
      choices: ['openai', 'anthropic'],
      default: config.ai?.provider || 'openai'
    },
    {
      type: 'input',
      name: 'aiApiKey',
      message: 'AI API Key:',
      default: config.ai?.apiKey || ''
    }
  ]);
  
  // 설정 업데이트
  config.dooray.apiKey = answers.doorayApiKey;
  config.dooray.projectId = answers.doorayProjectId;
  config.github.token = answers.githubToken;
  config.github.username = answers.githubUsername;
  config.ai.provider = answers.aiProvider;
  config.ai.apiKey = answers.aiApiKey;
  
  await fs.writeJson(configFile, config, { spaces: 2 });
  logger.success('Configuration updated successfully!');
} 