import { Command } from 'commander';
import { logger } from '../utils/logger';
import { authManager } from '../services/auth';

/**
 * 인증 관리 명령어
 */
export const authCommand = new Command('auth')
  .description('Manage authentication credentials')
  .option('--status', 'Show authentication status')
  .option('--login <service>', 'Login to service (dooray, github)')
  .option('--logout <service>', 'Logout from service (dooray, github, all)')
  .option('--validate <service>', 'Validate service authentication (dooray, github, claude-code)')
  .option('--init', 'Initialize authentication system')
  .action(async (options) => {
    try {
      // 인증 시스템 초기화
      if (options.init) {
        await authManager.initialize();
        logger.success('Authentication system initialized');
        return;
      }
      
      // 인증 상태 표시
      if (options.status) {
        await showAuthStatus();
        return;
      }
      
      // 서비스 로그인
      if (options.login) {
        await loginToService(options.login);
        return;
      }
      
      // 서비스 로그아웃
      if (options.logout) {
        await logoutFromService(options.logout);
        return;
      }
      
      // 인증 검증
      if (options.validate) {
        await validateService(options.validate);
        return;
      }
      
      // 기본 동작: 인증 상태 표시
      await showAuthStatus();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Authentication command failed: ${errorMessage}`);
      process.exit(1);
    }
  });

/**
 * 인증 상태 표시
 */
async function showAuthStatus(): Promise<void> {
  try {
    await authManager.initialize();
    const status = await authManager.getAuthStatus();
    
    console.log('\n🔐 Authentication Status');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 전체 인증 상태
    const authIcon = status.isAuthenticated ? '✅' : '❌';
    console.log(`📊 Overall Status: ${authIcon} ${status.isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
    
    // Claude Code 상태
    const claudeIcon = status.claudeCodeAvailable ? '✅' : '❌';
    console.log(`🤖 Claude Code: ${claudeIcon} ${status.claudeCodeAvailable ? 'Available (no API key needed)' : 'CLI not installed'}`);
    
    // 서비스별 상태
    console.log('\n📋 Services:');
    const doorayIcon = status.services.dooray ? '✅' : '❌';
    const githubIcon = status.services.github ? '✅' : '❌';
    
    console.log(`   📧 Dooray!: ${doorayIcon} ${status.services.dooray ? 'Authenticated' : 'Not authenticated'}`);
    console.log(`   🐙 GitHub: ${githubIcon} ${status.services.github ? 'Authenticated' : 'Not authenticated'}`);
    
    // 마지막 로그인 시간
    if (status.lastLogin) {
      console.log(`\n⏰ Last Login: ${status.lastLogin.toLocaleString()}`);
    }
    
    // 권장사항
    console.log('\n💡 Recommendations:');
    if (!status.claudeCodeAvailable) {
      console.log('   • Install Claude Code CLI for AI functionality');
      console.log('   • Run: curl -sSL https://claude.ai/install.sh | bash');
    }
    if (!status.services.dooray && !status.services.github) {
      console.log('   • Configure at least one service for full functionality');
      console.log('   • Run: dooray-ai auth --login dooray');
      console.log('   • Run: dooray-ai auth --login github');
    }
    
  } catch (error) {
    logger.error('Failed to show auth status');
    throw error;
  }
}

/**
 * 서비스 로그인
 */
async function loginToService(service: string): Promise<void> {
  try {
    await authManager.initialize();
    const inquirer = await import('inquirer');
    
    if (service === 'dooray') {
      logger.info('🔐 Dooray! Authentication');
      
      const answers = await inquirer.default.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message: 'Dooray! API Key:',
          validate: (input: string) => {
            return input.trim().length > 0 ? true : 'API Key is required';
          }
        },
        {
          type: 'input',
          name: 'userId',
          message: 'User ID (optional):'
        },
        {
          type: 'input',
          name: 'projectId',
          message: 'Project ID (optional):'
        }
      ]);
      
      await authManager.setDoorayAuth(
        answers.apiKey,
        answers.userId || undefined,
        answers.projectId || undefined
      );
      
      logger.success('✅ Dooray! authentication saved successfully');
      
    } else if (service === 'github') {
      logger.info('🔐 GitHub Authentication');
      
      const answers = await inquirer.default.prompt([
        {
          type: 'password',
          name: 'token',
          message: 'GitHub Personal Access Token:',
          validate: (input: string) => {
            return input.trim().length > 0 ? true : 'Token is required';
          }
        },
        {
          type: 'input',
          name: 'username',
          message: 'GitHub Username (optional):'
        }
      ]);
      
      await authManager.setGitHubAuth(
        answers.token,
        answers.username || undefined
      );
      
      logger.success('✅ GitHub authentication saved successfully');
      
    } else {
      logger.error(`Unknown service: ${service}`);
      logger.info('Available services: dooray, github');
      process.exit(1);
    }
    
  } catch (error) {
    logger.error(`Failed to login to ${service}`);
    throw error;
  }
}

