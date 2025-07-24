"use strict";
/**
 * GitHub 서비스 모듈
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
exports.GitHubClientFactory = exports.GitHubClient = void 0;
exports.getGitHubClient = getGitHubClient;
exports.validateGitHubConnection = validateGitHubConnection;
__exportStar(require("./types"), exports);
var client_1 = require("./client");
Object.defineProperty(exports, "GitHubClient", { enumerable: true, get: function () { return client_1.GitHubClient; } });
const client_2 = require("./client");
const auth_1 = require("../auth");
const logger_1 = require("../../utils/logger");
/**
 * GitHub 클라이언트 팩토리
 */
class GitHubClientFactory {
    /**
     * GitHub 클라이언트 생성
     */
    static async createClient(options = {}) {
        try {
            // 저장된 인증 정보 로드
            const credentials = await auth_1.authManager.getGitHubAuth();
            if (!credentials || !credentials.token) {
                throw new Error('GitHub credentials not found. Please run: dooray-ai auth login');
            }
            const client = new client_2.GitHubClient(credentials, options);
            // 연결 테스트
            const isValid = await client.validateConnection();
            if (!isValid) {
                throw new Error('Failed to connect to GitHub API. Please check your token.');
            }
            this.instance = client;
            logger_1.logger.success('GitHub client created successfully');
            return client;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`Failed to create GitHub client: ${errorMessage}`);
            throw error;
        }
    }
    /**
     * 기존 클라이언트 인스턴스 반환 또는 새로 생성
     */
    static async getInstance(options = {}) {
        if (!this.instance) {
            this.instance = await this.createClient(options);
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
     * GitHub 연결 상태 확인
     */
    static async validateConnection() {
        try {
            const client = await this.getInstance();
            return await client.validateConnection();
        }
        catch (error) {
            return false;
        }
    }
}
exports.GitHubClientFactory = GitHubClientFactory;
GitHubClientFactory.instance = null;
/**
 * 기본 GitHub 클라이언트 인스턴스 가져오기
 */
async function getGitHubClient() {
    return await GitHubClientFactory.getInstance();
}
/**
 * GitHub 연결 상태 확인
 */
async function validateGitHubConnection() {
    return await GitHubClientFactory.validateConnection();
}
//# sourceMappingURL=index.js.map