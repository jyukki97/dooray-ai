import { BaseValidator } from './base';
export declare class NumberValidator extends BaseValidator {
    /**
     * 필수 입력 검증
     */
    required(): this;
    /**
     * 정수 검증
     */
    integer(): this;
    /**
     * 양수 검증
     */
    positive(): this;
    /**
     * 최솟값 검증
     */
    min(minValue: number): this;
    /**
     * 최댓값 검증
     */
    max(maxValue: number): this;
    /**
     * 범위 검증
     */
    range(min: number, max: number): this;
    /**
     * 값 변환 (숫자로 변환)
     */
    protected transform(value: any): number;
}
//# sourceMappingURL=number.d.ts.map