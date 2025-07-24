/**
 * 워크플로우 타입 정의
 */

import { DoorayTask, TaskAnalysis } from '../dooray/types';
import { GitHubPullRequest } from '../github/types';
import { WorkflowResult as GitWorkflowResult } from '../git/types';

export interface WorkflowConfig {
  repository: string; // owner/repo format
  branchPrefix: string;
  autoCommit: boolean;
  autoPush: boolean;
  createPR: boolean;
  autoAssign: boolean;
  addLabels: boolean;
  linkToTask: boolean;
  outputDirectory?: string;
  cleanupOnFailure: boolean;
}

export interface WorkflowOptions {
  config?: Partial<WorkflowConfig>;
  dryRun?: boolean;
  skipValidation?: boolean;
  customPrompt?: string;
  codeStyle?: 'functional' | 'object-oriented' | 'mixed';
  includeTests?: boolean;
  includeComments?: boolean;
}

export interface TaskWorkflowInput {
  projectId: string;
  taskId: string;
  options?: WorkflowOptions;
}

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  error?: Error;
  result?: any;
}

export interface WorkflowResult {
  success: boolean;
  taskId: string;
  projectId: string;
  task?: DoorayTask;
  analysis?: TaskAnalysis;
  generatedFiles: GeneratedFile[];
  gitResult?: GitWorkflowResult;
  pullRequest?: GitHubPullRequest;
  steps: WorkflowStep[];
  duration: number;
  error?: Error;
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'source' | 'test' | 'config' | 'documentation';
  language: string;
  framework?: string | undefined;
}

export interface WorkflowContext {
  task: DoorayTask;
  analysis: TaskAnalysis;
  config: WorkflowConfig;
  options: WorkflowOptions;
  workingDirectory: string;
  branchName: string;
  commitMessage: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface WorkflowProgress {
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
  progress: number; // 0-100
  message: string;
}