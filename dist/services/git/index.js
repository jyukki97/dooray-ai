"use strict";
/**
 * Git 서비스 모듈
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
exports.GitClientFactory = exports.GitClient = void 0;
exports.getGitClient = getGitClient;
exports.validateGitRepository = validateGitRepository;
__exportStar(require("./types"), exports);
var client_1 = require("./client");
Object.defineProperty(exports, "GitClient", { enumerable: true, get: function () { return client_1.GitClient; } });
const client_2 = require("./client");
const config_1 = require("../config");
const logger_1 = require("../../utils/logger");
/**
 * Git 클라이언트 팩토리
 */
class GitClientFactory {
    /**
     * Git 클라이언트 생성
     */
    static async createClient(repositoryPath) {
        try {
            const repoPath = repositoryPath || process.cwd();
            // 설정 로드
            const appConfig = await config_1.configManager.load();
            const gitConfig = appConfig.git || {};
            const client = new client_2.GitClient(repoPath, gitConfig);
            // Git 저장소 검증
            const isValidRepo = await client.validateRepository();
            if (!isValidRepo) {
                throw new Error(`Not a git repository: ${repoPath}`);
            }
            this.instance = client;
            logger_1.logger.success('Git client created successfully');
            return client;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`Failed to create Git client: ${errorMessage}`);
            throw error;
        }
    }
    /**
     * 기존 클라이언트 인스턴스 반환 또는 새로 생성
     */
    static async getInstance(repositoryPath) {
        if (!this.instance) {
            this.instance = await this.createClient(repositoryPath);
        }
        return this.instance;
    }
    /**
     * 클라이언트 인스턴스 재설정
     */
    static resetInstance() {
        this.instance = null;
    }
    /**
     * Git 저장소 검증
     */
    static async validateRepository(repositoryPath) {
        try {
            const client = new client_2.GitClient(repositoryPath || process.cwd());
            return await client.validateRepository();
        }
        catch (error) {
            return false;
        }
    }
}
exports.GitClientFactory = GitClientFactory;
GitClientFactory.instance = null;
/**
 * 기본 Git 클라이언트 인스턴스 가져오기
 */
async function getGitClient(repositoryPath) {
    return await GitClientFactory.getInstance(repositoryPath);
}
/**
 * Git 저장소 검증
 */
async function validateGitRepository(repositoryPath) {
    return await GitClientFactory.validateRepository(repositoryPath);
}
//# sourceMappingURL=index.js.map