/**
 * 워크플로우 서비스 모듈
 */
export * from './types';
export { TaskWorkflowEngine } from './engine';
import { TaskWorkflowEngine } from './engine';
import { TaskWorkflowInput, WorkflowResult, WorkflowProgress } from './types';
/**
 * 워크플로우 엔진 생성
 */
export declare function createWorkflowEngine(progressCallback?: (progress: WorkflowProgress) => void): TaskWorkflowEngine;
/**
 * 기본 워크플로우 엔진 인스턴스 가져오기
 */
export declare function getWorkflowEngine(progressCallback?: (progress: WorkflowProgress) => void): TaskWorkflowEngine;
/**
 * 태스크 워크플로우 실행 (편의 함수)
 */
export declare function executeTaskWorkflow(projectId: string, taskId: string, options?: TaskWorkflowInput['options'], progressCallback?: (progress: WorkflowProgress) => void): Promise<WorkflowResult>;
/**
 * 워크플로우 엔진 재설정
 */
export declare function resetWorkflowEngine(): void;
//# sourceMappingURL=index.d.ts.map