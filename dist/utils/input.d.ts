import { ValidationResult } from '../validators';
/**
 * 명령행 인자 파싱 옵션
 */
export interface ParseCommandArgsOptions {
    allowUnknown?: boolean;
    stripQuotes?: boolean;
    parseNumbers?: boolean;
}
/**
 * 파싱된 명령행 인자
 */
export interface ParsedArgs {
    positional: string[];
    flags: Record<string, any>;
    raw: string[];
}
/**
 * 필수 파라미터 정의
 */
export interface RequiredParam {
    name: string;
    description: string;
    validator?: (value: any) => ValidationResult;
}
/**
 * 명령행 인자를 파싱합니다
 */
export declare function parseCommandArgs(args: string[], options?: ParseCommandArgsOptions): ParsedArgs;
/**
 * 필수 파라미터가 모두 제공되었는지 확인
 */
export declare function validateRequired(params: Record<string, any>, required: RequiredParam[]): ValidationResult;
/**
 * 입력값을 정제하고 이스케이프 처리
 */
export declare function sanitizeInput(input: string): string;
/**
 * 사용자 친화적 오류 메시지 생성
 */
export declare function formatErrorMessage(error: string | Error, context?: string, suggestions?: string[]): string;
/**
 * 대화형 프롬프트를 위한 입력 검증
 */
export declare function validateInteractiveInput(value: string, validators: Array<(value: string) => ValidationResult>): Promise<ValidationResult>;
/**
 * 커맨드 라인 옵션의 타입 안전 접근
 */
export declare function getOptionValue<T = any>(options: Record<string, any>, key: string, defaultValue?: T): T;
/**
 * 여러 입력 소스에서 값 우선순위 결정
 */
export declare function resolveValue<T>(...sources: Array<T | undefined>): T | undefined;
/**
 * 배열 형태의 입력을 파싱 (콤마 구분)
 */
export declare function parseArrayInput(input: string | string[]): string[];
//# sourceMappingURL=input.d.ts.map