import axios, { AxiosInstance, AxiosError } from 'axios';
import { logger } from '../../utils/logger';
import {
  GitHubCredentials,
  GitHubRepository,
  GitHubUser,
  GitHubPullRequest,
  GitHubIssue,
  GitHubLabel,
  CreatePullRequestOptions,
  UpdatePullRequestOptions,
  GitHubApiOptions,
  GitHubError,
  PullRequestTemplate,
  GitHubWorkflowOptions
} from './types';

/**
 * GitHub API 클라이언트
 */
export class GitHubClient {
  private client: AxiosInstance;
  private credentials: GitHubCredentials;
  private options: GitHubApiOptions;

  constructor(credentials: GitHubCredentials, options: GitHubApiOptions = {}) {
    this.credentials = credentials;
    this.options = {
      timeout: 30000,
      retries: 3,
      baseUrl: 'https://api.github.com',
      ...options
    };

    this.client = axios.create({
      baseURL: this.options.baseUrl,
      timeout: this.options.timeout,
      headers: {
        'Authorization': `token ${this.credentials.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'dooray-ai-client',
        'Content-Type': 'application/json'
      }
    });

    // 응답 인터셉터 설정
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  /**
   * API 오류 처리
   */
  private handleApiError(error: AxiosError): GitHubError {
    const githubError = new Error() as GitHubError;
    githubError.name = 'GitHubError';
    
    if (error.response) {
      githubError.statusCode = error.response.status;
      githubError.code = `HTTP_${error.response.status}`;
      githubError.message = (error.response.data as any)?.message || error.message;
      githubError.response = error.response.data;

      // Handle specific GitHub errors
      if (error.response.status === 401) {
        githubError.message = 'Invalid GitHub token. Please check your authentication.';
      } else if (error.response.status === 403) {
        githubError.message = 'GitHub API rate limit exceeded or insufficient permissions.';
      } else if (error.response.status === 404) {
        githubError.message = 'Repository or resource not found.';
      }
    } else if (error.request) {
      githubError.code = 'NETWORK_ERROR';
      githubError.message = 'Network error: Unable to reach GitHub API';
    } else {
      githubError.code = 'REQUEST_ERROR';
      githubError.message = error.message;
    }

    logger.error(`GitHub API Error [${githubError.code}]: ${githubError.message}`);
    return githubError;
  }

  /**
   * 연결 상태 확인
   */
  async validateConnection(): Promise<boolean> {
    try {
      logger.debug('Validating GitHub API connection...');
      await this.getCurrentUser();
      logger.success('GitHub API connection validated');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`GitHub API connection failed: ${errorMessage}`);
      return false;
    }
  }

  /**
   * 현재 사용자 정보 조회
   */
  async getCurrentUser(): Promise<GitHubUser> {
    try {
      const response = await this.client.get<GitHubUser>('/user');
      return response.data;
    } catch (error) {
      logger.error('Failed to get current user');
      throw error;
    }
  }

  /**
   * 저장소 정보 조회
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    try {
      const response = await this.client.get<GitHubRepository>(`/repos/${owner}/${repo}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get repository: ${owner}/${repo}`);
      throw error;
    }
  }

  /**
   * 사용자의 저장소 목록 조회
   */
  async getRepositories(options: {
    type?: 'owner' | 'member' | 'all';
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  } = {}): Promise<GitHubRepository[]> {
    try {
      const params = new URLSearchParams();
      
      if (options.type) params.append('type', options.type);
      if (options.sort) params.append('sort', options.sort);
      if (options.direction) params.append('direction', options.direction);
      if (options.per_page) params.append('per_page', options.per_page.toString());
      if (options.page) params.append('page', options.page.toString());

      const response = await this.client.get<GitHubRepository[]>(
        `/user/repos?${params.toString()}`
      );
      
      return response.data;
    } catch (error) {
      logger.error('Failed to get repositories');
      throw error;
    }
  }

  /**
   * Pull Request 생성
   */
  async createPullRequest(
    owner: string,
    repo: string,
    options: CreatePullRequestOptions
  ): Promise<GitHubPullRequest> {
    try {
      logger.info(`Creating PR: ${owner}/${repo} - ${options.title}`);
      
      const response = await this.client.post<GitHubPullRequest>(
        `/repos/${owner}/${repo}/pulls`,
        options
      );

      const pr = response.data;
      logger.success(`PR created successfully: #${pr.number} - ${pr.html_url}`);
      
      return pr;
    } catch (error) {
      logger.error(`Failed to create PR: ${owner}/${repo}`);
      throw error;
    }
  }

  /**
   * Pull Request 업데이트
   */
  async updatePullRequest(
    owner: string,
    repo: string,
    pullNumber: number,
    options: UpdatePullRequestOptions
  ): Promise<GitHubPullRequest> {
    try {
      logger.info(`Updating PR: ${owner}/${repo}#${pullNumber}`);
      
      const response = await this.client.patch<GitHubPullRequest>(
        `/repos/${owner}/${repo}/pulls/${pullNumber}`,
        options
      );

      const pr = response.data;
      logger.success(`PR updated successfully: #${pr.number}`);
      
      return pr;
    } catch (error) {
      logger.error(`Failed to update PR: ${owner}/${repo}#${pullNumber}`);
      throw error;
    }
  }

  /**
   * Pull Request 조회
   */
  async getPullRequest(owner: string, repo: string, pullNumber: number): Promise<GitHubPullRequest> {
    try {
      const response = await this.client.get<GitHubPullRequest>(
        `/repos/${owner}/${repo}/pulls/${pullNumber}`
      );
      return response.data;
    } catch (error) {
      logger.error(`Failed to get PR: ${owner}/${repo}#${pullNumber}`);
      throw error;
    }
  }

  /**
   * Pull Request 목록 조회
   */
  async getPullRequests(
    owner: string,
    repo: string,
    options: {
      state?: 'open' | 'closed' | 'all';
      head?: string;
      base?: string;
      sort?: 'created' | 'updated' | 'popularity';
      direction?: 'asc' | 'desc';
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<GitHubPullRequest[]> {
    try {
      const params = new URLSearchParams();
      
      if (options.state) params.append('state', options.state);
      if (options.head) params.append('head', options.head);
      if (options.base) params.append('base', options.base);
      if (options.sort) params.append('sort', options.sort);
      if (options.direction) params.append('direction', options.direction);
      if (options.per_page) params.append('per_page', options.per_page.toString());
      if (options.page) params.append('page', options.page.toString());

      const response = await this.client.get<GitHubPullRequest[]>(
        `/repos/${owner}/${repo}/pulls?${params.toString()}`
      );
      
      return response.data;
    } catch (error) {
      logger.error(`Failed to get PRs: ${owner}/${repo}`);
      throw error;
    }
  }

  /**
   * 라벨 조회
   */
  async getLabels(owner: string, repo: string): Promise<GitHubLabel[]> {
    try {
      const response = await this.client.get<GitHubLabel[]>(`/repos/${owner}/${repo}/labels`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get labels: ${owner}/${repo}`);
      throw error;
    }
  }

  /**
   * Issue에 라벨 추가
   */
  async addLabelsToIssue(
    owner: string,
    repo: string,
    issueNumber: number,
    labels: string[]
  ): Promise<GitHubLabel[]> {
    try {
      const response = await this.client.post<GitHubLabel[]>(
        `/repos/${owner}/${repo}/issues/${issueNumber}/labels`,
        { labels }
      );
      return response.data;
    } catch (error) {
      logger.error(`Failed to add labels to issue: ${owner}/${repo}#${issueNumber}`);
      throw error;
    }
  }

  /**
   * Pull Request에 assignee 추가
   */
  async addAssignees(
    owner: string,
    repo: string,
    issueNumber: number,
    assignees: string[]
  ): Promise<GitHubIssue> {
    try {
      const response = await this.client.post<GitHubIssue>(
        `/repos/${owner}/${repo}/issues/${issueNumber}/assignees`,
        { assignees }
      );
      return response.data;
    } catch (error) {
      logger.error(`Failed to add assignees: ${owner}/${repo}#${issueNumber}`);
      throw error;
    }
  }

  /**
   * Pull Request에 reviewer 요청
   */
  async requestReviewers(
    owner: string,
    repo: string,
    pullNumber: number,
    reviewers: string[],
    team_reviewers: string[] = []
  ): Promise<GitHubPullRequest> {
    try {
      const response = await this.client.post<GitHubPullRequest>(
        `/repos/${owner}/${repo}/pulls/${pullNumber}/requested_reviewers`,
        { reviewers, team_reviewers }
      );
      return response.data;
    } catch (error) {
      logger.error(`Failed to request reviewers: ${owner}/${repo}#${pullNumber}`);
      throw error;
    }
  }

  /**
   * 브랜치 존재 확인
   */
  async branchExists(owner: string, repo: string, branch: string): Promise<boolean> {
    try {
      await this.client.get(`/repos/${owner}/${repo}/branches/${branch}`);
      return true;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * 태스크 기반 PR 생성 워크플로우
   */
  async createTaskPullRequest(
    taskId: string,
    taskTitle: string,
    taskDescription: string,
    branchName: string,
    options: GitHubWorkflowOptions
  ): Promise<GitHubPullRequest> {
    try {
      const [owner, repo] = options.repository.split('/');
      
      if (!owner || !repo) {
        throw new Error('Invalid repository format. Use "owner/repo" format.');
      }

      // 저장소 정보 확인
      const repository = await this.getRepository(owner, repo);
      const baseBranch = repository.default_branch;

      // 브랜치 존재 확인
      const branchExists = await this.branchExists(owner, repo, branchName);
      if (!branchExists) {
        throw new Error(`Branch "${branchName}" does not exist in the repository`);
      }

      // PR 템플릿 생성
      const template = this.generatePRTemplate(taskId, taskTitle, taskDescription, options);

      // PR 생성 옵션
      const createOptions: CreatePullRequestOptions = {
        title: template.title,
        body: template.body,
        head: branchName,
        base: baseBranch,
        draft: false
      };

      // 라벨 추가
      if (template.labels && template.labels.length > 0) {
        createOptions.labels = template.labels;
      }

      // 할당자 추가
      if (template.assignees && template.assignees.length > 0) {
        createOptions.assignees = template.assignees;
      }

      // 리뷰어 추가
      if (template.reviewers && template.reviewers.length > 0) {
        createOptions.reviewers = template.reviewers;
      }

      // PR 생성
      const pr = await this.createPullRequest(owner, repo, createOptions);

      logger.success(`Task PR created successfully: ${pr.html_url}`);
      return pr;

    } catch (error) {
      logger.error(`Failed to create task PR for task: ${taskId}`);
      throw error;
    }
  }

  /**
   * PR 템플릿 생성
   */
  private generatePRTemplate(
    taskId: string,
    taskTitle: string,
    taskDescription: string,
    options: GitHubWorkflowOptions
  ): PullRequestTemplate {
    const template = options.prTemplate || {};

    const title = template.title || `[${taskId}] ${taskTitle}`;
    
    let body = template.body || '';
    if (!body) {
      body = `## Task Information
- **Task ID:** ${taskId}
- **Title:** ${taskTitle}

## Description
${taskDescription}

## Changes Made
<!-- Describe the changes made in this PR -->

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project standards
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] Ready for review`;

      // 태스크 링크 추가
      if (options.linkToTask && options.taskUrl) {
        body = `**Related Task:** ${options.taskUrl}\n\n${body}`;
      }
    }

    return {
      title,
      body,
      labels: template.labels || ['enhancement'],
      assignees: template.assignees || [],
      reviewers: template.reviewers || []
    };
  }

  /**
   * 저장소에서 현재 사용자가 collaborator인지 확인
   */
  async isCollaborator(owner: string, repo: string, username?: string): Promise<boolean> {
    try {
      const user = username || (await this.getCurrentUser()).login;
      await this.client.get(`/repos/${owner}/${repo}/collaborators/${user}`);
      return true;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * 저장소의 기본 브랜치 확인
   */
  async getDefaultBranch(owner: string, repo: string): Promise<string> {
    try {
      const repository = await this.getRepository(owner, repo);
      return repository.default_branch;
    } catch (error) {
      logger.error(`Failed to get default branch: ${owner}/${repo}`);
      throw error;
    }
  }
}