"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskCommand = void 0;
const commander_1 = require("commander");
const create_1 = require("./create");
const list_1 = require("./list");
const update_1 = require("./update");
const sync_1 = require("./sync");
exports.taskCommand = new commander_1.Command('task')
    .description('Manage Dooray! tasks')
    .addCommand(create_1.createTaskCommand)
    .addCommand(list_1.listTaskCommand)
    .addCommand(update_1.updateTaskCommand)
    .addCommand(sync_1.syncTaskCommand);
//# sourceMappingURL=index.js.map