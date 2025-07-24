import { Command } from 'commander';
import { logger } from '../utils/logger';
import { configManager, DoorayAIConfig } from '../services/config';

export const configCommand = new Command('config')
  .description('Manage dooray-ai configuration')
  .option('-g, --get <key>', 'Get configuration value')
  .option('-s, --set <key=value>', 'Set configuration value')
  .option('-l, --list', 'List all configuration')
  .option('-r, --reset', 'Reset configuration to defaults')
  .option('--global', 'Use global configuration instead of project configuration')
  .option('--init', 'Initialize configuration files')
  .option('--paths', 'Show configuration file paths')
  .action(async (options) => {
    try {
      // 초기화 옵션
      if (options.init) {
        await configManager.initialize(true);
        return;
      }
      
      // 경로 표시 옵션
      if (options.paths) {
        const paths = configManager.getConfigPaths();
        const exists = await configManager.exists();
        
        logger.info('Configuration File Paths:');
        console.log(`📁 Project: ${paths.project} ${exists.project ? '✅' : '❌'}`);
        console.log(`🌐 Global: ${paths.global} ${exists.global ? '✅' : '❌'}`);
        return;
      }
      
      // 설정 목록 표시
      if (options.list) {
        const config = await configManager.load();
        logger.info('Current Configuration:');
        console.log(JSON.stringify(config, null, 2));
        return;
      }
      
      // 설정값 조회
      if (options.get) {
        const config = await configManager.load();
        const value = getNestedValue(config, options.get);
        if (value !== undefined) {
          logger.info(`${options.get}: ${JSON.stringify(value, null, 2)}`);
        } else {
          logger.error(`Configuration key not found: ${options.get}`);
        }
        return;
      }
      
      // 설정값 설정
      if (options.set) {
        const [key, ...valueParts] = options.set.split('=');
        const value = valueParts.join('='); // '=' 문자가 포함된 값 처리
        
        if (!key || value === undefined) {
          logger.error('Invalid format. Use: --set key=value');
          process.exit(1);
        }
        
        const config = await configManager.load();
        setNestedValue(config, key, value);
        await configManager.save(config, options.global);
        logger.success(`Set ${key} = ${value} ${options.global ? '(global)' : '(project)'}`);
        return;
      }
      
      // 설정 초기화
      if (options.reset) {
        const inquirer = await import('inquirer');
        const scope = options.global ? 'global' : 'project';
        
        const { confirm } = await inquirer.default.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to reset ${scope} configuration?`,
            default: false
          }
        ]);
        
        if (confirm) {
          await configManager.remove(options.global);
          await configManager.initialize();
          logger.success(`${scope} configuration reset successfully`);
        }
        return;
      }
      
      // 대화형 설정 모드
      await interactiveConfig(options.global);
      
    } catch (error) {
      logger.error(`Configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

/**
 * 중첩된 객체에서 값 조회
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * 중첩된 객체에 값 설정
 */
function setNestedValue(obj: any, path: string, value: string): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  
  // 값 타입 추론 및 변환
  if (value === 'true') {
    target[lastKey] = true;
  } else if (value === 'false') {
    target[lastKey] = false;
  } else if (value === 'null') {
    target[lastKey] = null;
  } else if (!isNaN(Number(value)) && value.trim() !== '') {
    target[lastKey] = Number(value);
  } else {
    target[lastKey] = value;
  }
}

/**
 * 대화형 설정 모드
 */
async function interactiveConfig(global: boolean = false): Promise<void> {
  const scope = global ? 'global' : 'project';
  logger.info(`Interactive Configuration Mode (${scope})`);
  
  const config = await configManager.load();
  const inquirer = await import('inquirer');
  
  const answers = await inquirer.default.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project Name:',
      default: config.project?.name || '',
      when: !global
    },
    {
      type: 'input',
      name: 'projectDescription',
      message: 'Project Description:',
      default: config.project?.description || '',
      when: !global
    },
    {
      type: 'number',
      name: 'aiMaxTokens',
      message: 'AI Max Tokens:',
      default: config.ai.maxTokens,
      validate: (input: number) => {
        return input >= 100 && input <= 100000 ? true : 'Must be between 100 and 100000';
      }
    },
    {
      type: 'number',
      name: 'aiTemperature',
      message: 'AI Temperature (0-2):',
      default: config.ai.temperature,
      validate: (input: number) => {
        return input >= 0 && input <= 2 ? true : 'Must be between 0 and 2';
      }
    },
    {
      type: 'input',
      name: 'gitDefaultBranch',
      message: 'Git Default Branch:',
      default: config.git.defaultBranch
    },
    {
      type: 'confirm',
      name: 'gitAutoCommit',
      message: 'Enable Git Auto Commit:',
      default: config.git.autoCommit
    },
    {
      type: 'input',
      name: 'gitCommitTemplate',
      message: 'Git Commit Message Template:',
      default: config.git.commitMessageTemplate
    },
    {
      type: 'input',
      name: 'doorayProjectId',
      message: 'Dooray! Project ID (optional):',
      default: config.dooray?.projectId || ''
    },
    {
      type: 'input',
      name: 'doorayApiUrl',
      message: 'Dooray! API URL (optional):',
      default: config.dooray?.apiUrl || ''
    },
    {
      type: 'input',
      name: 'githubUsername',
      message: 'GitHub Username (optional):',
      default: config.github?.username || ''
    },
    {
      type: 'input',
      name: 'githubRepository',
      message: 'GitHub Repository (optional):',
      default: config.github?.repository || ''
    },
    {
      type: 'list',
      name: 'preferenceLanguage',
      message: 'Preferred Language:',
      choices: [
        { name: '한국어', value: 'ko' },
        { name: 'English', value: 'en' }
      ],
      default: config.preferences.language
    },
    {
      type: 'list',
      name: 'preferenceLogLevel',
      message: 'Log Level:',
      choices: ['error', 'warn', 'info', 'debug'],
      default: config.preferences.logLevel
    },
    {
      type: 'confirm',
      name: 'preferenceColorOutput',
      message: 'Enable Color Output:',
      default: config.preferences.colorOutput
    }
  ]);
  
  // 설정 업데이트
  const updates: Partial<DoorayAIConfig> = {};
  
  if (!global) {
    updates.project = {
      ...config.project,
      name: answers.projectName,
      description: answers.projectDescription
    };
  }
  
  updates.ai = {
    ...config.ai,
    maxTokens: answers.aiMaxTokens,
    temperature: answers.aiTemperature
  };
  
  updates.git = {
    ...config.git,
    defaultBranch: answers.gitDefaultBranch,
    autoCommit: answers.gitAutoCommit,
    commitMessageTemplate: answers.gitCommitTemplate
  };
  
  if (answers.doorayProjectId || answers.doorayApiUrl) {
    updates.dooray = {
      projectId: answers.doorayProjectId || undefined,
      apiUrl: answers.doorayApiUrl || undefined
    };
  }
  
  if (answers.githubUsername || answers.githubRepository) {
    updates.github = {
      username: answers.githubUsername || undefined,
      repository: answers.githubRepository || undefined
    };
  }
  
  updates.preferences = {
    ...config.preferences,
    language: answers.preferenceLanguage,
    logLevel: answers.preferenceLogLevel,
    colorOutput: answers.preferenceColorOutput
  };
  
  await configManager.save(updates, global);
  logger.success(`Configuration updated successfully (${scope})!`);
}

// 도움말 확장
configCommand.addHelpText('after', `

Configuration Examples:
  $ dooray-ai config --init                     Initialize configuration
  $ dooray-ai config --list                     Show all configuration
  $ dooray-ai config --get ai.maxTokens         Get specific value
  $ dooray-ai config --set ai.maxTokens=2000    Set specific value
  $ dooray-ai config --global --list            Show global configuration
  $ dooray-ai config --paths                    Show config file paths

Configuration Hierarchy:
  1. Project configuration (.dooray-ai/config.json) - highest priority
  2. Global configuration (~/.dooray-ai/config.json) - fallback
  3. Default values - final fallback

Available Settings:
  • project.name, project.description, project.version
  • ai.maxTokens, ai.temperature, ai.timeout
  • git.defaultBranch, git.autoCommit, git.commitMessageTemplate
  • dooray.projectId, dooray.apiUrl
  • github.username, github.repository
  • preferences.language, preferences.logLevel, preferences.colorOutput
`);