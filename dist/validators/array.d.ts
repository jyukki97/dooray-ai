import { BaseValidator } from './base';
export declare class ArrayValidator extends BaseValidator {
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
     * 각 요소 타입 검증
     */
    itemsType(type: 'string' | 'number' | 'boolean'): this;
    /**
     * 중복 값 방지 검증
     */
    unique(): this;
    /**
     * 허용된 값들로만 구성되었는지 검증
     */
    itemsOneOf(allowedValues: any[]): this;
    /**
     * 값 변환 (중복 제거, 정렬)
     */
    protected transform(value: any): any[];
}
//# sourceMappingURL=array.d.ts.map