/**
 * 서비스 로그아웃
 */
async function logoutFromService(service: string): Promise<void> {
  try {
    await authManager.initialize();
    const inquirer = await import('inquirer');
    
    if (service === 'all') {
      const { confirm } = await inquirer.default.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure you want to logout from all services?',
          default: false
        }
      ]);
      
      if (confirm) {
        await authManager.clearAll();
        logger.success('✅ Logged out from all services');
      }
      
    } else if (service === 'dooray' || service === 'github') {
      const { confirm } = await inquirer.default.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Are you sure you want to logout from ${service}?`,
          default: false
        }
      ]);
      
      if (confirm) {
        await authManager.removeAuth(service as 'dooray' | 'github');
        logger.success(`✅ Logged out from ${service}`);
      }
      
    } else {
      logger.error(`Unknown service: ${service}`);
      logger.info('Available services: dooray, github, all');
      process.exit(1);
    }
    
  } catch (error) {
    logger.error(`Failed to logout from ${service}`);
    throw error;
  }
}

/**
 * 서비스 인증 검증
 */
async function validateService(service: string): Promise<void> {
  try {
    await authManager.initialize();
    
    if (service === 'claude-code') {
      logger.info('🔍 Validating Claude Code CLI...');
      const isValid = await authManager.validateClaudeCode();
      
      if (isValid) {
        logger.success('✅ Claude Code CLI is available and working');
      } else {
        logger.error('❌ Claude Code CLI is not available');
        logger.info('💡 Install Claude Code CLI:');
        logger.info('   curl -sSL https://claude.ai/install.sh | bash');
      }
      
    } else if (service === 'dooray') {
      logger.info('🔍 Validating Dooray! authentication...');
      const isValid = await authManager.validateAuth('dooray');
      
      if (isValid) {
        logger.success('✅ Dooray! authentication is valid');
      } else {
        logger.error('❌ Dooray! authentication is not configured');
        logger.info('💡 Run: dooray-ai auth --login dooray');
      }
      
    } else if (service === 'github') {
      logger.info('🔍 Validating GitHub authentication...');
      const isValid = await authManager.validateAuth('github');
      
      if (isValid) {
        logger.success('✅ GitHub authentication is valid');
      } else {
        logger.error('❌ GitHub authentication is not configured');
        logger.info('💡 Run: dooray-ai auth --login github');
      }
      
    } else {
      logger.error(`Unknown service: ${service}`);
      logger.info('Available services: claude-code, dooray, github');
      process.exit(1);
    }
    
  } catch (error) {
    logger.error(`Failed to validate ${service}`);
    throw error;
  }
}

// 도움말 확장
authCommand.addHelpText('after', `

Authentication Examples:
  $ dooray-ai auth --status                    Show authentication status
  $ dooray-ai auth --init                      Initialize auth system
  $ dooray-ai auth --login dooray              Login to Dooray!
  $ dooray-ai auth --login github              Login to GitHub
  $ dooray-ai auth --logout dooray             Logout from Dooray!
  $ dooray-ai auth --logout all                Logout from all services  
  $ dooray-ai auth --validate claude-code      Check Claude Code CLI
  $ dooray-ai auth --validate dooray           Validate Dooray! auth

Supported Services:
  • Claude Code - AI code generation (no API key needed)
  • Dooray! - Task management and project integration
  • GitHub - Repository and PR management

Security Features:
  • All sensitive data is encrypted at rest
  • Authentication files have restricted permissions
  • Secure credential storage in ~/.dooray-ai/
`);