"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTaskCommand = void 0;
const commander_1 = require("commander");
const logger_1 = require("../../utils/logger");
exports.listTaskCommand = new commander_1.Command('list')
    .alias('ls')
    .description('List Dooray! tasks')
    .option('-s, --status <status>', 'Filter by status (open, closed, all)', 'open')
    .option('-a, --assignee <user>', 'Filter by assignee')
    .option('-l, --limit <number>', 'Limit number of results', '10')
    .action(async (options) => {
    try {
        logger_1.logger.progress('Fetching tasks from Dooray!...');
        logger_1.logger.info(`Status Filter: ${options.status}`);
        if (options.assignee) {
            logger_1.logger.info(`Assignee Filter: ${options.assignee}`);
        }
        logger_1.logger.info(`Limit: ${options.limit}`);
        // TODO: 실제 Dooray! API 호출
        logger_1.logger.warn('Task listing implementation coming soon!');
        logger_1.logger.success('Task query prepared! 📋');
    }
    catch (error) {
        logger_1.logger.error(`Task listing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
});
//# sourceMappingURL=list.js.map