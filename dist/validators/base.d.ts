export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    value?: any;
}
export interface ValidatorRule {
    name: string;
    message: string;
    validate: (value: any) => boolean;
}
export declare abstract class BaseValidator {
    protected rules: ValidatorRule[];
    protected fieldName: string;
    constructor(fieldName: string);
    /**
     * 규칙 추가
     */
    addRule(rule: ValidatorRule): this;
    /**
     * 값 검증 실행
     */
    validate(value: any): ValidationResult;
    /**
     * 오류 메시지 포맷팅
     */
    protected formatErrorMessage(message: string, value: any): string;
    /**
     * 값 변환 (하위 클래스에서 구현)
     */
    protected transform(value: any): any;
}
//# sourceMappingURL=base.d.ts.map