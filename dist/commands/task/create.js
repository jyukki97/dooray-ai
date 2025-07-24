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
                    validate: (input) => input.trim().length > 0 || 'Description is required'
                }
            ]);
            taskDescription = desc;
        }
        // 브랜치 이름 생성 또는 사용자 입력
        let branchName = options.branch;
        if (!branchName && options.branch !== false && taskDescription) {
            branchName = taskDescription
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 50);
            branchName = `feature/${branchName}`;
        }
        logger_1.logger.info(`Task Description: ${taskDescription}`);
        logger_1.logger.info(`Priority: ${options.priority}`);
        if (branchName) {
            logger_1.logger.info(`Branch Name: ${branchName}`);
        }
        // TODO: 실제 Dooray! API 호출 및 Git 브랜치 생성
        logger_1.logger.warn('Task creation implementation coming soon!');
        logger_1.logger.success('Task structure prepared! 🎯');
    }
    catch (error) {
        logger_1.logger.error(`Task creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
});
//# sourceMappingURL=create.js.map