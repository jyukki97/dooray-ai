import { BaseValidator } from './base';
export declare class StringValidator extends BaseValidator {
    /**
     * 필수 입력 검증
     */
    required(): this;
    /**
     * 최소 길이 검증
     */
    minLength(min: number): this;
    /**
     * 최대 길이 검증
     */
    maxLength(max: number): this;
    /**
     * 정규표현식 패턴 검증
     */
    pattern(regex: RegExp, message?: string): this;
    /**
     * 이메일 형식 검증
     */
    email(): this;
    /**
     * URL 형식 검증
     */
    url(): this;
    /**
     * 허용된 값 목록 검증
     */
    oneOf(allowedValues: string[]): this;
    /**
     * 값 변환 (트림)
     */
    protected transform(value: any): string;
}
//# sourceMappingURL=string.d.ts.map