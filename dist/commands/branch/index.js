"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchCommand = void 0;
const commander_1 = require("commander");
const create_1 = require("./create");
const switch_1 = require("./switch");
const cleanup_1 = require("./cleanup");
exports.branchCommand = new commander_1.Command('branch')
    .description('Manage Git branches for tasks')
    .addCommand(create_1.createBranchCommand)
    .addCommand(switch_1.switchBranchCommand)
    .addCommand(cleanup_1.cleanupBranchCommand);
//# sourceMappingURL=index.js.map