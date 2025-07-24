import { BaseValidator } from './base';

export class StringValidator extends BaseValidator {
  /**
   * 필수 입력 검증
   */
  required(): this {
    this.addRule({
      name: 'required',
      message: '{field}은(는) 필수 입력 항목입니다.',
      validate: (value: any) => {
        return value !== null && value !== undefined && String(value).trim().length > 0;
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
      message: `{field}은(는) 최소 ${min}자 이상이어야 합니다.`,
      validate: (value: any) => {
        return String(value || '').length >= min;
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
      message: `{field}은(는) 최대 ${max}자 이하여야 합니다.`,
      validate: (value: any) => {
        return String(value || '').length <= max;
      }
    });
    return this;
  }

  /**
   * 정규표현식 패턴 검증
   */
  pattern(regex: RegExp, message?: string): this {
    this.addRule({
      name: 'pattern',
      message: message || '{field}의 형식이 올바르지 않습니다.',
      validate: (value: any) => {
        return regex.test(String(value || ''));
      }
    });
    return this;
  }

  /**
   * 이메일 형식 검증
   */
  email(): this {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.pattern(emailRegex, '{field}은(는) 올바른 이메일 형식이어야 합니다.');
  }

  /**
   * URL 형식 검증
   */
  url(): this {
    const urlRegex = /^https?:\/\/.+/;
    return this.pattern(urlRegex, '{field}은(는) 올바른 URL 형식이어야 합니다.');
  }

  /**
   * 허용된 값 목록 검증
   */
  oneOf(allowedValues: string[]): this {
    this.addRule({
      name: 'oneOf',
      message: `{field}은(는) 다음 값 중 하나여야 합니다: ${allowedValues.join(', ')}`,
      validate: (value: any) => {
        return allowedValues.includes(String(value));
      }
    });
    return this;
  }

  /**
   * 값 변환 (트림)
   */
  protected override transform(value: any): string {
    return String(value || '').trim();
  }
} 