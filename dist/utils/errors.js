"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MESSAGES = exports.DoorayAIError = exports.ErrorCode = void 0;
exports.createValidationError = createValidationError;
exports.createConfigError = createConfigError;
exports.createAPIError = createAPIError;
exports.createGitError = createGitError;
/**
 * 오류 코드 정의
 */
var ErrorCode;
(function (ErrorCode) {
    // 일반적인 오류 (E001-E099)
    ErrorCode["UNKNOWN_ERROR"] = "E001";
    ErrorCode["INVALID_ARGUMENT"] = "E002";
    ErrorCode["MISSING_REQUIRED_PARAM"] = "E003";
    ErrorCode["INVALID_INPUT_FORMAT"] = "E004";
    ErrorCode["OPERATION_CANCELLED"] = "E005";
    // 설정 관련 오류 (E100-E199)
    ErrorCode["CONFIG_NOT_FOUND"] = "E100";
    ErrorCode["CONFIG_INVALID"] = "E101";
    ErrorCode["CONFIG_PERMISSION_DENIED"] = "E102";
    ErrorCode["CONFIG_CORRUPTION"] = "E103";
    // 인증 관련 오류 (E200-E299)
    ErrorCode["AUTH_INVALID_CREDENTIALS"] = "E200";
    ErrorCode["AUTH_TOKEN_EXPIRED"] = "E201";
    ErrorCode["AUTH_PERMISSION_DENIED"] = "E202";
    ErrorCode["AUTH_RATE_LIMITED"] = "E203";
    // API 연동 오류 (E300-E399)
    ErrorCode["API_CONNECTION_FAILED"] = "E300";
    ErrorCode["API_INVALID_RESPONSE"] = "E301";
    ErrorCode["API_RATE_LIMITED"] = "E302";
    ErrorCode["API_SERVICE_UNAVAILABLE"] = "E303";
    // Git 관련 오류 (E400-E499)
    ErrorCode["GIT_NOT_INITIALIZED"] = "E400";
    ErrorCode["GIT_DIRTY_WORKING_TREE"] = "E401";
    ErrorCode["GIT_BRANCH_NOT_FOUND"] = "E402";
    ErrorCode["GIT_MERGE_CONFLICT"] = "E403";
    // 파일 시스템 오류 (E500-E599)
    ErrorCode["FILE_NOT_FOUND"] = "E500";
    ErrorCode["FILE_PERMISSION_DENIED"] = "E501";
    ErrorCode["FILE_ALREADY_EXISTS"] = "E502";
    ErrorCode["DIRECTORY_NOT_EMPTY"] = "E503";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
/**
 * 표준화된 오류 클래스
 */
class DoorayAIError extends Error {
    constructor(code, message, context, suggestions) {
        super(message);
        this.name = 'DoorayAIError';
        this.code = code;
        this.context = context;
        this.suggestions = suggestions;
        // Error 클래스의 프로토타입 체인 유지
        Object.setPrototypeOf(this, DoorayAIError.prototype);
    }
    /**
     * 사용자 친화적 오류 메시지 생성
     */
    toUserString() {
        let message = `❌ [${this.code}] ${this.message}`;
        if (this.context) {
            const contextInfo = Object.entries(this.context)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
            message += `\n📍 상세정보: ${contextInfo}`;
        }
        if (this.suggestions && this.suggestions.length > 0) {
            message += '\n\n💡 해결방법:';
            this.suggestions.forEach((suggestion, index) => {
                message += `\n  ${index + 1}. ${suggestion}`;
            });
        }
        return message;
    }
    /**
     * 개발자용 디버그 정보 생성
     */
    toDebugString() {
        return JSON.stringify({
            code: this.code,
            message: this.message,
            context: this.context,
            suggestions: this.suggestions,
            stack: this.stack
        }, null, 2);
    }
}
exports.DoorayAIError = DoorayAIError;
/**
 * 오류 메시지 템플릿
 */
exports.ERROR_MESSAGES = {
    [ErrorCode.UNKNOWN_ERROR]: '알 수 없는 오류가 발생했습니다.',
    [ErrorCode.INVALID_ARGUMENT]: '잘못된 인자가 제공되었습니다.',
    [ErrorCode.MISSING_REQUIRED_PARAM]: '필수 파라미터가 누락되었습니다.',
    [ErrorCode.INVALID_INPUT_FORMAT]: '입력 형식이 올바르지 않습니다.',
    [ErrorCode.OPERATION_CANCELLED]: '작업이 취소되었습니다.',
    [ErrorCode.CONFIG_NOT_FOUND]: '설정 파일을 찾을 수 없습니다.',
    [ErrorCode.CONFIG_INVALID]: '설정 파일 형식이 올바르지 않습니다.',
    [ErrorCode.CONFIG_PERMISSION_DENIED]: '설정 파일에 대한 권한이 없습니다.',
    [ErrorCode.CONFIG_CORRUPTION]: '설정 파일이 손상되었습니다.',
    [ErrorCode.AUTH_INVALID_CREDENTIALS]: '인증 정보가 올바르지 않습니다.',
    [ErrorCode.AUTH_TOKEN_EXPIRED]: '인증 토큰이 만료되었습니다.',
    [ErrorCode.AUTH_PERMISSION_DENIED]: '해당 작업에 대한 권한이 없습니다.',
    [ErrorCode.AUTH_RATE_LIMITED]: '요청 한도를 초과했습니다.',
    [ErrorCode.API_CONNECTION_FAILED]: 'API 서버에 연결할 수 없습니다.',
    [ErrorCode.API_INVALID_RESPONSE]: 'API 응답 형식이 올바르지 않습니다.',
    [ErrorCode.API_RATE_LIMITED]: 'API 요청 한도를 초과했습니다.',
    [ErrorCode.API_SERVICE_UNAVAILABLE]: 'API 서비스를 사용할 수 없습니다.',
    [ErrorCode.GIT_NOT_INITIALIZED]: 'Git 저장소가 초기화되지 않았습니다.',
    [ErrorCode.GIT_DIRTY_WORKING_TREE]: '커밋되지 않은 변경사항이 있습니다.',
    [ErrorCode.GIT_BRANCH_NOT_FOUND]: '지정된 브랜치를 찾을 수 없습니다.',
    [ErrorCode.GIT_MERGE_CONFLICT]: '병합 충돌이 발생했습니다.',
    [ErrorCode.FILE_NOT_FOUND]: '파일을 찾을 수 없습니다.',
    [ErrorCode.FILE_PERMISSION_DENIED]: '파일에 대한 권한이 없습니다.',
    [ErrorCode.FILE_ALREADY_EXISTS]: '파일이 이미 존재합니다.',
    [ErrorCode.DIRECTORY_NOT_EMPTY]: '디렉터리가 비어있지 않습니다.',
};
/**
 * 오류 생성 헬퍼 함수들
 */
function createValidationError(message, field, value) {
    return new DoorayAIError(ErrorCode.INVALID_INPUT_FORMAT, message, { field, value }, [
        '입력값의 형식을 확인해주세요.',
        '도움말을 보려면 --help 옵션을 사용하세요.'
    ]);
}
function createConfigError(message, configPath) {
    return new DoorayAIError(ErrorCode.CONFIG_NOT_FOUND, message, { configPath }, [
        'dooray-ai init 명령어로 설정을 초기화하세요.',
        '설정 파일 경로를 확인하세요.'
    ]);
}
function createAPIError(message, endpoint, statusCode) {
    return new DoorayAIError(ErrorCode.API_CONNECTION_FAILED, message, { endpoint, statusCode }, [
        '네트워크 연결을 확인하세요.',
        'API 키가 올바른지 확인하세요.',
        '잠시 후 다시 시도하세요.'
    ]);
}
function createGitError(message, command, workingDir) {
    return new DoorayAIError(ErrorCode.GIT_NOT_INITIALIZED, message, { command, workingDir }, [
        'Git 저장소인지 확인하세요.',
        '변경사항을 커밋하거나 스태시하세요.',
        'git status 명령어로 상태를 확인하세요.'
    ]);
}
//# sourceMappingURL=errors.js.map