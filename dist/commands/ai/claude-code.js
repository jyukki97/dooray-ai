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
exports.claudeCodeCommand = void 0;
const commander_1 = require("commander");
const logger_1 = require("../../utils/logger");
const claude_code_client_1 = require("../../services/ai/claude-code-client");
const code_generator_1 = require("../../services/ai/code-generator");
const types_1 = require("../../services/ai/types");
/**
 * Claude Code 코드 생성 명령어 (API 키 불필요)
 */
exports.claudeCodeCommand = new commander_1.Command('generate')
    .alias('gen')
    .description('Generate code using Claude Code CLI (no API key required)')
    .argument('<description>', 'Description of what code to generate')
    .option('--language <lang>', 'Programming language (e.g., typescript, python, javascript)', 'typescript')
    .option('--context <context>', 'Additional context for code generation')
    .option('--framework <framework>', 'Framework to use (e.g., react, express, fastapi)')
    .option('--style <style>', 'Code style (functional, object-oriented, mixed)', 'mixed')
    .option('--tests', 'Include test files')
    .option('--comments', 'Include detailed comments')
    .option('--project <type>', 'Generate full project (web-app, api, cli, library)')
    .option('--improve <file>', 'Improve existing code file')
    .option('--improvement-type <type>', 'Type of improvement (optimization, refactoring, security, testing, documentation)', 'refactoring')
    .option('--analyze <file>', 'Analyze an existing code file')
    .option('--validate', 'Validate Claude Code CLI availability first')
    .option('--output <file>', 'Save generated code to file')
    .option('--output-dir <dir>', 'Output directory for multiple files')
    .action(async (description, options) => {
    try {
        const client = new claude_code_client_1.ClaudeCodeClient();
        // Claude Code CLI 검증
        if (options.validate) {
            logger_1.logger.info('🔍 Validating Claude Code CLI availability...');
            const isValid = await client.validateConnection();
            if (!isValid) {
                logger_1.logger.error('❌ Claude Code CLI is not available');
                logger_1.logger.info('Please install Claude Code CLI from: https://claude.ai/cli');
                process.exit(1);
            }
            logger_1.logger.success('✅ Claude Code CLI is available');
        }
        // 코드 개선 모드
        if (options.improve) {
            logger_1.logger.info(`🔧 Improving code file: ${options.improve}`);
            const result = await code_generator_1.codeGenerator.improveCode(options.improve, options.improvementType, {
                language: options.language,
                context: options.context,
                includeComments: options.comments,
                includeTests: options.tests
            });
            await displayEnhancedResult(result, options);
            return;
        }
        // 프로젝트 생성 모드
        if (options.project) {
            logger_1.logger.info(`🏗️ Generating ${options.project} project: "${description}"`);
            const result = await code_generator_1.codeGenerator.generateProject(description, options.project, {
                language: options.language,
                framework: options.framework,
                style: options.style,
                includeTests: options.tests,
                includeComments: options.comments,
                context: options.context
            });
            await displayEnhancedResult(result, options);
            return;
        }
        // 파일 분석 모드
        if (options.analyze) {
            logger_1.logger.info(`🔍 Analyzing code file: ${options.analyze}`);
            const result = await client.analyzeCodeFile(options.analyze, description);
            console.log('\n📝 Analysis Results:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            if (result.code) {
                console.log('\n💻 Improved Code:');
                console.log('```' + options.language);
                console.log(result.code);
                console.log('```');
            }
            if (result.explanation) {
                console.log('\n💡 Analysis:');
                console.log(result.explanation);
            }
            if (result.suggestions && result.suggestions.length > 0) {
                console.log('\n✨ Suggestions:');
                result.suggestions.forEach((suggestion, index) => {
                    console.log(`${index + 1}. ${suggestion}`);
                });
            }
            // 출력 파일 저장
            if (options.output && result.code) {
                const fs = await Promise.resolve().then(() => __importStar(require('fs-extra')));
                await fs.writeFile(options.output, result.code);
                logger_1.logger.success(`💾 Code saved to: ${options.output}`);
            }
            return;
        }
        // 기본 코드 생성 모드
        logger_1.logger.info(`🎨 Generating ${options.language} code: "${description}"`);
        const result = await code_generator_1.codeGenerator.generateCode(description, {
            language: options.language,
            context: options.context,
            framework: options.framework,
            style: options.style,
            includeTests: options.tests,
            includeComments: options.comments
        });
        await displayEnhancedResult(result, options);
    }
    catch (error) {
        if (error instanceof types_1.AIError) {
            logger_1.logger.error(`AI Error [${error.code}]: ${error.message}`);
            if (error.requestId) {
                logger_1.logger.error(`Request ID: ${error.requestId}`);
            }
        }
        else {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`Code generation failed: ${errorMessage}`);
        }
        process.exit(1);
    }
});
// 사용 예제를 위한 도움말 확장
exports.claudeCodeCommand.addHelpText('after', `

Examples:
  $ dooray-ai ai generate "create a REST API endpoint for user authentication"
  $ dooray-ai ai gen "implement binary search algorithm" --language python
  $ dooray-ai ai generate "add error handling" --analyze ./src/utils/api.ts
  $ dooray-ai ai gen "create React component" --context "uses TypeScript and styled-components" --output ./components/Button.tsx

Features:
  • Code generation in any programming language
  • File analysis and improvement suggestions  
  • Context-aware generation
  • Save output directly to files
  • No API key required - uses Claude Code CLI

Requirements:
  • Claude Code CLI must be installed and available in PATH
  • Install from: https://claude.ai/cli
`);
/**
 * 향상된 결과 표시
 */
