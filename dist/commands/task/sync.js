"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncTaskCommand = void 0;
const commander_1 = require("commander");
const logger_1 = require("../../utils/logger");
exports.syncTaskCommand = new commander_1.Command('sync')
    .description('Sync with Dooray! tasks')
    .option('-f, --force', 'Force sync even if conflicts exist')
    .option('--dry-run', 'Show what would be synced without making changes')
    .action(async (options) => {
    try {
        logger_1.logger.progress('Syncing with Dooray!...');
        if (options.dryRun) {
            logger_1.logger.info('Dry run mode: No changes will be made');
        }
        if (options.force) {
            logger_1.logger.warn('Force mode: Conflicts will be resolved automatically');
        }
        // TODO: 실제 Dooray! API 호출 및 동기화 로직
        logger_1.logger.warn('Task sync implementation coming soon!');
        logger_1.logger.success('Sync preparation complete! 🔄');
    }
    catch (error) {
        logger_1.logger.error(`Task sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
});
//# sourceMappingURL=sync.js.map