import * as path from 'path';
import * as fs from 'fs-extra';
import { logger } from '../../utils/logger';
import { getDoorayClient } from '../dooray';
import { getGitHubClient } from '../github';
import { getGitClient } from '../git';
import { codeGenerator } from '../ai/code-generator';
import { configManager } from '../config';
import {
  WorkflowConfig,
  WorkflowOptions,
  TaskWorkflowInput,
  WorkflowResult,
  WorkflowStep,
  WorkflowContext,
  GeneratedFile,
  ValidationResult,
  WorkflowProgress
} from './types';

/**
 * 태스크 워크플로우 엔진
 */
export class TaskWorkflowEngine {
  private defaultConfig: WorkflowConfig = {
    repository: '',
    branchPrefix: 'feature',
    autoCommit: true,
    autoPush: true,
    createPR: true,
    autoAssign: true,
    addLabels: true,
    linkToTask: true,
    cleanupOnFailure: true
  };

  private steps: WorkflowStep[] = [];
  private progressCallback?: (progress: WorkflowProgress) => void;

  constructor(progressCallback?: (progress: WorkflowProgress) => void) {
    this.progressCallback = progressCallback;
  }

  /**
   * 태스크 워크플로우 실행
   */
  async executeTaskWorkflow(input: TaskWorkflowInput): Promise<WorkflowResult> {
    const startTime = Date.now();
    
    try {
      logger.info(`Starting workflow for task: ${input.projectId}/${input.taskId}`);
      
      // 설정 로드 및 병합
      const config = await this.loadConfig(input.options?.config);
      const options = input.options || {};

      // 워크플로우 단계 초기화
      this.initializeSteps(options);
      
      const result: WorkflowResult = {
        success: false,
        taskId: input.taskId,
        projectId: input.projectId,
        generatedFiles: [],
        steps: this.steps,
        duration: 0
      };

      try {
        // 1. 유효성 검증
        await this.executeStep('validation', async () => {
          const validation = await this.validateWorkflowInput(input, config);
          if (!validation.valid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
          }
          return validation;
        });

        // 2. 태스크 정보 조회
        const task = await this.executeStep('fetch-task', async () => {
          const doorayClient = await getDoorayClient();
          return await doorayClient.getTask(input.projectId, input.taskId);
        });
        result.task = task;

        // 3. 태스크 분석
        const analysis = await this.executeStep('analyze-task', async () => {
          const doorayClient = await getDoorayClient();
          return await doorayClient.analyzeTask(input.projectId, input.taskId);
        });
        result.analysis = analysis;

        // 4. 워크플로우 컨텍스트 생성
        const context = await this.executeStep('prepare-context', async () => {
          return await this.createWorkflowContext(task, analysis, config, options);
        });

        // Dry run 체크
        if (options.dryRun) {
          logger.info('Dry run mode - skipping code generation and git operations');
          result.success = true;
          result.duration = Date.now() - startTime;
          return result;
        }

        // 5. 코드 생성
        const generatedFiles = await this.executeStep('generate-code', async () => {
          return await this.generateCode(context);
        });
        result.generatedFiles = generatedFiles;

        // 6. 파일 저장
        await this.executeStep('save-files', async () => {
          return await this.saveGeneratedFiles(generatedFiles, context.workingDirectory);
        });

        // 7. Git 워크플로우 실행
        if (config.autoCommit) {
          const gitResult = await this.executeStep('git-workflow', async () => {
            const gitClient = await getGitClient();
            const filePaths = generatedFiles.map(f => f.path);
            
            return await gitClient.executeTaskWorkflow(
              input.taskId,
              task.subject,
              filePaths,
              {
                branchPrefix: config.branchPrefix,
                commitMessage: context.commitMessage,
                pushToRemote: config.autoPush
              }
            );
          });
          result.gitResult = gitResult;
        }

        // 8. GitHub PR 생성
        if (config.createPR && result.gitResult?.branchName) {
          const pullRequest = await this.executeStep('create-pr', async () => {
            const githubClient = await getGitHubClient();
            
            return await githubClient.createTaskPullRequest(
              input.taskId,
              task.subject,
              task.body,
              result.gitResult!.branchName!,
              {
                repository: config.repository,
                autoAssign: config.autoAssign,
                autoLabel: config.addLabels,
                linkToTask: config.linkToTask,
                taskUrl: this.generateTaskUrl(input.projectId, input.taskId)
              }
            );
          });
          result.pullRequest = pullRequest;
        }

        // 9. 태스크 업데이트
        if (config.linkToTask && result.pullRequest) {
          await this.executeStep('update-task', async () => {
            const doorayClient = await getDoorayClient();
            
            const updateBody = `${task.body}\n\n---\n**구현 PR:** ${result.pullRequest!.html_url}`;
            
            return await doorayClient.updateTask(
              input.projectId,
              input.taskId,
              {
                body: updateBody,
                status: 'working'
              }
            );
          });
        }

        result.success = true;
        logger.success(`Workflow completed successfully for task: ${input.taskId}`);

      } catch (error) {
        result.error = error as Error;
        logger.error(`Workflow failed: ${error}`);
        
        // 실패 시 정리
        if (config.cleanupOnFailure) {
          await this.cleanupOnFailure(result);
        }
        
        throw error;
      }

      result.duration = Date.now() - startTime;
      return result;

    } catch (error) {
      logger.error(`Task workflow failed: ${error}`);
      throw error;
    }
  }

