// CLI 관련 타입 정의
export interface CLIOptions {
  verbose?: boolean;
  debug?: boolean;
  config?: string;
}

// 태스크 관련 타입 정의
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

// Git 관련 타입 정의
export interface GitInfo {
  currentBranch: string;
  hasChanges: boolean;
  remoteUrl?: string;
  lastCommit?: string;
}

// API 응답 타입 정의
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 설정 타입 정의
export interface Config {
  doorayApiKey?: string;
  githubToken?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  defaultBranch: string;
  autoCommit: boolean;
  autoPush: boolean;
}
