#!/usr/bin/env node

import { Command } from 'commander';
import { version } from '../package.json';
import { logger, LogLevel } from './utils/logger';
import { initCommand } from './commands/init';
import { configCommand } from './commands/config';
import { taskCommand } from './commands/task';
import { branchCommand } from './commands/branch';
import { prCommand } from './commands/pr';
import { helpCommand } from './commands/help';
import { aiCommand } from './commands/ai';
import { authCommand } from './commands/auth';
import workflowCommand from './commands/workflow';

const program = new Command();

program
  .name('dooray-ai')
  .description('AI-powered CLI tool for automated development workflow with Dooray! integration')
  .version(version);

// 전역 옵션
program
  .option('-v, --verbose', 'Enable verbose logging')
  .option('-s, --silent', 'Minimize output')
  .option('--no-color', 'Disable colored output')
  .option('-c, --config <path>', 'Specify config file path');

// 전역 옵션 처리
program.hook('preAction', (thisCommand, _actionCommand) => {
  const opts = thisCommand.opts();
  
  if (opts['verbose']) {
    logger.configure({ level: LogLevel.DEBUG });
  }
  
  if (opts['silent']) {
    logger.configure({ level: LogLevel.ERROR });
  }
  
  // 컬러 비활성화는 현재 logger에서 지원하지 않음
  // TODO: 향후 logger 클래스에 컬러 옵션 추가 필요
});

// 명령어 등록
program.addCommand(initCommand);
program.addCommand(configCommand);
program.addCommand(taskCommand);
program.addCommand(branchCommand);
program.addCommand(prCommand);
program.addCommand(helpCommand);
program.addCommand(aiCommand);
program.addCommand(authCommand);
program.addCommand(workflowCommand);

// 프로젝트 상태 확인 명령어 추가
program.addCommand(
  new Command('status')
    .description('프로젝트 상태 확인')
    .option('-v, --verbose', '상세 정보 표시')
    .option('-j, --json', 'JSON 형식으로 출력')
    .action(async (options) => {
      try {
        logger.info('프로젝트 상태를 확인하고 있습니다...');
        
        console.log('\n📊 Dooray AI 프로젝트 상태\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // 기본 프로젝트 정보
        const fs = await import('fs-extra');
        const path = await import('path');
        
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        if (await fs.pathExists(packageJsonPath)) {
          const packageJson = await fs.readJson(packageJsonPath);
          console.log('📁 프로젝트 정보');
          console.log(`   이름: ${packageJson.name || '알 수 없음'}`);
          console.log(`   버전: ${packageJson.version || '알 수 없음'}`);
          console.log(`   설명: ${packageJson.description || '설명 없음'}`);
          console.log(`   디렉토리: ${process.cwd()}\n`);
        }
        
        // Git 상태 확인
        const { execSync } = await import('child_process');
        try {
          if (await fs.pathExists(path.join(process.cwd(), '.git'))) {
            console.log('🌿 Git 상태');
            const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
            const status = execSync('git status --porcelain', { encoding: 'utf8' });
            console.log(`   현재 브랜치: ${branch}`);
            console.log(`   상태: ${status.length > 0 ? '⚠️ 변경사항 있음' : '✅ 깨끗함'}`);
            
            try {
              const remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
              console.log(`   원격 저장소: ${remote}`);
            } catch {
              console.log(`   원격 저장소: 설정되지 않음`);
            }
            console.log('');
          } else {
            console.log('🌿 Git: ❌ Git 저장소 아님\n');
          }
        } catch {
          console.log('🌿 Git: ❌ Git 정보를 가져올 수 없음\n');
        }
        
        // 설정 상태 확인
        const configPaths = [
          path.join(process.cwd(), '.dooray-ai', 'config.json'),
          path.join(require('os').homedir(), '.dooray-ai', 'config.json')
        ];
        
        console.log('⚙️ 설정 상태');
        let configFound = false;
        for (const configPath of configPaths) {
          if (await fs.pathExists(configPath)) {
            console.log(`   설정 파일: ✅ ${configPath}`);
            configFound = true;
            break;
          }
        }
        if (!configFound) {
          console.log(`   설정 파일: ❌ 없음 (dooray-ai config init 실행 권장)`);
        }
        console.log('');
        
        // 종속성 상태
        if (await fs.pathExists(packageJsonPath)) {
          const packageJson = await fs.readJson(packageJsonPath);
          const deps = packageJson.dependencies || {};
          const devDeps = packageJson.devDependencies || {};
          const totalDeps = Object.keys(deps).length + Object.keys(devDeps).length;
          
          console.log('📦 종속성 상태');
          console.log(`   총 패키지: ${totalDeps}`);
          console.log(`   운영 환경: ${Object.keys(deps).length}`);
          console.log(`   개발 환경: ${Object.keys(devDeps).length}\n`);
        }
        
        // 개선 권장사항
        console.log('💡 권장 사항');
        console.log('   • README.md를 최신 상태로 유지하세요');
        console.log('   • 정기적으로 종속성을 업데이트하세요 (npm update)');
        console.log('   • 보안 취약점을 확인하세요 (npm audit)');
        console.log('   • 테스트를 작성하고 실행하세요 (npm test)');
        console.log('');
        
      } catch (error) {
        logger.error('상태 확인 중 오류가 발생했습니다:', error);
      }
    })
);

// 하위 호환성을 위한 기본 명령어 유지
program
  .command('generate')
  .alias('gen')
  .description('Generate code using Claude Code CLI (no API key required)')
  .argument('<description>', 'Description of code to generate')
  .option('--language <lang>', 'Programming language', 'typescript')
  .action(async (description: string, options) => {
    try {
      logger.info('🔄 Redirecting to Claude Code generator...');
      // 동적으로 Claude Code 클라이언트 사용
      const { ClaudeCodeClient } = await import('./services/ai/claude-code-client');
      const client = new ClaudeCodeClient();
      
      const result = await client.generateCode({
        prompt: description,
        language: options.language,
        maxTokens: 2000
      });
      
      console.log('\n🚀 Generated Code:');
      console.log('```' + options.language);
      console.log(result.code);
      console.log('```');
      
      if (result.explanation) {
        console.log('\n💡 Explanation:');
        console.log(result.explanation);
      }
      
      logger.success('Code generation completed! Use "dooray-ai ai generate" for more options.');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Code generation failed: ${errorMessage}`);
      logger.info('💡 Make sure Claude Code CLI is installed: https://claude.ai/cli');
    }
  });

program
  .command('test')
  .description('Test the CLI setup')
  .action(() => {
    logger.success('dooray-ai CLI is working!');
    logger.info(`Version: ${version}`, 'TEST');
    logger.success('All systems operational! 🎉');
  });

// 에러 처리
program.on('command:*', () => {
  logger.error(`Invalid command: ${program.args.join(' ')}\nSee --help for a list of available commands.`, 'CLI');
  process.exit(1);
});

// 프로그램 파싱 및 실행
if (require.main === module) {
  program.parse();
}

export default program; 