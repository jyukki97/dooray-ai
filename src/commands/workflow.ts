import { Command } from 'commander';
import { logger } from '../utils/logger';
import { executeTaskWorkflow, WorkflowProgress } from '../services/workflow';
import { validateDoorayConnection } from '../services/dooray';
import { validateGitHubConnection } from '../services/github';
import { validateGitRepository } from '../services/git';

/**
 * 태스크 워크플로우 명령어
 */
export const workflowCommand = new Command('workflow')
  .alias('wf')
  .description('Execute end-to-end workflow: read Dooray task → generate code → create Git branch → create GitHub PR')
  .argument('<projectId>', 'Dooray project ID')
  .argument('<taskId>', 'Dooray task ID')
  .option('--repository <repo>', 'GitHub repository (owner/repo format)')
  .option('--branch-prefix <prefix>', 'Branch name prefix', 'feature')
  .option('--language <lang>', 'Programming language (typescript, python, etc.)')
  .option('--framework <fw>', 'Framework to use (react, express, fastapi, etc.)')
  .option('--style <style>', 'Code style (functional, object-oriented, mixed)', 'mixed')
  .option('--tests', 'Include test files')
  .option('--comments', 'Include detailed comments')
  .option('--output-dir <dir>', 'Output directory for generated files')
  .option('--custom-prompt <prompt>', 'Custom prompt for code generation')
  .option('--dry-run', 'Simulate workflow without making changes')
  .option('--skip-validation', 'Skip connection validation')
  .option('--no-commit', 'Skip Git commit')
  .option('--no-push', 'Skip Git push')
  .option('--no-pr', 'Skip GitHub PR creation')
  .option('--no-assign', 'Skip auto-assignment of PR')
  .option('--no-labels', 'Skip adding labels to PR')
  .option('--no-link', 'Skip linking PR to Dooray task')
  .option('--no-cleanup', 'Skip cleanup on failure')
  .action(async (projectId, taskId, options) => {
    try {
      logger.info(`🚀 Starting workflow for task: ${projectId}/${taskId}`);

      // 진행률 콜백 설정
      const progressCallback = (progress: WorkflowProgress) => {
        const progressBar = '█'.repeat(Math.floor(progress.progress / 5)) + 
                          '░'.repeat(20 - Math.floor(progress.progress / 5));
        
        console.log(`\r[${progressBar}] ${progress.progress}% - ${progress.message}`);
      };

      // 빠른 검증 (dry-run이 아닌 경우)
      if (!options.dryRun && !options.skipValidation) {
        await performQuickValidation(options);
      }

      // 워크플로우 옵션 구성
      const workflowOptions = {
        config: {
          repository: options.repository,
          branchPrefix: options.branchPrefix,
          autoCommit: !options.noCommit,
          autoPush: !options.noPush,
          createPR: !options.noPr,
          autoAssign: !options.noAssign,
          addLabels: !options.noLabels,
          linkToTask: !options.noLink,
          outputDirectory: options.outputDir,
          cleanupOnFailure: !options.noCleanup
        },
        dryRun: options.dryRun,
        skipValidation: options.skipValidation,
        customPrompt: options.customPrompt,
        codeStyle: options.style as any,
        includeTests: options.tests,
        includeComments: options.comments
      };

      // 워크플로우 실행
      const result = await executeTaskWorkflow(
        projectId,
        taskId,
        workflowOptions,
        progressCallback
      );

      // 결과 표시
      console.log('\n'); // 진행률 바 다음 줄로
      displayWorkflowResult(result, options);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`❌ Workflow failed: ${errorMessage}`);
      
      // 상세 오류 정보 표시
      if (error instanceof Error && error.stack && process.env['DEBUG']) {
        logger.debug('Error stack:', error.stack);
      }
      
      process.exit(1);
    }
  });

/**
 * 빠른 검증 수행
 */
