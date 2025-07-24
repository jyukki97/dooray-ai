"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoorayClient = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../../utils/logger");
/**
 * Dooray API 클라이언트
 */
class DoorayClient {
    constructor(credentials, options = {}) {
        this.credentials = credentials;
        this.options = {
            timeout: 30000,
            retries: 3,
            baseUrl: 'https://api.dooray.com',
            ...options
        };
        this.client = axios_1.default.create({
            baseURL: this.credentials.baseUrl || this.options.baseUrl,
            timeout: this.options.timeout,
            headers: {
                'Authorization': `dooray-api ${this.credentials.apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        // 응답 인터셉터 설정
        this.client.interceptors.response.use((response) => response, (error) => {
            return Promise.reject(this.handleApiError(error));
        });
    }
    /**
     * API 오류 처리
     */
    handleApiError(error) {
        const doorayError = new Error();
        doorayError.name = 'DoorayError';
        if (error.response) {
            doorayError.statusCode = error.response.status;
            doorayError.code = `HTTP_${error.response.status}`;
            doorayError.message = error.response.data?.header?.resultMessage || error.message;
            doorayError.response = error.response.data;
        }
        else if (error.request) {
            doorayError.code = 'NETWORK_ERROR';
            doorayError.message = 'Network error: Unable to reach Dooray API';
        }
        else {
            doorayError.code = 'REQUEST_ERROR';
            doorayError.message = error.message;
        }
        logger_1.logger.error(`Dooray API Error [${doorayError.code}]: ${doorayError.message}`);
        return doorayError;
    }
    /**
     * API 응답 검증
     */
    validateResponse(response) {
        if (!response.header.isSuccessful) {
            const error = new Error();
            error.name = 'DoorayError';
            error.code = `API_${response.header.resultCode}`;
            error.message = response.header.resultMessage;
            throw error;
        }
        return response.result;
    }
    /**
     * 연결 상태 확인
     */
    async validateConnection() {
        try {
            logger_1.logger.debug('Validating Dooray API connection...');
            await this.getProjects();
            logger_1.logger.success('Dooray API connection validated');
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`Dooray API connection failed: ${errorMessage}`);
            return false;
        }
    }
    /**
     * 프로젝트 목록 조회
     */
    async getProjects() {
        try {
            const response = await this.client.get('/v1/projects');
            return this.validateResponse(response.data);
        }
        catch (error) {
            logger_1.logger.error('Failed to fetch projects');
            throw error;
        }
    }
    /**
     * 특정 프로젝트 조회
     */
    async getProject(projectId) {
        try {
            const response = await this.client.get(`/v1/projects/${projectId}`);
            return this.validateResponse(response.data);
        }
        catch (error) {
            logger_1.logger.error(`Failed to fetch project: ${projectId}`);
            throw error;
        }
    }
    /**
     * 태스크 조회
     */
    async getTask(projectId, taskId) {
        try {
            logger_1.logger.info(`Fetching task: ${projectId}/${taskId}`);
            const response = await this.client.get(`/v1/projects/${projectId}/posts/${taskId}`);
            const task = this.validateResponse(response.data);
            logger_1.logger.success(`Task fetched successfully: ${task.subject}`);
            return task;
        }
        catch (error) {
            logger_1.logger.error(`Failed to fetch task: ${projectId}/${taskId}`);
            throw error;
        }
    }
    /**
     * 태스크 목록 조회 (프로젝트별)
     */
    async getTasks(projectId, options = {}) {
        try {
            const params = new URLSearchParams();
            if (options.status)
                params.append('status', options.status);
            if (options.assigneeId)
                params.append('assigneeId', options.assigneeId);
            if (options.limit)
                params.append('size', options.limit.toString());
            if (options.offset)
                params.append('page', Math.floor(options.offset / (options.limit || 20)).toString());
            const response = await this.client.get(`/v1/projects/${projectId}/posts?${params.toString()}`);
            return this.validateResponse(response.data);
        }
        catch (error) {
            logger_1.logger.error(`Failed to fetch tasks for project: ${projectId}`);
            throw error;
        }
    }
    /**
     * 태스크 업데이트
     */
    async updateTask(projectId, taskId, update) {
        try {
            logger_1.logger.info(`Updating task: ${projectId}/${taskId}`);
            const response = await this.client.put(`/v1/projects/${projectId}/posts/${taskId}`, update);
            const updatedTask = this.validateResponse(response.data);
            logger_1.logger.success(`Task updated successfully: ${updatedTask.subject}`);
            return updatedTask;
        }
        catch (error) {
            logger_1.logger.error(`Failed to update task: ${projectId}/${taskId}`);
            throw error;
        }
    }
    /**
     * 태스크에 댓글 추가
     */
    async addComment(projectId, taskId, comment) {
        try {
            logger_1.logger.info(`Adding comment to task: ${projectId}/${taskId}`);
            const response = await this.client.post(`/v1/projects/${projectId}/posts/${taskId}/comments`, comment);
            const newComment = this.validateResponse(response.data);
            logger_1.logger.success('Comment added successfully');
            return newComment;
        }
        catch (error) {
            logger_1.logger.error(`Failed to add comment to task: ${projectId}/${taskId}`);
            throw error;
        }
    }
    /**
     * 태스크 상태 변경
     */
    async changeTaskStatus(projectId, taskId, status) {
        return this.updateTask(projectId, taskId, { status });
    }
    /**
     * 태스크 분석 (AI 기반)
     */
    async analyzeTask(projectId, taskId) {
        try {
            const task = await this.getTask(projectId, taskId);
            // AI를 사용하여 태스크 내용 분석
            const analysis = {
                taskId: task.id,
                projectId: task.projectId,
                title: task.subject,
                description: task.body,
                requirements: this.extractRequirements(task.body),
                technicalSpecs: this.extractTechnicalSpecs(task.body),
                acceptanceCriteria: this.extractAcceptanceCriteria(task.body),
                suggestedApproach: this.generateSuggestedApproach(task),
                estimatedComplexity: this.estimateComplexity(task),
                recommendedLanguage: this.recommendLanguage(task),
                recommendedFramework: this.recommendFramework(task)
            };
            logger_1.logger.info(`Task analysis completed for: ${task.subject}`);
            return analysis;
        }
        catch (error) {
            logger_1.logger.error(`Failed to analyze task: ${projectId}/${taskId}`);
            throw error;
        }
    }
    /**
     * 태스크에서 요구사항 추출
     */
    extractRequirements(body) {
        const requirements = [];
        // 요구사항 키워드 패턴 매칭
        const patterns = [
            /요구사항[:\s]*([^\n]+)/gi,
            /필요[:\s]*([^\n]+)/gi,
            /구현[:\s]*([^\n]+)/gi,
            /- ([^\n]+)/g
        ];
        patterns.forEach(pattern => {
            const matches = body.matchAll(pattern);
            for (const match of matches) {
                if (match[1] && match[1].trim()) {
                    requirements.push(match[1].trim());
                }
            }
        });
        return [...new Set(requirements)];
    }
    /**
     * 기술 사양 추출
     */
    extractTechnicalSpecs(body) {
        const specs = [];
        // 기술 관련 키워드 검색
        const techKeywords = [
            'React', 'Vue', 'Angular', 'Node.js', 'Express', 'FastAPI',
            'TypeScript', 'JavaScript', 'Python', 'Java', 'Go',
            'MySQL', 'PostgreSQL', 'MongoDB', 'Redis',
            'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
            'REST API', 'GraphQL', 'WebSocket'
        ];
        techKeywords.forEach(keyword => {
            if (body.toLowerCase().includes(keyword.toLowerCase())) {
                specs.push(keyword);
            }
        });
        return specs;
    }
    /**
     * 승인 기준 추출
     */
    extractAcceptanceCriteria(body) {
        const criteria = [];
        const patterns = [
            /승인\s*기준[:\s]*([^\n]+)/gi,
            /완료\s*조건[:\s]*([^\n]+)/gi,
            /테스트[:\s]*([^\n]+)/gi
        ];
        patterns.forEach(pattern => {
            const matches = body.matchAll(pattern);
            for (const match of matches) {
                if (match[1] && match[1].trim()) {
                    criteria.push(match[1].trim());
                }
            }
        });
        return criteria;
    }
    /**
     * 제안된 접근 방식 생성
     */
    generateSuggestedApproach(task) {
        const body = task.body.toLowerCase();
        if (body.includes('api') || body.includes('backend')) {
            return 'Backend API 개발 접근 방식: RESTful API 설계 → 데이터 모델 정의 → 비즈니스 로직 구현 → 테스트 작성';
        }
        else if (body.includes('frontend') || body.includes('ui') || body.includes('화면')) {
            return 'Frontend 개발 접근 방식: UI/UX 설계 → 컴포넌트 구조 설계 → 상태 관리 구현 → 사용자 인터랙션 구현';
        }
        else if (body.includes('database') || body.includes('db')) {
            return 'Database 설계 접근 방식: 요구사항 분석 → ERD 설계 → 스키마 정의 → 인덱스 최적화';
        }
        return '일반적인 개발 접근 방식: 요구사항 분석 → 설계 → 구현 → 테스트 → 배포';
    }
    /**
     * 복잡도 추정
     */
    estimateComplexity(task) {
        const body = task.body.toLowerCase();
        const complexity_indicators = {
            high: ['integration', '통합', 'migration', '마이그레이션', 'architecture', '아키텍처', 'performance', '성능'],
            medium: ['api', 'database', 'authentication', '인증', 'validation', '검증'],
            low: ['fix', '수정', 'update', '업데이트', 'style', '스타일']
        };
        for (const [level, keywords] of Object.entries(complexity_indicators)) {
            if (keywords.some(keyword => body.includes(keyword))) {
                return level;
            }
        }
        // 길이 기반 추정
        if (task.body.length > 1000)
            return 'high';
        if (task.body.length > 300)
            return 'medium';
        return 'low';
    }
    /**
     * 추천 언어
     */
    recommendLanguage(task) {
        const body = task.body.toLowerCase();
        if (body.includes('typescript') || body.includes('react') || body.includes('node'))
            return 'typescript';
        if (body.includes('python') || body.includes('fastapi') || body.includes('django'))
            return 'python';
        if (body.includes('java') || body.includes('spring'))
            return 'java';
        if (body.includes('go') || body.includes('golang'))
            return 'go';
        return undefined;
    }
    /**
     * 추천 프레임워크
     */
    recommendFramework(task) {
        const body = task.body.toLowerCase();
        if (body.includes('react'))
            return 'react';
        if (body.includes('vue'))
            return 'vue';
        if (body.includes('angular'))
            return 'angular';
        if (body.includes('express'))
            return 'express';
        if (body.includes('fastapi'))
            return 'fastapi';
        if (body.includes('spring'))
            return 'spring';
        return undefined;
    }
}
exports.DoorayClient = DoorayClient;
//# sourceMappingURL=client.js.map