"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskCommand = void 0;
const commander_1 = require("commander");
const logger_1 = require("../../utils/logger");
exports.updateTaskCommand = new commander_1.Command('update')
    .description('Update task status')
    .argument('<taskId>', 'Task ID to update')
    .option('-s, --status <status>', 'New status (working, done, hold)', 'working')
    .option('-c, --comment <comment>', 'Add comment')
    .action(async (taskId, options) => {
    try {
        logger_1.logger.progress(`Updating task ${taskId}...`);
        logger_1.logger.info(`Task ID: ${taskId}`);
        logger_1.logger.info(`New Status: ${options.status}`);
        if (options.comment) {
            logger_1.logger.info(`Comment: ${options.comment}`);
        }
        // TODO: 실제 Dooray! API 호출
        logger_1.logger.warn('Task update implementation coming soon!');
        logger_1.logger.success('Task update prepared! ✅');
    }
    catch (error) {
        logger_1.logger.error(`Task update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
});
//# sourceMappingURL=update.js.map