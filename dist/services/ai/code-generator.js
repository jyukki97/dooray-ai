"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeGenerator = exports.CodeGenerator = void 0;
const claude_code_client_1 = require("./claude-code-client");
const types_1 = require("./types");
const config_1 = require("../config");
const logger_1 = require("../../utils/logger");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
/**
 * 코드 생성 엔진
 */
class CodeGenerator {
    constructor() {
        this.client = new claude_code_client_1.ClaudeCodeClient();
    }
    /**
     * 기본 코드 생성
     */
    async generateCode(description, options = {}) {
        try {
            // 설정에서 기본값 로드
            const config = await config_1.configManager.load();
            const request = {
                prompt: this.buildPrompt(description, options),
                language: options.language || 'typescript',
                context: options.context,
                maxTokens: options.maxTokens || config.ai.maxTokens,
                temperature: options.temperature || config.ai.temperature
            };
            logger_1.logger.info(`Generating ${request.language} code: "${description}"`);
            const result = await this.client.generateCode(request);
            // 결과 향상
            const enhanced = {
                ...result,
                language: request.language || 'typescript',
                framework: options.framework,
                dependencies: this.extractDependencies(result.code, request.language),
                files: this.organizeCodeIntoFiles(result.code, description, request.language || 'typescript')
            };
            logger_1.logger.success('Code generation completed successfully');
            return enhanced;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`Code generation failed: ${errorMessage}`);
            throw new types_1.AIError(`Code generation failed: ${errorMessage}`, 'GENERATION_FAILED', this.client.engine);
        }
    }
    /**
     * 프로젝트 구조 생성
     */
    async generateProject(description, projectType, options = {}) {
        try {
            const projectPrompt = this.buildProjectPrompt(description, projectType, options);
            const request = {
                prompt: projectPrompt,
                language: options.language || 'typescript',
                context: `Creating a ${projectType} project: ${description}`,
                maxTokens: options.maxTokens || 4000,
                temperature: options.temperature || 0.7
            };
            logger_1.logger.info(`Generating ${projectType} project: "${description}"`);
            const result = await this.client.generateCode(request);
            // 프로젝트 파일 구조 생성
            const enhanced = {
                ...result,
                language: request.language || 'typescript',
                framework: options.framework,
                dependencies: this.extractDependencies(result.code, request.language),
                files: this.generateProjectFiles(result.code, projectType, request.language || 'typescript')
            };
            logger_1.logger.success('Project generation completed successfully');
            return enhanced;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`Project generation failed: ${errorMessage}`);
            throw error;
        }
    }
    /**
     * 기존 코드 개선
     */
    async improveCode(filePath, improvementType, options = {}) {
        try {
            // 파일 읽기
            if (!await fs.pathExists(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }
            const originalCode = await fs.readFile(filePath, 'utf-8');
            const language = this.detectLanguage(filePath);
            const improvementPrompt = this.buildImprovementPrompt(originalCode, improvementType, language, options);
            const request = {
                prompt: improvementPrompt,
                language: language,
                context: `Improving ${improvementType} for file: ${filePath}`,
                maxTokens: options.maxTokens || 3000,
                temperature: options.temperature || 0.5
            };
            logger_1.logger.info(`Improving code (${improvementType}): ${filePath}`);
            const result = await this.client.generateCode(request);
            const enhanced = {
                ...result,
                language: language,
                dependencies: this.extractDependencies(result.code, language),
                files: [{
                        path: filePath,
                        content: result.code,
                        type: 'main'
                    }]
            };
            logger_1.logger.success('Code improvement completed successfully');
            return enhanced;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`Code improvement failed: ${errorMessage}`);
            throw error;
        }
    }
    /**
     * 테스트 코드 생성
     */
    async generateTests(sourceFilePath, testFramework = 'jest', options = {}) {
        try {
            if (!await fs.pathExists(sourceFilePath)) {
                throw new Error(`Source file not found: ${sourceFilePath}`);
            }
            const sourceCode = await fs.readFile(sourceFilePath, 'utf-8');
            const language = this.detectLanguage(sourceFilePath);
            const testPrompt = this.buildTestPrompt(sourceCode, testFramework, language, options);
            const request = {
                prompt: testPrompt,
                language: language,
                context: `Generating ${testFramework} tests for: ${sourceFilePath}`,
                maxTokens: options.maxTokens || 2000,
                temperature: options.temperature || 0.3
            };
            logger_1.logger.info(`Generating ${testFramework} tests for: ${sourceFilePath}`);
            const result = await this.client.generateCode(request);
            // 테스트 파일 경로 생성
            const testFilePath = this.generateTestFilePath(sourceFilePath, language);
            const enhanced = {
                ...result,
                language: language,
                framework: testFramework,
                dependencies: this.extractTestDependencies(testFramework, language),
                files: [{
                        path: testFilePath,
                        content: result.code,
                        type: 'test'
                    }]
            };
            logger_1.logger.success('Test generation completed successfully');
            return enhanced;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`Test generation failed: ${errorMessage}`);
            throw error;
        }
    }
    /**
     * 프롬프트 구성
     */
    buildPrompt(description, options) {
        let prompt = `Generate ${options.language || 'TypeScript'} code for: ${description}\n\n`;
        if (options.framework) {
            prompt += `Framework: ${options.framework}\n`;
        }
        if (options.style) {
            prompt += `Code style: ${options.style}\n`;
        }
        if (options.includeComments) {
            prompt += `Include detailed comments and documentation.\n`;
        }
        if (options.includeTests) {
            prompt += `Include unit tests.\n`;
        }
        prompt += '\nRequirements:\n';
        prompt += '- Write clean, readable, and maintainable code\n';
        prompt += '- Follow best practices and conventions\n';
        prompt += '- Include proper error handling\n';
        prompt += '- Use TypeScript types if applicable\n';
        return prompt;
    }
    /**
     * 프로젝트 프롬프트 구성
     */
    buildProjectPrompt(description, projectType, options) {
        let prompt = `Create a complete ${projectType} project: ${description}\n\n`;
        prompt += `Language: ${options.language || 'TypeScript'}\n`;
        if (options.framework) {
            prompt += `Framework: ${options.framework}\n`;
        }
        prompt += '\nGenerate:\n';
        prompt += '- Main application code\n';
        prompt += '- Configuration files\n';
        prompt += '- Package.json with dependencies\n';
        prompt += '- README.md with setup instructions\n';
        if (options.includeTests) {
            prompt += '- Test files\n';
        }
        prompt += '\nRequirements:\n';
        prompt += '- Follow project structure best practices\n';
        prompt += '- Include proper error handling\n';
        prompt += '- Add comprehensive documentation\n';
        prompt += '- Use modern coding standards\n';
        return prompt;
    }
    /**
     * 개선 프롬프트 구성
     */
    buildImprovementPrompt(originalCode, improvementType, language, options) {
        let prompt = `Improve the following ${language} code focusing on ${improvementType}:\n\n`;
        prompt += '```' + language + '\n';
        prompt += originalCode + '\n';
        prompt += '```\n\n';
        switch (improvementType) {
            case 'optimization':
                prompt += 'Focus on:\n- Performance improvements\n- Memory efficiency\n- Algorithm optimization\n';
                break;
            case 'refactoring':
                prompt += 'Focus on:\n- Code structure and organization\n- Readability and maintainability\n- Design patterns\n';
                break;
            case 'security':
                prompt += 'Focus on:\n- Security vulnerabilities\n- Input validation\n- Safe coding practices\n';
                break;
            case 'testing':
                prompt += 'Focus on:\n- Adding comprehensive tests\n- Test coverage\n- Edge cases\n';
                break;
            case 'documentation':
                prompt += 'Focus on:\n- Code comments\n- Function documentation\n- Usage examples\n';
                break;
        }
        return prompt;
    }
    /**
     * 테스트 프롬프트 구성
     */
    buildTestPrompt(sourceCode, testFramework, language, options) {
        let prompt = `Generate comprehensive ${testFramework} tests for the following ${language} code:\n\n`;
        prompt += '```' + language + '\n';
        prompt += sourceCode + '\n';
        prompt += '```\n\n';
        prompt += 'Requirements:\n';
        prompt += `- Use ${testFramework} testing framework\n`;
        prompt += '- Test all public functions and methods\n';
        prompt += '- Include edge cases and error scenarios\n';
        prompt += '- Add setup and teardown if needed\n';
        prompt += '- Use descriptive test names\n';
        prompt += '- Aim for high test coverage\n';
        return prompt;
    }
    /**
     * 언어 감지
     */
    detectLanguage(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const languageMap = {
            '.ts': 'typescript',
            '.js': 'javascript',
            '.py': 'python',
            '.java': 'java',
            '.cpp': 'cpp',
            '.c': 'c',
            '.cs': 'csharp',
            '.go': 'go',
            '.rs': 'rust',
            '.php': 'php',
            '.rb': 'ruby',
            '.swift': 'swift'
        };
        return languageMap[ext] || 'text';
    }
    /**
     * 종속성 추출
     */
    extractDependencies(code, language) {
        const dependencies = [];
        // TypeScript/JavaScript 종속성
        if (language === 'typescript' || language === 'javascript') {
            const importMatches = code.match(/import.*from\s+['"]([^'"]+)['"]/g);
            if (importMatches) {
                for (const match of importMatches) {
                    const depMatch = match.match(/from\s+['"]([^'"]+)['"]/);
                    if (depMatch && !depMatch[1].startsWith('.')) {
                        dependencies.push(depMatch[1]);
                    }
                }
            }
            const requireMatches = code.match(/require\(['"]([^'"]+)['"]\)/g);
            if (requireMatches) {
                for (const match of requireMatches) {
                    const depMatch = match.match(/require\(['"]([^'"]+)['"]\)/);
                    if (depMatch && !depMatch[1].startsWith('.')) {
                        dependencies.push(depMatch[1]);
                    }
                }
            }
        }
        // Python 종속성
        if (language === 'python') {
            const importMatches = code.match(/^import\s+(\w+)/gm);
            if (importMatches) {
                for (const match of importMatches) {
                    const depMatch = match.match(/import\s+(\w+)/);
                    if (depMatch) {
                        dependencies.push(depMatch[1]);
                    }
                }
            }
            const fromMatches = code.match(/^from\s+(\w+)\s+import/gm);
            if (fromMatches) {
                for (const match of fromMatches) {
                    const depMatch = match.match(/from\s+(\w+)/);
                    if (depMatch) {
                        dependencies.push(depMatch[1]);
                    }
                }
            }
        }
        return [...new Set(dependencies)]; // 중복 제거
    }
    /**
     * 테스트 종속성 추출
     */
    extractTestDependencies(framework, language) {
        const dependencies = [];
        if (language === 'typescript' || language === 'javascript') {
            switch (framework) {
                case 'jest':
                    dependencies.push('jest', '@types/jest');
                    break;
                case 'mocha':
                    dependencies.push('mocha', 'chai', '@types/mocha', '@types/chai');
                    break;
                case 'vitest':
                    dependencies.push('vitest');
                    break;
            }
        }
        else if (language === 'python') {
            if (framework === 'pytest') {
                dependencies.push('pytest');
            }
        }
        return dependencies;
    }
    /**
     * 코드를 파일로 구성
     */
    organizeCodeIntoFiles(code, description, language) {
        const files = [];
        // 메인 코드 파일
        const ext = this.getFileExtension(language);
        const mainFileName = this.generateFileName(description, ext);
        files.push({
            path: mainFileName,
            content: code,
            type: 'main'
        });
        return files;
    }
    /**
     * 프로젝트 파일 생성
     */
    generateProjectFiles(code, projectType, language) {
        const files = [];
        // 메인 파일
        const ext = this.getFileExtension(language);
        files.push({
            path: `src/index${ext}`,
            content: code,
            type: 'main'
        });
        return files;
    }
    /**
     * 파일 확장자 가져오기
     */
    getFileExtension(language) {
        const extensionMap = {
            'typescript': '.ts',
            'javascript': '.js',
            'python': '.py',
            'java': '.java',
            'cpp': '.cpp',
            'c': '.c',
            'csharp': '.cs',
            'go': '.go',
            'rust': '.rs',
            'php': '.php',
            'ruby': '.rb',
            'swift': '.swift'
        };
        return extensionMap[language] || '.txt';
    }
    /**
     * 파일 이름 생성
     */
    generateFileName(description, extension) {
        const cleanName = description
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
        return `${cleanName}${extension}`;
    }
    /**
     * 테스트 파일 경로 생성
     */
    generateTestFilePath(sourceFilePath, language) {
        const dir = path.dirname(sourceFilePath);
        const name = path.basename(sourceFilePath, path.extname(sourceFilePath));
        const ext = this.getFileExtension(language);
        // 테스트 디렉토리가 있으면 사용, 없으면 같은 디렉토리에 생성
        const testDir = path.join(dir, '__tests__');
        return path.join(testDir, `${name}.test${ext}`);
    }
}
exports.CodeGenerator = CodeGenerator;
/**
 * 글로벌 코드 생성기 인스턴스
 */
exports.codeGenerator = new CodeGenerator();
//# sourceMappingURL=code-generator.js.map