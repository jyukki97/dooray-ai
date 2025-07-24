"use strict";
/**
 * 워크플로우 서비스 모듈
 */
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskWorkflowEngine = void 0;
exports.createWorkflowEngine = createWorkflowEngine;
exports.getWorkflowEngine = getWorkflowEngine;
exports.executeTaskWorkflow = executeTaskWorkflow;
exports.resetWorkflowEngine = resetWorkflowEngine;
__exportStar(require("./types"), exports);
var engine_1 = require("./engine");
Object.defineProperty(exports, "TaskWorkflowEngine", { enumerable: true, get: function () { return engine_1.TaskWorkflowEngine; } });
const engine_2 = require("./engine");
/**
 * 글로벌 워크플로우 엔진 인스턴스
 */
let workflowEngine = null;
/**
 * 워크플로우 엔진 생성
 */
function createWorkflowEngine(progressCallback) {
    return new engine_2.TaskWorkflowEngine(progressCallback);
}
/**
 * 기본 워크플로우 엔진 인스턴스 가져오기
 */
function getWorkflowEngine(progressCallback) {
    if (!workflowEngine) {
        workflowEngine = new engine_2.TaskWorkflowEngine(progressCallback);
    }
    return workflowEngine;
}
/**
 * 태스크 워크플로우 실행 (편의 함수)
 */
async function executeTaskWorkflow(projectId, taskId, options, progressCallback) {
    const engine = getWorkflowEngine(progressCallback);
    return await engine.executeTaskWorkflow({
        projectId,
        taskId,
        options
    });
}
/**
 * 워크플로우 엔진 재설정
 */
function resetWorkflowEngine() {
    workflowEngine = null;
}
//# sourceMappingURL=index.js.map