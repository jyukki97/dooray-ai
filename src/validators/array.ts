import { BaseValidator } from './base';

export class ArrayValidator extends BaseValidator {
  /**
   * 필수 입력 검증
   */
  required(): this {
    this.addRule({
      name: 'required',
      message: '{field}은(는) 필수 입력 항목입니다.',
      validate: (value: any) => {
        return Array.isArray(value) && value.length > 0;
      }
    });
    return this;
  }

  /**
   * 최소 길이 검증
   */
  minLength(min: number): this {
    this.addRule({
      name: 'minLength',
      message: `{field}은(는) 최소 ${min}개 이상의 항목이 필요합니다.`,
      validate: (value: any) => {
        return Array.isArray(value) && value.length >= min;
      }
    });
    return this;
  }

  /**
   * 최대 길이 검증
   */
  maxLength(max: number): this {
    this.addRule({
      name: 'maxLength',
      message: `{field}은(는) 최대 ${max}개 이하의 항목만 허용됩니다.`,
      validate: (value: any) => {
        return Array.isArray(value) && value.length <= max;
      }
    });
    return this;
  }

  /**
   * 각 요소 타입 검증
   */
  itemsType(type: 'string' | 'number' | 'boolean'): this {
    this.addRule({
      name: 'itemsType',
      message: `{field}의 모든 항목은 ${type} 타입이어야 합니다.`,
      validate: (value: any) => {
        if (!Array.isArray(value)) return false;
        
        return value.every(item => {
          switch (type) {
            case 'string':
              return typeof item === 'string';
            case 'number':
              return typeof item === 'number' && !isNaN(item);
            case 'boolean':
              return typeof item === 'boolean';
            default:
              return false;
          }
        });
      }
    });
    return this;
  }

  /**
   * 중복 값 방지 검증
   */
  unique(): this {
    this.addRule({
      name: 'unique',
      message: '{field}에는 중복된 값이 있을 수 없습니다.',
      validate: (value: any) => {
        if (!Array.isArray(value)) return false;
        return new Set(value).size === value.length;
      }
    });
    return this;
  }

  /**
   * 허용된 값들로만 구성되었는지 검증
   */
  itemsOneOf(allowedValues: any[]): this {
    this.addRule({
      name: 'itemsOneOf',
      message: `{field}의 모든 항목은 다음 값 중 하나여야 합니다: ${allowedValues.join(', ')}`,
      validate: (value: any) => {
        if (!Array.isArray(value)) return false;
        return value.every(item => allowedValues.includes(item));
      }
    });
    return this;
  }

  /**
   * 값 변환 (중복 제거, 정렬)
   */
  protected override transform(value: any): any[] {
    if (!Array.isArray(value)) return [];
    return [...new Set(value)].sort();
  }
} 