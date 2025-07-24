import { TaskWorkflowInput, WorkflowResult, WorkflowProgress } from './types';
/**
 * 태스크 워크플로우 엔진
 */
export declare class TaskWorkflowEngine {
    private defaultConfig;
    private steps;
    private progressCallback?;
    constructor(progressCallback?: (progress: WorkflowProgress) => void);
    /**
     * 태스크 워크플로우 실행
     */
    executeTaskWorkflow(input: TaskWorkflowInput): Promise<WorkflowResult>;
    /**
     * 워크플로우 단계 초기화
     */
    private initializeSteps;
    /**
     * 워크플로우 단계 실행
     */
    private executeStep;
    /**
     * 진행률 업데이트
     */
    private updateProgress;
    /**
     * 설정 로드
     */
    private loadConfig;
    /**
     * 워크플로우 입력 유효성 검증
     */
    private validateWorkflowInput;
    /**
     * 워크플로우 컨텍스트 생성
     */
    private createWorkflowContext;
    /**
     * 코드 생성
     */
    private generateCode;
    /**
     * 코드 생성 프롬프트 생성
     */
    private generateCodePrompt;
    /**
     * 생성된 파일 저장
     */
    private saveGeneratedFiles;
    /**
     * 파일 타입 결정
     */
    private determineFileType;
    /**
     * 파일 확장자 결정
     */
    private getFileExtension;
    /**
     * 태스크 URL 생성
     */
    private generateTaskUrl;
    /**
     * 실패 시 정리
     */
    private cleanupOnFailure;
}
//# sourceMappingURL=engine.d.ts.map