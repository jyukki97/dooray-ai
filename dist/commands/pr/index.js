"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prCommand = void 0;
const commander_1 = require("commander");
const create_1 = require("./create");
const update_1 = require("./update");
exports.prCommand = new commander_1.Command('pr')
    .description('Manage Pull Requests')
    .addCommand(create_1.createPRCommand)
    .addCommand(update_1.updatePRCommand);
//# sourceMappingURL=index.js.map