async function displayEnhancedResult(result, options) {
    console.log('\n🚀 Generated Code:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    // 메인 코드 표시
    if (result.files && result.files.length > 0) {
        for (const file of result.files) {
            console.log(`\n📄 ${file.path} (${file.type}):`);
            console.log('```' + result.language);
            console.log(file.content);
            console.log('```');
        }
    }
    else {
        console.log('```' + result.language);
        console.log(result.code);
        console.log('```');
    }
    // 설명 표시
    if (result.explanation) {
        console.log('\n💡 Explanation:');
        console.log(result.explanation);
    }
    // 제안사항 표시
    if (result.suggestions && result.suggestions.length > 0) {
        console.log('\n✨ Suggestions:');
        result.suggestions.forEach((suggestion, index) => {
            console.log(`${index + 1}. ${suggestion}`);
        });
    }
    // 종속성 표시
    if (result.dependencies && result.dependencies.length > 0) {
        console.log('\n📦 Dependencies:');
        result.dependencies.forEach((dep) => {
            console.log(`   • ${dep}`);
        });
    }
    // 파일 저장
    if (options.output || options.outputDir) {
        const fs = await Promise.resolve().then(() => __importStar(require('fs-extra')));
        const path = await Promise.resolve().then(() => __importStar(require('path')));
        if (options.outputDir && result.files) {
            // 여러 파일을 디렉토리에 저장
            await fs.ensureDir(options.outputDir);
            for (const file of result.files) {
                const filePath = path.join(options.outputDir, file.path);
                await fs.ensureDir(path.dirname(filePath));
                await fs.writeFile(filePath, file.content);
                logger_1.logger.success(`💾 ${file.type} file saved: ${filePath}`);
            }
        }
        else if (options.output) {
            // 단일 파일 저장
            const content = result.files && result.files.length > 0
                ? result.files[0].content
                : result.code;
            await fs.writeFile(options.output, content);
            logger_1.logger.success(`💾 Code saved to: ${options.output}`);
        }
    }
    // 통계 표시
    console.log('\n📊 Generation Stats:');
    console.log(`⏱️  Response Time: ${result.metadata.responseTime}ms`);
    console.log(`🔤 Tokens Used: ${result.metadata.tokensUsed || 'N/A'}`);
    console.log(`🏷️  Language: ${result.language}`);
    if (result.framework) {
        console.log(`⚡ Framework: ${result.framework}`);
    }
    console.log(`💰 Cost: Free (Claude Code CLI)`);
}
//# sourceMappingURL=claude-code.js.map