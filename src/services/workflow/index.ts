/**
 * 워크플로우 서비스 모듈
 */

export * from './types';
export { TaskWorkflowEngine } from './engine';

import { TaskWorkflowEngine } from './engine';
import { TaskWorkflowInput, WorkflowResult, WorkflowProgress } from './types';
import { logger } from '../../utils/logger';

/**
 * 글로벌 워크플로우 엔진 인스턴스
 */
let workflowEngine: TaskWorkflowEngine | null = null;

/**
 * 워크플로우 엔진 생성
 */
export function createWorkflowEngine(
  progressCallback?: (progress: WorkflowProgress) => void
): TaskWorkflowEngine {
  return new TaskWorkflowEngine(progressCallback);
}

/**
 * 기본 워크플로우 엔진 인스턴스 가져오기
 */
export function getWorkflowEngine(
  progressCallback?: (progress: WorkflowProgress) => void
): TaskWorkflowEngine {
  if (!workflowEngine) {
    workflowEngine = new TaskWorkflowEngine(progressCallback);
  }
  return workflowEngine;
}

/**
 * 태스크 워크플로우 실행 (편의 함수)
 */
export async function executeTaskWorkflow(
  projectId: string,
  taskId: string,
  options?: TaskWorkflowInput['options'],
  progressCallback?: (progress: WorkflowProgress) => void
): Promise<WorkflowResult> {
  const engine = getWorkflowEngine(progressCallback);
  
  return await engine.executeTaskWorkflow({
    projectId,
    taskId,
    options
  });
}

/**
 * 워크플로우 엔진 재설정
 */
export function resetWorkflowEngine(): void {
  workflowEngine = null;
}