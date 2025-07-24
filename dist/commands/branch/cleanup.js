"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupBranchCommand = void 0;
const commander_1 = require("commander");
const logger_1 = require("../../utils/logger");
exports.cleanupBranchCommand = new commander_1.Command('cleanup')
    .description('Clean up merged branches')
    .option('-f, --force', 'Force delete branches even if not merged')
    .option('--dry-run', 'Show what would be deleted without making changes')
    .option('-r, --remote', 'Also clean up remote tracking branches')
    .action(async (options) => {
    try {
        logger_1.logger.progress('Cleaning up branches...');
        if (options.dryRun) {
            logger_1.logger.info('Dry run mode: No changes will be made');
        }
        if (options.force) {
            logger_1.logger.warn('Force mode: Will delete unmerged branches');
        }
        if (options.remote) {
            logger_1.logger.info('Will also clean up remote tracking branches');
        }
        // TODO: 실제 Git 브랜치 정리 로직
        logger_1.logger.warn('Branch cleanup implementation coming soon!');
        logger_1.logger.success('Branch cleanup prepared! 🧹');
    }
    catch (error) {
        logger_1.logger.error(`Branch cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
});
//# sourceMappingURL=cleanup.js.map