async function performQuickValidation(options: any): Promise<void> {
  logger.info('🔍 Performing connection validation...');

  const validations = [];

  // Dooray 연결 확인
  validations.push(
    validateDoorayConnection().then(valid => {
      if (!valid) throw new Error('Dooray API connection failed');
      logger.success('✅ Dooray API connected');
    })
  );

  // GitHub 연결 확인 (PR 생성이 활성화된 경우)
  if (!options.noPr) {
    validations.push(
      validateGitHubConnection().then(valid => {
        if (!valid) throw new Error('GitHub API connection failed');
        logger.success('✅ GitHub API connected');
      })
    );
  }

  // Git 저장소 확인 (커밋이 활성화된 경우)
  if (!options.noCommit) {
    validations.push(
      validateGitRepository().then(valid => {
        if (!valid) throw new Error('Not a valid Git repository');
        logger.success('✅ Git repository validated');
      })
    );
  }

  try {
    await Promise.all(validations);
  } catch (error) {
    logger.error('❌ Validation failed');
    throw error;
  }
}

/**
 * 워크플로우 결과 표시
 */
function displayWorkflowResult(result: any, options: any): void {
  if (result.success) {
    logger.success('🎉 Workflow completed successfully!');
    
    console.log('\n📋 Workflow Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (result.task) {
      console.log(`📌 Task: ${result.task.subject}`);
      console.log(`🔢 Task ID: ${result.projectId}/${result.taskId}`);
    }

    if (result.analysis) {
      console.log(`🎯 Complexity: ${result.analysis.estimatedComplexity}`);
      console.log(`💻 Language: ${result.analysis.recommendedLanguage || 'auto-detected'}`);
      if (result.analysis.recommendedFramework) {
        console.log(`⚡ Framework: ${result.analysis.recommendedFramework}`);
      }
    }

    if (result.generatedFiles && result.generatedFiles.length > 0) {
      console.log(`\n📁 Generated Files (${result.generatedFiles.length}):`);
      result.generatedFiles.forEach((file: any) => {
        const icon = getFileIcon(file.type);
        console.log(`   ${icon} ${file.path} (${file.type})`);
      });
    }

    if (result.gitResult && result.gitResult.branchName) {
      console.log(`\n🌿 Git Branch: ${result.gitResult.branchName}`);
      if (result.gitResult.commitHash) {
        console.log(`📝 Commit: ${result.gitResult.commitHash}`);
      }
    }

    if (result.pullRequest) {
      console.log(`\n🔗 Pull Request: ${result.pullRequest.html_url}`);
      console.log(`📊 PR #${result.pullRequest.number}: ${result.pullRequest.title}`);
    }

    console.log(`\n⏱️  Duration: ${Math.round(result.duration / 1000)}s`);

    // Dry run 메시지
    if (options.dryRun) {
      console.log('\n💡 This was a dry run - no changes were made');
    }

  } else {
    logger.error('❌ Workflow failed');
    
    if (result.error) {
      console.log(`\n🔍 Error Details:`);
      console.log(`   ${result.error.message}`);
    }

    // 실행된 단계 표시
    if (result.steps && result.steps.length > 0) {
      console.log('\n📊 Execution Steps:');
      result.steps.forEach((step: any) => {
        const icon = step.status === 'completed' ? '✅' : 
                    step.status === 'failed' ? '❌' : 
                    step.status === 'running' ? '🔄' : '⏸️';
        console.log(`   ${icon} ${step.name} (${step.status})`);
      });
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

/**
 * 파일 타입별 아이콘 반환
 */
function getFileIcon(fileType: string): string {
  const icons: Record<string, string> = {
    'source': '📄',
    'test': '🧪',
    'config': '⚙️',
    'documentation': '📚'
  };

  return icons[fileType] || '📄';
}

// 사용 예제를 위한 도움말 확장
workflowCommand.addHelpText('after', `

Examples:
  $ dooray-ai workflow PROJECT123 TASK456 --repository myorg/myrepo
  $ dooray-ai wf PROJECT123 TASK456 --language python --framework fastapi --tests
  $ dooray-ai workflow PROJECT123 TASK456 --dry-run --custom-prompt "Create a REST API"
  $ dooray-ai wf PROJECT123 TASK456 --no-pr --output-dir ./generated

Workflow Steps:
  1. 📥 Fetch task from Dooray
  2. 🔍 Analyze task requirements  
  3. 🎨 Generate code using Claude Code
  4. 💾 Save generated files
  5. 🌿 Create Git branch and commit
  6. 🔗 Create GitHub Pull Request
  7. ✅ Update Dooray task with PR link

Requirements:
  • Dooray API credentials configured (dooray-ai auth login)
  • GitHub token configured (for PR creation)
  • Git repository (for commits)
  • Claude Code CLI available

Configuration:
  Run 'dooray-ai config' to view/modify default settings
`);

export default workflowCommand;