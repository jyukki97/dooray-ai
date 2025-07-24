"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBranchCommand = void 0;
const commander_1 = require("commander");
const logger_1 = require("../../utils/logger");
exports.createBranchCommand = new commander_1.Command('create')
    .description('Create a new branch for task')
    .argument('<name>', 'Branch name')
    .option('-c, --checkout', 'Checkout to the new branch immediately')
    .option('-f, --force', 'Force create even if branch exists')
    .action(async (name, options) => {
    try {
        logger_1.logger.progress(`Creating branch: ${name}`);
        logger_1.logger.info(`Branch Name: ${name}`);
        if (options.checkout) {
            logger_1.logger.info('Will checkout to new branch after creation');
        }
        if (options.force) {
            logger_1.logger.warn('Force mode: Will overwrite existing branch');
        }
        // TODO: 실제 Git 브랜치 생성 로직
        logger_1.logger.warn('Branch creation implementation coming soon!');
        logger_1.logger.success('Branch creation prepared! 🌿');
    }
    catch (error) {
        logger_1.logger.error(`Branch creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
});
//# sourceMappingURL=create.js.map