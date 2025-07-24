"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskmasterCommand = void 0;
const commander_1 = require("commander");
const logger_1 = require("../utils/logger");
const taskmaster_1 = require("../services/taskmaster");
/**
 * TaskMaster 관련 명령어
 */
exports.taskmasterCommand = new commander_1.Command('taskmaster')
    .alias('tm')
    .description('TaskMaster integration commands (Claude Code based)')
    .option('--init', 'Initialize TaskMaster system')
    .option('--status', 'Show TaskMaster status')
    .option('--create <description>', 'Create new task with AI assistance')
    .option('--update <id> <status>', 'Update task status (pending|in-progress|done|blocked)')
    .option('--list [tag]', 'List tasks for tag (default: master)')
    .option('--analyze', 'Analyze project and generate tasks')
    .option('--tag <name>', 'Specify tag/context (default: master)')
    .action(async (options) => {
    try {
        const projectRoot = process.cwd();
        const taskMaster = new taskmaster_1.TaskMasterManager(projectRoot);
        const tag = options.tag || 'master';
        // TaskMaster 시스템 초기화
        if (options.init) {
            logger_1.logger.info('🚀 Initializing TaskMaster system...');
            await taskMaster.initialize();
            logger_1.logger.success('✅ TaskMaster system initialized successfully!');
            // 초기화 후 상태 표시
            await taskMaster.displayStatus();
            return;
        }
        // 상태 표시
        if (options.status) {
            await taskMaster.displayStatus();
            return;
        }
        // 새 태스크 생성
        if (options.create) {
            logger_1.logger.info(`🎯 Creating new task: "${options.create}"`);
            try {
                // TaskMaster 시스템이 없으면 먼저 초기화
                try {
                    await taskMaster.loadConfig();
                }
                catch (error) {
                    logger_1.logger.info('TaskMaster not initialized, initializing now...');
                    await taskMaster.initialize();
                }
                const newTask = await taskMaster.createTaskWithAI(options.create, tag);
                logger_1.logger.success(`✅ Created task #${newTask.id}: ${newTask.title}`);
                console.log('\n📝 Task Details:');
                console.log(`   ID: ${newTask.id}`);
                console.log(`   Title: ${newTask.title}`);
                console.log(`   Description: ${newTask.description}`);
                console.log(`   Priority: ${newTask.priority}`);
                console.log(`   Status: ${newTask.status}`);
                if (newTask.details) {
                    console.log(`\n📋 Implementation Details:`);
                    console.log(newTask.details);
                }
                if (newTask.testStrategy) {
                    console.log(`\n🧪 Test Strategy:`);
                    console.log(newTask.testStrategy);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                logger_1.logger.error(`Failed to create task: ${errorMessage}`);
                process.exit(1);
            }
            return;
        }
        // 태스크 상태 업데이트
        if (options.update) {
            const [taskIdStr, newStatus] = options.update.split(' ');
            const taskId = parseInt(taskIdStr);
            if (!taskId || !newStatus) {
                logger_1.logger.error('Invalid update format. Use: --update <id> <status>');
                process.exit(1);
            }
            const validStatuses = ['pending', 'in-progress', 'done', 'blocked'];
            if (!validStatuses.includes(newStatus)) {
                logger_1.logger.error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
                process.exit(1);
            }
            logger_1.logger.info(`🔄 Updating task #${taskId} to ${newStatus}...`);
            try {
                await taskMaster.updateTaskStatus(taskId, newStatus, tag);
                logger_1.logger.success(`✅ Updated task #${taskId} status to ${newStatus}`);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                logger_1.logger.error(`Failed to update task: ${errorMessage}`);
                process.exit(1);
            }
            return;
        }
        // 태스크 목록 표시
        if (options.list !== undefined) {
            const listTag = typeof options.list === 'string' ? options.list : tag;
            logger_1.logger.info(`📋 Tasks for tag: ${listTag}`);
            try {
                const tasks = await taskMaster.loadTasks(listTag);
                if (tasks.tasks.length === 0) {
                    logger_1.logger.info('No tasks found for this tag.');
                    return;
                }
                console.log('\n📝 Task List:');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                tasks.tasks.forEach(task => {
                    const statusEmoji = {
                        'pending': '⏳',
                        'in-progress': '🔄',
                        'done': '✅',
                        'blocked': '🚫'
                    }[task.status] || '❓';
                    const priorityEmoji = {
                        'low': '🟢',
                        'medium': '🟡',
                        'high': '🔴'
                    }[task.priority] || '⚪';
                    console.log(`${statusEmoji} #${task.id} [${priorityEmoji}] ${task.title}`);
                    console.log(`   📄 ${task.description}`);
                    if (task.dependencies.length > 0) {
                        console.log(`   🔗 Dependencies: ${task.dependencies.join(', ')}`);
                    }
                    if (task.subtasks && task.subtasks.length > 0) {
                        console.log(`   📦 Subtasks: ${task.subtasks.length}`);
                    }
                    console.log('');
                });
                // 메타데이터 표시
                if (tasks.metadata) {
                    console.log('📊 Metadata:');
                    console.log(`   Created: ${new Date(tasks.metadata.created).toLocaleString()}`);
                    console.log(`   Updated: ${new Date(tasks.metadata.updated).toLocaleString()}`);
                    console.log(`   Version: ${tasks.metadata.version}`);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                logger_1.logger.error(`Failed to list tasks: ${errorMessage}`);
                process.exit(1);
            }
            return;
        }
        // 프로젝트 분석 및 태스크 생성
        if (options.analyze) {
            logger_1.logger.info('🔍 Analyzing project and generating tasks...');
            try {
                // TaskMaster 시스템이 없으면 먼저 초기화
                try {
                    await taskMaster.loadConfig();
                }
                catch (error) {
                    logger_1.logger.info('TaskMaster not initialized, initializing now...');
                    await taskMaster.initialize();
                }
                const generatedTasks = await taskMaster.analyzeProjectAndGenerateTasks(projectRoot);
                logger_1.logger.success(`✅ Generated ${generatedTasks.length} tasks from project analysis`);
                console.log('\n📝 Generated Tasks:');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                generatedTasks.forEach(task => {
                    console.log(`🎯 #${task.id}: ${task.title}`);
                    console.log(`   📄 ${task.description}`);
                    console.log(`   🎚️ Priority: ${task.priority}`);
                    console.log('');
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                logger_1.logger.error(`Failed to analyze project: ${errorMessage}`);
                process.exit(1);
            }
            return;
        }
        // 기본 동작: 상태 표시
        logger_1.logger.info('🎯 TaskMaster - Claude Code Integration');
        logger_1.logger.info('');
        logger_1.logger.info('Available commands:');
        logger_1.logger.info('  --init                    Initialize TaskMaster system');
        logger_1.logger.info('  --status                  Show current status');
        logger_1.logger.info('  --create "description"    Create new task with AI');
        logger_1.logger.info('  --update <id> <status>    Update task status');
        logger_1.logger.info('  --list [tag]             List tasks');
        logger_1.logger.info('  --analyze                Analyze project and generate tasks');
        logger_1.logger.info('  --tag <name>             Specify tag/context');
        logger_1.logger.info('');
        logger_1.logger.info('Examples:');
        logger_1.logger.info('  dooray-ai taskmaster --init');
        logger_1.logger.info('  dooray-ai tm --create "Add user authentication"');
        logger_1.logger.info('  dooray-ai tm --update 1 in-progress');
        logger_1.logger.info('  dooray-ai tm --list');
        logger_1.logger.info('  dooray-ai tm --analyze');
        // 현재 상태가 있으면 표시
        try {
            await taskMaster.displayStatus();
        }
        catch (error) {
            logger_1.logger.info('\n💡 Run --init to initialize TaskMaster system');
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.logger.error(`TaskMaster command failed: ${errorMessage}`);
        process.exit(1);
    }
});
// 도움말 확장
exports.taskmasterCommand.addHelpText('after', `

TaskMaster Integration:
  This command integrates with the original TaskMaster system using Claude Code
  instead of requiring an API key. All data is stored in the .taskmaster directory.

Features:
  • AI-powered task generation using Claude Code CLI
  • Compatible with existing TaskMaster file structure
  • No API key required - uses Claude Code directly
  • Project analysis and automatic task creation
  • Task status tracking and management

Requirements:
  • Claude Code CLI must be installed and available
  • Run 'dooray-ai ai claude-code --validate' to check CLI availability
`);
//# sourceMappingURL=taskmaster.js.map