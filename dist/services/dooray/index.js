"use strict";
/**
 * Dooray 서비스 모듈
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
exports.DoorayClientFactory = exports.DoorayClient = void 0;
exports.getDoorayClient = getDoorayClient;
exports.validateDoorayConnection = validateDoorayConnection;
__exportStar(require("./types"), exports);
var client_1 = require("./client");
Object.defineProperty(exports, "DoorayClient", { enumerable: true, get: function () { return client_1.DoorayClient; } });
const client_2 = require("./client");
const auth_1 = require("../auth");
const logger_1 = require("../../utils/logger");
/**
 * Dooray 클라이언트 팩토리
 */
class DoorayClientFactory {
    /**
     * Dooray 클라이언트 생성
     */
    static async createClient(options = {}) {
        try {
            // 저장된 인증 정보 로드
            const credentials = await auth_1.authManager.getDoorayAuth();
            if (!credentials || !credentials.apiKey) {
                throw new Error('Dooray credentials not found. Please run: dooray-ai auth login');
            }
            const client = new client_2.DoorayClient(credentials, options);
            // 연결 테스트
            const isValid = await client.validateConnection();
            if (!isValid) {
                throw new Error('Failed to connect to Dooray API. Please check your credentials.');
            }
            this.instance = client;
            logger_1.logger.success('Dooray client created successfully');
            return client;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`Failed to create Dooray client: ${errorMessage}`);
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
     * Dooray 연결 상태 확인
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
exports.DoorayClientFactory = DoorayClientFactory;
DoorayClientFactory.instance = null;
/**
 * 기본 Dooray 클라이언트 인스턴스 가져오기
 */
async function getDoorayClient() {
    return await DoorayClientFactory.getInstance();
}
/**
 * Dooray 연결 상태 확인
 */
async function validateDoorayConnection() {
    return await DoorayClientFactory.validateConnection();
}
//# sourceMappingURL=index.js.map