import { CodeGenerationResponse } from './types';
/**
 * 코드 생성 옵션
 */
export interface CodeGenerationOptions {
    language?: string;
    context?: string;
    framework?: string;
    style?: 'functional' | 'object-oriented' | 'mixed';
    includeTests?: boolean;
    includeComments?: boolean;
    maxTokens?: number;
    temperature?: number;
}
/**
 * 향상된 코드 생성 결과
 */
export interface EnhancedCodeGenerationResult extends CodeGenerationResponse {
    language: string;
    framework?: string;
    dependencies?: string[];
    files?: {
        path: string;
        content: string;
        type: 'main' | 'test' | 'config' | 'doc';
    }[];
}
/**
 * 코드 생성 엔진
 */
export declare class CodeGenerator {
    private client;
    constructor();
    /**
     * 기본 코드 생성
     */
    generateCode(description: string, options?: CodeGenerationOptions): Promise<EnhancedCodeGenerationResult>;
    /**
     * 프로젝트 구조 생성
     */
    generateProject(description: string, projectType: 'web-app' | 'api' | 'cli' | 'library', options?: CodeGenerationOptions): Promise<EnhancedCodeGenerationResult>;
    /**
     * 기존 코드 개선
     */
    improveCode(filePath: string, improvementType: 'optimization' | 'refactoring' | 'security' | 'testing' | 'documentation', options?: CodeGenerationOptions): Promise<EnhancedCodeGenerationResult>;
    /**
     * 테스트 코드 생성
     */
    generateTests(sourceFilePath: string, testFramework?: 'jest' | 'mocha' | 'vitest' | 'pytest', options?: CodeGenerationOptions): Promise<EnhancedCodeGenerationResult>;
    /**
     * 프롬프트 구성
     */
    private buildPrompt;
    /**
     * 프로젝트 프롬프트 구성
     */
    private buildProjectPrompt;
    /**
     * 개선 프롬프트 구성
     */
    private buildImprovementPrompt;
    /**
     * 테스트 프롬프트 구성
     */
    private buildTestPrompt;
    /**
     * 언어 감지
     */
    private detectLanguage;
    /**
     * 종속성 추출
     */
    private extractDependencies;
    /**
     * 테스트 종속성 추출
     */
    private extractTestDependencies;
    /**
     * 코드를 파일로 구성
     */
    private organizeCodeIntoFiles;
    /**
     * 프로젝트 파일 생성
     */
    private generateProjectFiles;
    /**
     * 파일 확장자 가져오기
     */
    private getFileExtension;
    /**
     * 파일 이름 생성
     */
    private generateFileName;
    /**
     * 테스트 파일 경로 생성
     */
    private generateTestFilePath;
}
/**
 * 글로벌 코드 생성기 인스턴스
 */
export declare const codeGenerator: CodeGenerator;
//# sourceMappingURL=code-generator.d.ts.map