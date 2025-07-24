import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs-extra';
import { logger } from '../../utils/logger';
import {
  GitConfig,
  GitRepository,
  GitBranch,
  GitCommit,
  GitStatus,
  GitError,
  BranchCreationOptions,
  CommitOptions,
  GitWorkflowOptions,
  WorkflowResult
} from './types';

const execAsync = promisify(exec);

/**
 * Git 클라이언트
 */
export class GitClient {
  private cwd: string;
  private config: GitConfig;

  constructor(repositoryPath: string = process.cwd(), config?: Partial<GitConfig>) {
    this.cwd = repositoryPath;
    this.config = {
      defaultBranch: 'main',
      autoCommit: false,
      commitMessageTemplate: 'feat: {task} - {description}',
      autoSync: true,
      rebaseOnPull: false,
      ...config
    };
  }

  /**
   * Git 명령어 실행
   */
  private async executeGitCommand(command: string): Promise<string> {
    try {
      logger.debug(`Executing git command: ${command}`);
      
      const { stdout, stderr } = await execAsync(`git ${command}`, {
        cwd: this.cwd,
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } as any
      });

      if (stderr && !stderr.includes('warning:')) {
        logger.warn(`Git warning: ${stderr}`);
      }

      return stdout.trim();
    } catch (error: any) {
      const gitError = new Error() as GitError;
      gitError.name = 'GitError';
      gitError.command = command;
      gitError.code = error.code || 'UNKNOWN';
      gitError.stdout = error.stdout;
      gitError.stderr = error.stderr;
      gitError.message = error.stderr || error.message || 'Git command failed';

      logger.error(`Git command failed: ${command}`);
      logger.error(`Error: ${gitError.message}`);
      
      throw gitError;
    }
  }

  /**
   * Git 저장소 정보 조회
   */
  async getRepositoryInfo(): Promise<GitRepository> {
    try {
      const [remoteUrl, currentBranch, status] = await Promise.all([
        this.getRemoteUrl().catch((): string | undefined => undefined),
        this.getCurrentBranch(),
        this.getStatus()
      ]);

      const repoName = remoteUrl 
        ? path.basename(remoteUrl, '.git')
        : path.basename(this.cwd);

      return {
        path: this.cwd,
        name: repoName,
        remoteUrl,
        currentBranch,
        isClean: status.staged.length === 0 && status.unstaged.length === 0 && status.untracked.length === 0,
        hasUncommittedChanges: status.staged.length > 0 || status.unstaged.length > 0,
        hasUnpushedCommits: status.ahead > 0
      };
    } catch (error) {
      logger.error('Failed to get repository info');
      throw error;
    }
  }

  /**
   * 현재 브랜치 조회
   */
  async getCurrentBranch(): Promise<string> {
    const result = await this.executeGitCommand('branch --show-current');
    return result || 'HEAD';
  }

  /**
   * 원격 저장소 URL 조회
   */
  async getRemoteUrl(remoteName: string = 'origin'): Promise<string> {
    return await this.executeGitCommand(`remote get-url ${remoteName}`);
  }

  /**
   * Git 상태 조회
   */
  async getStatus(): Promise<GitStatus> {
    const statusOutput = await this.executeGitCommand('status --porcelain=v1 -b');
    const lines = statusOutput.split('\n').filter(line => line.trim());
    
    const status: GitStatus = {
      branch: '',
      ahead: 0,
      behind: 0,
      staged: [],
      unstaged: [],
      untracked: [],
      conflicted: []
    };

    for (const line of lines) {
      if (line.startsWith('##')) {
        // Branch info
        const branchInfo = line.substring(3);
        const [branchPart] = branchInfo.split(' ');
        
        if (branchPart.includes('...')) {
          const [localBranch, tracking] = branchPart.split('...');
          status.branch = localBranch;
          status.tracking = tracking;
        } else {
          status.branch = branchPart;
        }

        // Parse ahead/behind
        const aheadMatch = branchInfo.match(/ahead (\d+)/);
        const behindMatch = branchInfo.match(/behind (\d+)/);
        
        if (aheadMatch) status.ahead = parseInt(aheadMatch[1]);
        if (behindMatch) status.behind = parseInt(behindMatch[1]);
      } else {
        // File status
        const indexStatus = line[0];
        const workingTreeStatus = line[1];
        const fileName = line.substring(3);

        if (indexStatus === '?' && workingTreeStatus === '?') {
          status.untracked.push(fileName);
        } else if (indexStatus === 'U' || workingTreeStatus === 'U') {
          status.conflicted.push(fileName);
        } else {
          if (indexStatus !== ' ' && indexStatus !== '?') {
            status.staged.push({ file: fileName, index: indexStatus, workingTree: workingTreeStatus });
          }
          if (workingTreeStatus !== ' ' && workingTreeStatus !== '?') {
            status.unstaged.push({ file: fileName, index: indexStatus, workingTree: workingTreeStatus });
          }
        }
      }
    }

    return status;
  }

  /**
   * 브랜치 목록 조회
   */
  async getBranches(includeRemote: boolean = false): Promise<GitBranch[]> {
    const command = includeRemote ? 'branch -a' : 'branch';
    const output = await this.executeGitCommand(command);
    
    const branches: GitBranch[] = [];
    const lines = output.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const isActive = line.startsWith('*');
      const isRemote = line.includes('remotes/');
      const name = line.replace(/^\*?\s+/, '').replace(/^remotes\/[^\/]+\//, '');
      
      // Skip HEAD references
      if (name.includes('HEAD ->')) continue;

      branches.push({
        name,
        isActive,
        isRemote
      });
    }

    return branches;
  }

  /**
   * 새 브랜치 생성
   */
  async createBranch(branchName: string, options: BranchCreationOptions = {}): Promise<string> {
    try {
      const {
        baseBranch = this.config.defaultBranch,
        switchToBranch = true,
        pushToRemote = false
      } = options;

      logger.info(`Creating branch: ${branchName} from ${baseBranch}`);

      // Ensure base branch exists and is up to date
      if (baseBranch !== await this.getCurrentBranch()) {
        await this.executeGitCommand(`checkout ${baseBranch}`);
        
        if (this.config.autoSync) {
          try {
            await this.executeGitCommand(`pull origin ${baseBranch}`);
          } catch (error) {
            logger.warn(`Could not pull latest changes for ${baseBranch}`);
          }
        }
      }

      // Create new branch
      await this.executeGitCommand(`checkout -b ${branchName}`);

      // Push to remote if requested
      if (pushToRemote) {
        try {
          await this.executeGitCommand(`push -u origin ${branchName}`);
          logger.success(`Branch ${branchName} pushed to remote`);
        } catch (error) {
          logger.warn(`Could not push branch to remote: ${error}`);
        }
      }

      logger.success(`Branch created successfully: ${branchName}`);
      return branchName;
    } catch (error) {
      logger.error(`Failed to create branch: ${branchName}`);
      throw error;
    }
  }

  /**
   * 브랜치 전환
   */
  async switchBranch(branchName: string): Promise<void> {
    try {
      logger.info(`Switching to branch: ${branchName}`);
      await this.executeGitCommand(`checkout ${branchName}`);
      logger.success(`Switched to branch: ${branchName}`);
    } catch (error) {
      logger.error(`Failed to switch to branch: ${branchName}`);
      throw error;
    }
  }

  /**
   * 파일 스테이징
   */
  async addFiles(files: string[] = ['.']): Promise<void> {
    try {
      const fileList = files.join(' ');
      await this.executeGitCommand(`add ${fileList}`);
      logger.debug(`Files staged: ${fileList}`);
    } catch (error) {
      logger.error('Failed to stage files');
      throw error;
    }
  }

  /**
   * 커밋 생성
   */
  async commit(options: CommitOptions): Promise<string> {
    try {
      const { message, addAll = true, push = false, files = ['.'] } = options;

      if (addAll) {
        await this.addFiles(files);
      }

      logger.info(`Creating commit: ${message}`);
      
      // Escape quotes in commit message
      const escapedMessage = message.replace(/"/g, '\\"');
      const commitResult = await this.executeGitCommand(`commit -m "${escapedMessage}"`);
      
      // Extract commit hash
      const hashMatch = commitResult.match(/\[[\w-]+\s+([a-f0-9]+)\]/);
      const commitHash = hashMatch ? hashMatch[1] : 'unknown';

      if (push) {
        try {
          const currentBranch = await this.getCurrentBranch();
          await this.executeGitCommand(`push origin ${currentBranch}`);
          logger.success('Changes pushed to remote');
        } catch (error) {
          logger.warn(`Could not push to remote: ${error}`);
        }
      }

      logger.success(`Commit created: ${commitHash}`);
      return commitHash;
    } catch (error) {
      logger.error('Failed to create commit');
      throw error;
    }
  }

  /**
   * 태스크 기반 워크플로우 실행
   */
  async executeTaskWorkflow(
    taskId: string,
    description: string,
    files: string[],
    options: GitWorkflowOptions = {}
  ): Promise<WorkflowResult> {
    try {
      const {
        branchPrefix = 'feature',
        commitMessage,
        pushToRemote = true,
        autoCleanup = false
      } = options;

      // Generate branch name
      const sanitizedTaskId = taskId.replace(/[^a-zA-Z0-9-]/g, '-');
      const branchName = `${branchPrefix}/${sanitizedTaskId}`;

      // Generate commit message
      const finalCommitMessage = commitMessage || 
        this.config.commitMessageTemplate
          .replace('{task}', taskId)
          .replace('{description}', description);

      const result: WorkflowResult = {
        success: false,
        filesChanged: files,
        message: ''
      };

      try {
        // Create and switch to new branch
        await this.createBranch(branchName, { 
          pushToRemote: false,
          switchToBranch: true 
        });
        result.branchName = branchName;

        // Commit changes
        const commitHash = await this.commit({
          message: finalCommitMessage,
          addAll: true,
          push: false,
          files
        });
        result.commitHash = commitHash;

        // Push to remote if requested
        if (pushToRemote) {
          await this.executeGitCommand(`push -u origin ${branchName}`);
        }

        result.success = true;
        result.message = `Successfully created branch ${branchName} and committed changes`;

        logger.success(`Task workflow completed: ${result.message}`);
        return result;

      } catch (error) {
        result.error = error as GitError;
        result.message = `Workflow failed: ${error}`;
        
        // Cleanup on failure
        if (autoCleanup && result.branchName) {
          try {
            await this.switchBranch(this.config.defaultBranch);
            await this.executeGitCommand(`branch -D ${result.branchName}`);
            logger.info(`Cleaned up failed branch: ${result.branchName}`);
          } catch (cleanupError) {
            logger.warn(`Could not cleanup branch: ${cleanupError}`);
          }
        }

        throw error;
      }
    } catch (error) {
      logger.error(`Task workflow failed for task: ${taskId}`);
      throw error;
    }
  }

  /**
   * 커밋 히스토리 조회
   */
  async getCommitHistory(limit: number = 10, branch?: string): Promise<GitCommit[]> {
    try {
      const branchArg = branch ? branch : '';
      const output = await this.executeGitCommand(
        `log ${branchArg} --pretty=format:"%H|%s|%an|%ae|%ad" --date=iso -n ${limit}`
      );

      const commits: GitCommit[] = [];
      const lines = output.split('\n').filter(line => line.trim());

      for (const line of lines) {
        const [hash, message, author, email, date] = line.split('|');
        
        // Get files changed in this commit
        const filesOutput = await this.executeGitCommand(`show --name-only --pretty=format: ${hash}`);
        const files = filesOutput.split('\n').filter(f => f.trim());

        commits.push({
          hash,
          message,
          author,
          email,
          date,
          files
        });
      }

      return commits;
    } catch (error) {
      logger.error('Failed to get commit history');
      throw error;
    }
  }

  /**
   * 브랜치 삭제
   */
  async deleteBranch(branchName: string, force: boolean = false): Promise<void> {
    try {
      const currentBranch = await this.getCurrentBranch();
      
      if (currentBranch === branchName) {
        await this.switchBranch(this.config.defaultBranch);
      }

      const deleteFlag = force ? '-D' : '-d';
      await this.executeGitCommand(`branch ${deleteFlag} ${branchName}`);
      
      // Try to delete remote branch
      try {
        await this.executeGitCommand(`push origin --delete ${branchName}`);
      } catch (error) {
        logger.warn(`Could not delete remote branch: ${branchName}`);
      }

      logger.success(`Branch deleted: ${branchName}`);
    } catch (error) {
      logger.error(`Failed to delete branch: ${branchName}`);
      throw error;
    }
  }

  /**
   * Git 저장소 검증
   */
  async validateRepository(): Promise<boolean> {
    try {
      await this.executeGitCommand('rev-parse --git-dir');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 구성 업데이트
   */
  updateConfig(newConfig: Partial<GitConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.debug('Git configuration updated');
  }
}