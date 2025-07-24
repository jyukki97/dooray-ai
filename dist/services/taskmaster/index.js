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
exports.TaskMasterManager = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const claude_code_client_1 = require("../ai/claude-code-client");
const logger_1 = require("../../utils/logger");
/**
 * TaskMaster 시스템과 Claude Code 통합 관리자
 */
class TaskMasterManager {
    constructor(projectRoot = process.cwd()) {
        this.taskmasterDir = path.join(projectRoot, '.taskmaster');
        this.configPath = path.join(this.taskmasterDir, 'config.json');
        this.statePath = path.join(this.taskmasterDir, 'state.json');
        this.tasksPath = path.join(this.taskmasterDir, 'tasks', 'tasks.json');
        this.claudeClient = new claude_code_client_1.ClaudeCodeClient();
    }
    /**
     * TaskMaster 시스템 초기화
     */
    async initialize() {
        try {
            // .taskmaster 디렉토리 생성
            await fs.ensureDir(this.taskmasterDir);
            await fs.ensureDir(path.join(this.taskmasterDir, 'tasks'));
            await fs.ensureDir(path.join(this.taskmasterDir, 'templates'));
            await fs.ensureDir(path.join(this.taskmasterDir, 'docs'));
            // 설정 파일이 없으면 기본 설정 생성
            if (!await fs.pathExists(this.configPath)) {
                await this.createDefaultConfig();
            }
            // 상태 파일이 없으면 기본 상태 생성
            if (!await fs.pathExists(this.statePath)) {
                await this.createDefaultState();
            }
            // 태스크 파일이 없으면 기본 태스크 생성
            if (!await fs.pathExists(this.tasksPath)) {
                await this.createDefaultTasks();
            }
            logger_1.logger.info('TaskMaster system initialized successfully');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`Failed to initialize TaskMaster: ${errorMessage}`);
            throw error;
        }
    }
    /**
     * 기본 설정 파일 생성
     */
    async createDefaultConfig() {
        const defaultConfig = {
            models: {
                main: {
                    provider: "claude-code",
                    modelId: "sonnet",
                    maxTokens: 64000,
                    temperature: 0.2
                },
                research: {
                    provider: "claude-code",
                    modelId: "sonnet",
                    maxTokens: 8700,
                    temperature: 0.1
                },
                fallback: {
                    provider: "claude-code",
                    modelId: "sonnet",
                    maxTokens: 120000,
                    temperature: 0.2
                }
            },
            global: {
                logLevel: "info",
                debug: false,
                defaultNumTasks: 10,
                defaultSubtasks: 5,
                defaultPriority: "medium",
                projectName: "Claude Code TaskMaster",
                responseLanguage: "korean",
                defaultTag: "master",
                userId: "claude-code-user"
            },
            claudeCode: {}
        };
        await fs.writeJSON(this.configPath, defaultConfig, { spaces: 2 });
        logger_1.logger.info('Created default TaskMaster config');
    }
    /**
     * 기본 상태 파일 생성
     */
    async createDefaultState() {
        const defaultState = {
            currentTag: "master",
            lastSwitched: new Date().toISOString(),
            branchTagMapping: {},
            migrationNoticeShown: true
        };
        await fs.writeJSON(this.statePath, defaultState, { spaces: 2 });
        logger_1.logger.info('Created default TaskMaster state');
    }
    /**
     * 기본 태스크 파일 생성
     */
    async createDefaultTasks() {
        const defaultTasks = {
            master: {
                tasks: [
                    {
                        id: 1,
                        title: "Claude Code 통합 설정",
                        description: "Claude Code CLI를 활용한 TaskMaster 시스템 설정 및 통합",
                        status: "done",
                        priority: "high",
                        dependencies: [],
                        details: "- Claude Code CLI 설치 확인\n- TaskMaster 설정 파일 생성\n- 기본 태스크 구조 설정\n- Claude Code 클라이언트 연동",
                        testStrategy: "Claude Code CLI가 정상적으로 작동하고 기본 태스크가 생성되는지 확인",
                        subtasks: []
                    }
                ],
                metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: "1.0.0",
                    created: new Date().toISOString(),
                    description: "Claude Code TaskMaster integration tasks",
                    updated: new Date().toISOString()
                }
            }
        };
        await fs.writeJSON(this.tasksPath, defaultTasks, { spaces: 2 });
        logger_1.logger.info('Created default TaskMaster tasks');
    }
    /**
     * 설정 로드
     */
    async loadConfig() {
        try {
            return await fs.readJSON(this.configPath);
        }
        catch (error) {
            logger_1.logger.error('Failed to load TaskMaster config');
            throw error;
        }
    }
    /**
     * 상태 로드
     */
    async loadState() {
        try {
            return await fs.readJSON(this.statePath);
        }
        catch (error) {
            logger_1.logger.error('Failed to load TaskMaster state');
            throw error;
        }
    }
    /**
     * 태스크 로드
     */
    async loadTasks(tag = 'master') {
        try {
            const allTasks = await fs.readJSON(this.tasksPath);
            return allTasks[tag] || { tasks: [], metadata: {} };
        }
        catch (error) {
            logger_1.logger.error(`Failed to load tasks for tag: ${tag}`);
            throw error;
        }
    }
    /**
     * 새 태스크 생성 (Claude Code로 생성)
     */
    async createTaskWithAI(description, tag = 'master') {
        try {
            logger_1.logger.info(`Creating new task with AI: ${description}`);
            // Claude Code를 사용해 태스크 세부사항 생성
            const response = await this.claudeClient.generateCode({
                prompt: `Create a detailed software development task based on this description: "${description}". Include:
        - A clear title
        - Detailed description
        - Implementation details
        - Test strategy
        - Estimated priority (low/medium/high)
        
        Format the response as a structured task definition.`,
                language: 'json',
                maxTokens: 1000,
                context: 'TaskMaster task generation for software development project'
            });
            // 현재 태스크들 로드
            const currentTasks = await this.loadTasks(tag);
            const nextId = Math.max(...currentTasks.tasks.map(t => t.id), 0) + 1;
            // 새 태스크 생성
            const newTask = {
                id: nextId,
                title: description,
                description: `AI-generated task: ${description}`,
                status: 'pending',
                priority: 'medium',
                dependencies: [],
                details: response.explanation || response.code,
                testStrategy: response.suggestions?.join('\n') || 'Verify implementation meets requirements',
                subtasks: []
            };
            // 태스크 저장
            await this.addTask(newTask, tag);
            logger_1.logger.success(`Created new task: ${newTask.title}`);
            return newTask;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`Failed to create task with AI: ${errorMessage}`);
            throw error;
        }
    }
    /**
     * 태스크 추가
     */
    async addTask(task, tag = 'master') {
        try {
            const allTasks = await fs.readJSON(this.tasksPath);
            if (!allTasks[tag]) {
                allTasks[tag] = {
                    tasks: [],
                    metadata: {
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        version: "1.0.0",
                        created: new Date().toISOString(),
                        description: `Tasks for ${tag} context`,
                        updated: new Date().toISOString()
                    }
                };
            }
            allTasks[tag].tasks.push(task);
            allTasks[tag].metadata.updated = new Date().toISOString();
            await fs.writeJSON(this.tasksPath, allTasks, { spaces: 2 });
            logger_1.logger.info(`Added task to ${tag}: ${task.title}`);
        }
        catch (error) {
            logger_1.logger.error('Failed to add task');
            throw error;
        }
    }
    /**
     * 태스크 상태 업데이트
     */
    async updateTaskStatus(taskId, status, tag = 'master') {
        try {
            const allTasks = await fs.readJSON(this.tasksPath);
            if (!allTasks[tag]) {
                throw new Error(`Tag ${tag} not found`);
            }
            const task = allTasks[tag].tasks.find((t) => t.id === taskId);
            if (!task) {
                throw new Error(`Task ${taskId} not found in ${tag}`);
            }
            task.status = status;
            allTasks[tag].metadata.updated = new Date().toISOString();
            await fs.writeJSON(this.tasksPath, allTasks, { spaces: 2 });
            logger_1.logger.info(`Updated task ${taskId} status to ${status}`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to update task status: ${error}`);
            throw error;
        }
    }
    /**
     * 프로젝트 분석 및 태스크 생성
     */
    async analyzeProjectAndGenerateTasks(projectPath) {
        try {
            logger_1.logger.info('Analyzing project and generating tasks...');
            // 프로젝트 구조 분석
            const packageJsonPath = path.join(projectPath, 'package.json');
            let projectInfo = '';
            if (await fs.pathExists(packageJsonPath)) {
                const packageJson = await fs.readJSON(packageJsonPath);
                projectInfo = `Project: ${packageJson.name || 'Unknown'}\nDescription: ${packageJson.description || 'No description'}\nDependencies: ${Object.keys(packageJson.dependencies || {}).join(', ')}`;
            }
            // Claude Code로 태스크 분석 및 생성
            const response = await this.claudeClient.generateCode({
                prompt: `Analyze this project and suggest 5-10 development tasks:\n\n${projectInfo}\n\nGenerate tasks for:
        - Code improvements
        - Testing enhancements
        - Documentation updates
        - Performance optimizations
        - Security improvements
        
        Format each task with title, description, priority, and implementation details.`,
                language: 'json',
                maxTokens: 2000,
                context: 'Project analysis for task generation'
            });
            // 생성된 태스크들을 파싱하고 저장
            const generatedTasks = [];
            const currentTasks = await this.loadTasks();
            let nextId = Math.max(...currentTasks.tasks.map(t => t.id), 0) + 1;
            // 응답을 파싱해서 태스크 생성 (간단한 구현)
            const taskLines = response.code.split('\n').filter(line => line.trim().startsWith('-'));
            for (const line of taskLines.slice(0, 8)) { // 최대 8개 태스크
                const taskTitle = line.replace(/^-\s*/, '').trim();
                if (taskTitle) {
                    const newTask = {
                        id: nextId++,
                        title: taskTitle,
                        description: `AI-generated task: ${taskTitle}`,
                        status: 'pending',
                        priority: 'medium',
                        dependencies: [],
                        details: response.explanation || 'Generated from project analysis',
                        testStrategy: 'Verify implementation and run tests',
                        subtasks: []
                    };
                    generatedTasks.push(newTask);
                    await this.addTask(newTask);
                }
            }
            logger_1.logger.success(`Generated ${generatedTasks.length} tasks from project analysis`);
            return generatedTasks;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`Failed to analyze project: ${errorMessage}`);
            throw error;
        }
    }
    /**
     * TaskMaster 상태 정보 표시
     */
    async displayStatus() {
        try {
            const config = await this.loadConfig();
            const state = await this.loadState();
            const tasks = await this.loadTasks(state.currentTag);
            console.log('\n🎯 TaskMaster Status');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`📁 Project: ${config.global.projectName}`);
            console.log(`🏷️  Current Tag: ${state.currentTag}`);
            console.log(`🤖 AI Provider: ${config.models.main.provider}`);
            console.log(`📊 Total Tasks: ${tasks.tasks.length}`);
            const statusCounts = tasks.tasks.reduce((acc, task) => {
                acc[task.status] = (acc[task.status] || 0) + 1;
                return acc;
            }, {});
            console.log('\n📈 Task Status Summary:');
            Object.entries(statusCounts).forEach(([status, count]) => {
                const emoji = status === 'done' ? '✅' : status === 'in-progress' ? '🔄' : status === 'blocked' ? '🚫' : '⏳';
                console.log(`   ${emoji} ${status}: ${count}`);
            });
            console.log('\n📋 Recent Tasks:');
            tasks.tasks.slice(-5).forEach(task => {
                const statusEmoji = task.status === 'done' ? '✅' : task.status === 'in-progress' ? '🔄' : '⏳';
                console.log(`   ${statusEmoji} #${task.id}: ${task.title}`);
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to display TaskMaster status');
            throw error;
        }
    }
}
exports.TaskMasterManager = TaskMasterManager;
//# sourceMappingURL=index.js.map