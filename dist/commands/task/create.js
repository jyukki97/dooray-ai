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
exports.createTaskCommand = void 0;
const commander_1 = require("commander");
const logger_1 = require("../../utils/logger");
const validators_1 = require("../../validators");
const input_1 = require("../../utils/input");
const errors_1 = require("../../utils/errors");
// inquirer는 ES Module이므로 dynamic import 사용
exports.createTaskCommand = new commander_1.Command('create')
    .description('Create a new task and corresponding branch')
    .argument('[description]', 'Task description')
    .option('-b, --branch <name>', 'Custom branch name')
    .option('-p, --priority <level>', 'Task priority (low, medium, high)', 'medium')
    .option('--no-branch', 'Do not create a branch')
    .action(async (description, options) => {
    try {
        logger_1.logger.progress('Creating new task...');
        let taskDescription = description;
        // 설명이 없으면 사용자에게 입력 요청
        if (!taskDescription) {
            const inquirer = await Promise.resolve().then(() => __importStar(require('inquirer')));
            const { desc } = await inquirer.default.prompt([
                {
                    type: 'input',
                    name: 'desc',
                    message: 'Enter task description:',
                    validate: (input) => {
                        const validator = (0, validators_1.createStringValidator)('Task description')
                            .required()
                            .minLength(3)
                            .maxLength(200);
                        const result = validator.validate(input);
                        return result.isValid || result.errors[0];
                    }
                }
            ]);
            taskDescription = desc;
        }
        else {
            // 직접 입력된 description 검증
            const validator = (0, validators_1.createStringValidator)('Task description')
                .required()
                .minLength(3)
                .maxLength(200);
            const result = validator.validate(taskDescription);
            if (!result.isValid) {
                throw (0, errors_1.createValidationError)(result.errors[0] || 'Validation failed', 'description', taskDescription);
            }
            taskDescription = result.value;
        }
        // 우선순위 검증
        const priority = (0, input_1.getOptionValue)(options, 'priority', 'medium');
        const priorityValidator = (0, validators_1.createStringValidator)('Priority')
            .oneOf(['low', 'medium', 'high']);
        const priorityResult = priorityValidator.validate(priority);
        if (!priorityResult.isValid) {
            throw (0, errors_1.createValidationError)(priorityResult.errors[0] || 'Validation failed', 'priority', priority);
        }
        // 브랜치 이름 검증 및 생성
        let branchName = (0, input_1.getOptionValue)(options, 'branch');
        if (!branchName && options.branch !== false && taskDescription) {
            // 안전한 브랜치 이름 생성
            branchName = (0, input_1.sanitizeInput)(taskDescription)
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 50);
            branchName = `feature/${branchName}`;
        }
        // 브랜치 이름이 있으면 검증
        if (branchName) {
            const branchValidator = (0, validators_1.createStringValidator)('Branch name')
                .pattern(/^[a-zA-Z0-9/_-]+$/, 'Branch name can only contain letters, numbers, slashes, hyphens, and underscores');
            const branchResult = branchValidator.validate(branchName);
            if (!branchResult.isValid) {
                throw (0, errors_1.createValidationError)(branchResult.errors[0] || 'Validation failed', 'branch', branchName);
            }
        }
        logger_1.logger.info(`Task Description: ${taskDescription}`);
        logger_1.logger.info(`Priority: ${priorityResult.value}`);
        if (branchName) {
            logger_1.logger.info(`Branch Name: ${branchName}`);
        }
        // TODO: 실제 Dooray! API 호출 및 Git 브랜치 생성
        logger_1.logger.warn('Task creation implementation coming soon!');
        logger_1.logger.success('Task structure prepared! 🎯');
    }
    catch (error) {
        if (error instanceof Error && 'code' in error) {
            // DoorayAIError 처리
            logger_1.logger.error(error.toUserString());
        }
        else {
            logger_1.logger.error(`Task creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        process.exit(1);
    }
});
//# sourceMappingURL=create.js.map