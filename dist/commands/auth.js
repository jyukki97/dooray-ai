"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authCommand = void 0;
const commander_1 = require("commander");
const logger_1 = require("../utils/logger");
const auth_1 = require("../services/auth");
/**
 * 인증 관리 명령어
 */
exports.authCommand = new commander_1.Command('auth')
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
            await auth_1.authManager.initialize();
            logger_1.logger.success('Authentication system initialized');
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
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.logger.error(`Authentication command failed: ${errorMessage}`);
        process.exit(1);
    }
});
/**
 * 인증 상태 표시
 */
async function showAuthStatus() {
    try {
        await auth_1.authManager.initialize();
        const status = await auth_1.authManager.getAuthStatus();
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
    }
    catch (error) {
        logger_1.logger.error('Failed to show auth status');
        throw error;
    }
}
/**
 * 서비스 로그인
 */
async function loginToService(service) {
    try {
        await auth_1.authManager.initialize();
        const inquirer = await Promise.resolve().then(() => __importStar(require('inquirer')));
        if (service === 'dooray') {
            logger_1.logger.info('🔐 Dooray! Authentication');
            const answers = await inquirer.default.prompt([
                {
                    type: 'password',
                    name: 'apiKey',
                    message: 'Dooray! API Key:',
                    validate: (input) => {
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
            await auth_1.authManager.setDoorayAuth(answers.apiKey, answers.userId || undefined, answers.projectId || undefined);
            logger_1.logger.success('✅ Dooray! authentication saved successfully');
        }
        else if (service === 'github') {
            logger_1.logger.info('🔐 GitHub Authentication');
            const answers = await inquirer.default.prompt([
                {
                    type: 'password',
                    name: 'token',
                    message: 'GitHub Personal Access Token:',
                    validate: (input) => {
                        return input.trim().length > 0 ? true : 'Token is required';
                    }
                },
                {
                    type: 'input',
                    name: 'username',
                    message: 'GitHub Username (optional):'
                }
            ]);
            await auth_1.authManager.setGitHubAuth(answers.token, answers.username || undefined);
            logger_1.logger.success('✅ GitHub authentication saved successfully');
        }
        else {
            logger_1.logger.error(`Unknown service: ${service}`);
            logger_1.logger.info('Available services: dooray, github');
            process.exit(1);
        }
    }
    catch (error) {
        logger_1.logger.error(`Failed to login to ${service}`);
        throw error;
    }
}
/**
 * 서비스 로그아웃
 */
async function logoutFromService(service) {
    try {
        await auth_1.authManager.initialize();
        const inquirer = await Promise.resolve().then(() => __importStar(require('inquirer')));
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
                await auth_1.authManager.clearAll();
                logger_1.logger.success('✅ Logged out from all services');
            }
        }
        else if (service === 'dooray' || service === 'github') {
            const { confirm } = await inquirer.default.prompt([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: `Are you sure you want to logout from ${service}?`,
                    default: false
                }
            ]);
            if (confirm) {
                await auth_1.authManager.removeAuth(service);
                logger_1.logger.success(`✅ Logged out from ${service}`);
            }
        }
        else {
            logger_1.logger.error(`Unknown service: ${service}`);
            logger_1.logger.info('Available services: dooray, github, all');
            process.exit(1);
        }
    }
    catch (error) {
        logger_1.logger.error(`Failed to logout from ${service}`);
        throw error;
    }
}
/**
 * 서비스 인증 검증
 */
async function validateService(service) {
    try {
        await auth_1.authManager.initialize();
        if (service === 'claude-code') {
            logger_1.logger.info('🔍 Validating Claude Code CLI...');
            const isValid = await auth_1.authManager.validateClaudeCode();
            if (isValid) {
                logger_1.logger.success('✅ Claude Code CLI is available and working');
            }
            else {
                logger_1.logger.error('❌ Claude Code CLI is not available');
                logger_1.logger.info('💡 Install Claude Code CLI:');
                logger_1.logger.info('   curl -sSL https://claude.ai/install.sh | bash');
            }
        }
        else if (service === 'dooray') {
            logger_1.logger.info('🔍 Validating Dooray! authentication...');
            const isValid = await auth_1.authManager.validateAuth('dooray');
            if (isValid) {
                logger_1.logger.success('✅ Dooray! authentication is valid');
            }
            else {
                logger_1.logger.error('❌ Dooray! authentication is not configured');
                logger_1.logger.info('💡 Run: dooray-ai auth --login dooray');
            }
        }
        else if (service === 'github') {
            logger_1.logger.info('🔍 Validating GitHub authentication...');
            const isValid = await auth_1.authManager.validateAuth('github');
            if (isValid) {
                logger_1.logger.success('✅ GitHub authentication is valid');
            }
            else {
                logger_1.logger.error('❌ GitHub authentication is not configured');
                logger_1.logger.info('💡 Run: dooray-ai auth --login github');
            }
        }
        else {
            logger_1.logger.error(`Unknown service: ${service}`);
            logger_1.logger.info('Available services: claude-code, dooray, github');
            process.exit(1);
        }
    }
    catch (error) {
        logger_1.logger.error(`Failed to validate ${service}`);
        throw error;
    }
}
// 도움말 확장
exports.authCommand.addHelpText('after', `

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
//# sourceMappingURL=auth.js.map