  /**
   * 워크플로우 단계 초기화
   */
  private initializeSteps(options: WorkflowOptions): void {
    this.steps = [
      { id: 'validation', name: '유효성 검증', status: 'pending' },
      { id: 'fetch-task', name: '태스크 정보 조회', status: 'pending' },
      { id: 'analyze-task', name: '태스크 분석', status: 'pending' },
      { id: 'prepare-context', name: '컨텍스트 준비', status: 'pending' },
      { id: 'generate-code', name: '코드 생성', status: 'pending' },
      { id: 'save-files', name: '파일 저장', status: 'pending' },
      { id: 'git-workflow', name: 'Git 워크플로우', status: 'pending' },
      { id: 'create-pr', name: 'PR 생성', status: 'pending' },
      { id: 'update-task', name: '태스크 업데이트', status: 'pending' }
    ];

    if (options.dryRun) {
      // Dry run에서는 일부 단계 스킵
      this.steps = this.steps.filter(step => 
        ['validation', 'fetch-task', 'analyze-task', 'prepare-context'].includes(step.id)
      );
    }
  }

  /**
   * 워크플로우 단계 실행
   */
  private async executeStep<T>(stepId: string, executor: () => Promise<T>): Promise<T> {
    const step = this.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step not found: ${stepId}`);
    }

    step.status = 'running';
    step.startTime = new Date();

    // 진행률 업데이트
    this.updateProgress();

    try {
      logger.info(`Executing step: ${step.name}`);
      const result = await executor();
      
      step.status = 'completed';
      step.endTime = new Date();
      step.result = result;
      
      logger.success(`Step completed: ${step.name}`);
      this.updateProgress();
      
      return result;
    } catch (error) {
      step.status = 'failed';
      step.endTime = new Date();
      step.error = error as Error;
      
      logger.error(`Step failed: ${step.name} - ${error}`);
      this.updateProgress();
      
      throw error;
    }
  }

  /**
   * 진행률 업데이트
   */
  private updateProgress(): void {
    if (!this.progressCallback) return;

    const totalSteps = this.steps.length;
    const completedSteps = this.steps.filter(s => s.status === 'completed').length;
    const currentStep = this.steps.find(s => s.status === 'running');
    
    const progress: WorkflowProgress = {
      currentStep: currentStep?.name || 'Completed',
      totalSteps,
      completedSteps,
      progress: Math.round((completedSteps / totalSteps) * 100),
      message: currentStep ? `Executing: ${currentStep.name}` : 'Workflow completed'
    };

    this.progressCallback(progress);
  }

  /**
   * 설정 로드
   */
  private async loadConfig(overrides?: Partial<WorkflowConfig>): Promise<WorkflowConfig> {
    try {
      const appConfig = await configManager.load();
      const baseConfig = { ...this.defaultConfig };

      // 앱 설정에서 워크플로우 관련 설정 추출
      if (appConfig.git) {
        baseConfig.autoCommit = appConfig.git.autoCommit ?? baseConfig.autoCommit;
        baseConfig.branchPrefix = 'feature'; // 기본값 유지
      }

      // 오버라이드 적용
      return { ...baseConfig, ...overrides };
    } catch (error) {
      logger.warn('Failed to load config, using defaults');
      return { ...this.defaultConfig, ...overrides };
    }
  }

  /**
   * 워크플로우 입력 유효성 검증
   */
  private async validateWorkflowInput(
    input: TaskWorkflowInput,
    config: WorkflowConfig
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 필수 필드 검증
    if (!input.projectId) errors.push('Project ID is required');
    if (!input.taskId) errors.push('Task ID is required');

    // GitHub 저장소 설정 검증
    if (config.createPR && !config.repository) {
      errors.push('Repository must be specified for PR creation');
    }

    if (config.repository && !config.repository.includes('/')) {
      errors.push('Repository must be in "owner/repo" format');
    }

    // Git 저장소 검증
    if (config.autoCommit) {
      const gitClient = await getGitClient();
      const isValidRepo = await gitClient.validateRepository();
      if (!isValidRepo) {
        errors.push('Current directory is not a valid Git repository');
      }
    }

    // 서비스 연결 상태 검증
    if (!input.options?.skipValidation) {
      try {
        const doorayClient = await getDoorayClient();
        const doorayValid = await doorayClient.validateConnection();
        if (!doorayValid) errors.push('Dooray API connection failed');
      } catch (error) {
        errors.push('Dooray API not configured');
      }

      if (config.createPR) {
        try {
          const githubClient = await getGitHubClient();
          const githubValid = await githubClient.validateConnection();
          if (!githubValid) errors.push('GitHub API connection failed');
        } catch (error) {
          errors.push('GitHub API not configured');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 워크플로우 컨텍스트 생성
   */
  private async createWorkflowContext(
    task: any,
    analysis: any,
    config: WorkflowConfig,
    options: WorkflowOptions
  ): Promise<WorkflowContext> {
    const sanitizedTaskId = task.id.replace(/[^a-zA-Z0-9-]/g, '-');
    const branchName = `${config.branchPrefix}/${sanitizedTaskId}`;
    
    const commitMessage = `feat(${task.id}): ${task.subject}

${task.body.substring(0, 200)}${task.body.length > 200 ? '...' : ''}

Task: ${task.id}`;

    return {
      task,
      analysis,
      config,
      options,
      workingDirectory: process.cwd(),
      branchName,
      commitMessage
    };
  }

  /**
   * 코드 생성
   */
  private async generateCode(context: WorkflowContext): Promise<GeneratedFile[]> {
    const { task, analysis, options } = context;
    
    logger.info('Generating code based on task analysis...');

    try {
      // 커스텀 프롬프트 또는 분석 기반 프롬프트 생성
      const prompt = options.customPrompt || this.generateCodePrompt(task, analysis);
      
      // 코드 생성 옵션
      const generationOptions = {
        language: analysis.recommendedLanguage || 'typescript',
        framework: analysis.recommendedFramework,
        style: options.codeStyle || 'mixed',
        includeTests: options.includeTests || false,
        includeComments: options.includeComments || true,
        context: `Task: ${task.subject}\n\nRequirements:\n${analysis.requirements.join('\n')}`
      };

      // 복잡도에 따라 생성 방식 결정
      let result;
      if (analysis.estimatedComplexity === 'high' || analysis.technicalSpecs.length > 3) {
        // 복잡한 태스크는 프로젝트 생성
        result = await codeGenerator.generateProject(
          prompt,
          'web-app', // 기본값, 추후 분석 기반으로 결정
          generationOptions
        );
      } else {
        // 단순한 태스크는 코드 생성
        result = await codeGenerator.generateCode(prompt, generationOptions);
      }

      // 결과를 GeneratedFile 형식으로 변환
      const files: GeneratedFile[] = [];

      if (result.files && result.files.length > 0) {
        // 멀티 파일 결과
        for (const file of result.files) {
          files.push({
            path: file.path,
            content: file.content,
            type: this.determineFileType(file.path, file.type),
            language: result.language,
            framework: result.framework
          });
        }
      } else {
        // 단일 파일 결과
        const fileName = `${task.id.replace(/[^a-zA-Z0-9]/g, '_')}.${this.getFileExtension(result.language)}`;
        files.push({
          path: fileName,
          content: result.code,
          type: 'source',
          language: result.language,
          framework: result.framework
        });
      }

      logger.success(`Generated ${files.length} files`);
      return files;

    } catch (error) {
      logger.error('Code generation failed');
      throw error;
    }
  }

  /**
   * 코드 생성 프롬프트 생성
   */
  private generateCodePrompt(task: any, analysis: any): string {
    return `# Task: ${task.subject}

## Description
${task.body}

## Requirements
${analysis.requirements.map((req: string) => `- ${req}`).join('\n')}

## Technical Specifications
${analysis.technicalSpecs.map((spec: string) => `- ${spec}`).join('\n')}

## Acceptance Criteria
${analysis.acceptanceCriteria.map((criteria: string) => `- ${criteria}`).join('\n')}

## Suggested Approach
${analysis.suggestedApproach}

Please implement the solution following these requirements and best practices.`;
  }

  /**
   * 생성된 파일 저장
   */
  private async saveGeneratedFiles(files: GeneratedFile[], workingDirectory: string): Promise<void> {
    logger.info(`Saving ${files.length} generated files...`);

    for (const file of files) {
      const filePath = path.resolve(workingDirectory, file.path);
      const directory = path.dirname(filePath);

      // 디렉토리 생성
      await fs.ensureDir(directory);
      
      // 파일 저장
      await fs.writeFile(filePath, file.content, 'utf8');
      
      logger.debug(`Saved file: ${file.path}`);
    }

    logger.success('All files saved successfully');
  }

  /**
   * 파일 타입 결정
   */
  private determineFileType(filePath: string, declaredType?: string): GeneratedFile['type'] {
    if (declaredType) {
      return declaredType as GeneratedFile['type'];
    }

    const fileName = path.basename(filePath).toLowerCase();
    
    if (fileName.includes('test') || fileName.includes('spec')) return 'test';
    if (fileName.includes('config') || fileName.includes('setting')) return 'config';
    if (fileName.includes('readme') || fileName.includes('doc')) return 'documentation';
    
    return 'source';
  }

  /**
   * 파일 확장자 결정
   */
  private getFileExtension(language: string): string {
    const extensions: Record<string, string> = {
      'typescript': 'ts',
      'javascript': 'js',
      'python': 'py',
      'java': 'java',
      'go': 'go',
      'rust': 'rs',
      'csharp': 'cs'
    };

    return extensions[language.toLowerCase()] || 'txt';
  }

  /**
   * 태스크 URL 생성
   */
  private generateTaskUrl(projectId: string, taskId: string): string {
    return `https://dooray.com/project/${projectId}/task/${taskId}`;
  }

  /**
   * 실패 시 정리
   */
  private async cleanupOnFailure(result: WorkflowResult): Promise<void> {
    logger.info('Cleaning up after workflow failure...');

    try {
      // Git 브랜치 정리
      if (result.gitResult?.branchName) {
        const gitClient = await getGitClient();
        const defaultBranch = (await gitClient.getRepositoryInfo()).currentBranch;
        
        try {
          await gitClient.switchBranch(defaultBranch);
          await gitClient.deleteBranch(result.gitResult.branchName, true);
          logger.info(`Cleaned up branch: ${result.gitResult.branchName}`);
        } catch (error) {
          logger.warn(`Failed to cleanup branch: ${error}`);
        }
      }

      // 생성된 파일 정리 (선택적)
      // 주의: 이 부분은 신중하게 구현해야 함
      
    } catch (error) {
      logger.warn(`Cleanup failed: ${error}`);
    }
  }
}