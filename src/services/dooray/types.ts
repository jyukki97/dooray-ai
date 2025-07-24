/**
 * Dooray API 타입 정의
 */

export interface DoorayCredentials {
  apiKey: string;
  userId?: string;
  projectId?: string;
  baseUrl?: string;
}

export interface DoorayProject {
  id: string;
  code: string;
  title: string;
  description?: string;
  status: 'active' | 'archived' | 'closed';
  createdAt: string;
  updatedAt: string;
  members: DoorayMember[];
}

export interface DoorayMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'guest';
}

export interface DoorayTask {
  id: string;
  subject: string;
  body: string;
  status: 'registered' | 'working' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assigneeId?: string;
  reporterId: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  tags: string[];
  attachments: DoorayAttachment[];
  comments: DoorayComment[];
  workflow?: {
    currentStep: string;
    availableTransitions: string[];
  };
}

export interface DoorayAttachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  downloadUrl: string;
}

export interface DoorayComment {
  id: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoorayTaskUpdate {
  subject?: string;
  body?: string;
  status?: DoorayTask['status'];
  assigneeId?: string;
  priority?: DoorayTask['priority'];
  tags?: string[];
  dueDate?: string;
}

export interface DoorayCommentCreate {
  body: string;
  mimeType?: 'text/plain' | 'text/x-markdown';
}

export interface DoorayApiResponse<T> {
  header: {
    isSuccessful: boolean;
    resultCode: number;
    resultMessage: string;
  };
  result: T;
}

export interface DoorayError extends Error {
  code: string;
  statusCode?: number;
  response?: any;
}

export interface DoorayApiOptions {
  timeout?: number;
  retries?: number;
  baseUrl?: string;
}

/**
 * Dooray 작업 분석 결과
 */
export interface TaskAnalysis {
  taskId: string;
  projectId: string;
  title: string;
  description: string;
  requirements: string[];
  technicalSpecs: string[];
  acceptanceCriteria: string[];
  suggestedApproach: string;
  estimatedComplexity: 'low' | 'medium' | 'high';
  recommendedLanguage?: string;
  recommendedFramework?: string;
}