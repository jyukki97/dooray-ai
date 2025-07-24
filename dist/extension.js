"use strict";
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const doorayAIExtension_1 = require("./extension/doorayAIExtension");
const logger_1 = require("./utils/logger");
let extension;
/**
 * Extension 활성화 함수
 */
function activate(context) {
    logger_1.logger.info('🚀 Dooray AI Extension이 활성화되었습니다!');
    try {
        // DoorayAI Extension 인스턴스 생성
        extension = new doorayAIExtension_1.DoorayAIExtension(context);
        // Extension 초기화
        extension.initialize();
        logger_1.logger.info('✅ Dooray AI Extension 초기화 완료');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.logger.error(`❌ Extension 활성화 실패: ${errorMessage}`);
        vscode.window.showErrorMessage(`Dooray AI Extension 활성화에 실패했습니다: ${errorMessage}`);
    }
}
/**
 * Extension 비활성화 함수
 */
function deactivate() {
    logger_1.logger.info('🔌 Dooray AI Extension이 비활성화됩니다...');
    if (extension) {
        extension.dispose();
        extension = undefined;
    }
    logger_1.logger.info('✅ Dooray AI Extension 비활성화 완료');
}
//# sourceMappingURL=extension.js.map