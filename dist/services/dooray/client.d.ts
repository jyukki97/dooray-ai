import { DoorayCredentials, DoorayProject, DoorayTask, DoorayTaskUpdate, DoorayComment, DoorayCommentCreate, DoorayApiOptions, TaskAnalysis } from './types';
/**
 * Dooray API 클라이언트
 */
export declare class DoorayClient {
    private client;
    private credentials;
    private options;
    constructor(credentials: DoorayCredentials, options?: DoorayApiOptions);
    /**
     * API 오류 처리
     */
    private handleApiError;
    /**
     * API 응답 검증
     */
    private validateResponse;
    /**
     * 연결 상태 확인
     */
    validateConnection(): Promise<boolean>;
    /**
     * 프로젝트 목록 조회
     */
    getProjects(): Promise<DoorayProject[]>;
    /**
     * 특정 프로젝트 조회
     */
    getProject(projectId: string): Promise<DoorayProject>;
    /**
     * 태스크 조회
     */
    getTask(projectId: string, taskId: string): Promise<DoorayTask>;
    /**
     * 태스크 목록 조회 (프로젝트별)
     */
    getTasks(projectId: string, options?: {
        status?: DoorayTask['status'];
        assigneeId?: string;
        limit?: number;
        offset?: number;
    }): Promise<DoorayTask[]>;
    /**
     * 태스크 업데이트
     */
    updateTask(projectId: string, taskId: string, update: DoorayTaskUpdate): Promise<DoorayTask>;
    /**
     * 태스크에 댓글 추가
     */
    addComment(projectId: string, taskId: string, comment: DoorayCommentCreate): Promise<DoorayComment>;
    /**
     * 태스크 상태 변경
     */
    changeTaskStatus(projectId: string, taskId: string, status: DoorayTask['status']): Promise<DoorayTask>;
    /**
     * 태스크 분석 (AI 기반)
     */
    analyzeTask(projectId: string, taskId: string): Promise<TaskAnalysis>;
    /**
     * 태스크에서 요구사항 추출
     */
    private extractRequirements;
    /**
     * 기술 사양 추출
     */
    private extractTechnicalSpecs;
    /**
     * 승인 기준 추출
     */
    private extractAcceptanceCriteria;
    /**
     * 제안된 접근 방식 생성
     */
    private generateSuggestedApproach;
    /**
     * 복잡도 추정
     */
    private estimateComplexity;
    /**
     * 추천 언어
     */
    private recommendLanguage;
    /**
     * 추천 프레임워크
     */
    private recommendFramework;
}
//# sourceMappingURL=client.d.ts.map