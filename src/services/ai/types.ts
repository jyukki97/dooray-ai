/**
 * AI 서비스 공통 타입 정의
 */

// AI 엔진 종류
export enum AIEngine {
  CLAUDE_CODE = 'claude-code'
}

// AI 요청 메타데이터
export interface AIRequestMetadata {
  requestId: string;
  timestamp: Date;
  engine: AIEngine;
  userId?: string;
  sessionId?: string;
}

// AI 응답 메타데이터
export interface AIResponseMetadata {
  requestId: string;
  timestamp: Date;
  engine: AIEngine;
  responseTime: number;
  tokensUsed?: number;
  cost?: number;
  fallbackAttempts?: any[];
}

// 코드 생성 요청
export interface CodeGenerationRequest {
  prompt: string;
  language?: string;
  context?: string | undefined;
  maxTokens?: number;
  temperature?: number;
  metadata?: AIRequestMetadata;
}

// 코드 생성 응답
export interface CodeGenerationResponse {
  code: string;
  explanation?: string;
  suggestions?: string[];
  metadata: AIResponseMetadata;
}

// AI 클라이언트 인터페이스
export interface AIClient {
  engine: AIEngine;
  validateConnection(): Promise<boolean>;
  generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse>;
  getUsageStats(): Promise<UsageStats>;
}

// 사용량 통계
export interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  lastRequestTime?: Date;
}

// AI 설정
export interface AIConfig {
  engine: AIEngine;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
  retryAttempts?: number;
}

// 오류 타입
export class AIError extends Error {
  public readonly code: string;
  public readonly engine: AIEngine;
  public readonly requestId?: string | undefined;

  constructor(
    message: string,
    code: string,
    engine: AIEngine,
    requestId?: string | undefined
  ) {
    super(message);
    this.name = 'AIError';
    this.code = code;
    this.engine = engine;
    this.requestId = requestId;
    Object.setPrototypeOf(this, AIError.prototype);
  }
} 