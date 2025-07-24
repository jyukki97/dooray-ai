/**
 * 오류 코드 정의
 */
export declare enum ErrorCode {
    UNKNOWN_ERROR = "E001",
    INVALID_ARGUMENT = "E002",
    MISSING_REQUIRED_PARAM = "E003",
    INVALID_INPUT_FORMAT = "E004",
    OPERATION_CANCELLED = "E005",
    CONFIG_NOT_FOUND = "E100",
    CONFIG_INVALID = "E101",
    CONFIG_PERMISSION_DENIED = "E102",
    CONFIG_CORRUPTION = "E103",
    AUTH_INVALID_CREDENTIALS = "E200",
    AUTH_TOKEN_EXPIRED = "E201",
    AUTH_PERMISSION_DENIED = "E202",
    AUTH_RATE_LIMITED = "E203",
    API_CONNECTION_FAILED = "E300",
    API_INVALID_RESPONSE = "E301",
    API_RATE_LIMITED = "E302",
    API_SERVICE_UNAVAILABLE = "E303",
    GIT_NOT_INITIALIZED = "E400",
    GIT_DIRTY_WORKING_TREE = "E401",
    GIT_BRANCH_NOT_FOUND = "E402",
    GIT_MERGE_CONFLICT = "E403",
    FILE_NOT_FOUND = "E500",
    FILE_PERMISSION_DENIED = "E501",
    FILE_ALREADY_EXISTS = "E502",
    DIRECTORY_NOT_EMPTY = "E503"
}
/**
 * 표준화된 오류 클래스
 */
export declare class DoorayAIError extends Error {
    readonly code: ErrorCode;
    readonly context?: Record<string, any> | undefined;
    readonly suggestions?: string[] | undefined;
    constructor(code: ErrorCode, message: string, context?: Record<string, any>, suggestions?: string[]);
    /**
     * 사용자 친화적 오류 메시지 생성
     */
    toUserString(): string;
    /**
     * 개발자용 디버그 정보 생성
     */
    toDebugString(): string;
}
/**
 * 오류 메시지 템플릿
 */
export declare const ERROR_MESSAGES: Record<ErrorCode, string>;
/**
 * 오류 생성 헬퍼 함수들
 */
export declare function createValidationError(message: string, field?: string, value?: any): DoorayAIError;
export declare function createConfigError(message: string, configPath?: string): DoorayAIError;
export declare function createAPIError(message: string, endpoint?: string, statusCode?: number): DoorayAIError;
export declare function createGitError(message: string, command?: string, workingDir?: string): DoorayAIError;
//# sourceMappingURL=errors.d.ts.map