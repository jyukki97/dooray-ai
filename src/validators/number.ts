import { BaseValidator } from './base';

export class NumberValidator extends BaseValidator {
  /**
   * 필수 입력 검증
   */
  required(): this {
    this.addRule({
      name: 'required',
      message: '{field}은(는) 필수 입력 항목입니다.',
      validate: (value: any) => {
        return value !== null && value !== undefined && !isNaN(Number(value));
      }
    });
    return this;
  }

  /**
   * 정수 검증
   */
  integer(): this {
    this.addRule({
      name: 'integer',
      message: '{field}은(는) 정수여야 합니다.',
      validate: (value: any) => {
        const num = Number(value);
        return !isNaN(num) && Number.isInteger(num);
      }
    });
    return this;
  }

  /**
   * 양수 검증
   */
  positive(): this {
    this.addRule({
      name: 'positive',
      message: '{field}은(는) 양수여야 합니다.',
      validate: (value: any) => {
        const num = Number(value);
        return !isNaN(num) && num > 0;
      }
    });
    return this;
  }

  /**
   * 최솟값 검증
   */
  min(minValue: number): this {
    this.addRule({
      name: 'min',
      message: `{field}은(는) ${minValue} 이상이어야 합니다.`,
      validate: (value: any) => {
        const num = Number(value);
        return !isNaN(num) && num >= minValue;
      }
    });
    return this;
  }

  /**
   * 최댓값 검증
   */
  max(maxValue: number): this {
    this.addRule({
      name: 'max',
      message: `{field}은(는) ${maxValue} 이하여야 합니다.`,
      validate: (value: any) => {
        const num = Number(value);
        return !isNaN(num) && num <= maxValue;
      }
    });
    return this;
  }

  /**
   * 범위 검증
   */
  range(min: number, max: number): this {
    return this.min(min).max(max);
  }

  /**
   * 값 변환 (숫자로 변환)
   */
  protected override transform(value: any): number {
    return Number(value);
  }
} 