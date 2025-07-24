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

export abstract class BaseValidator {
  protected rules: ValidatorRule[] = [];
  protected fieldName: string;

  constructor(fieldName: string) {
    this.fieldName = fieldName;
  }

  /**
   * 규칙 추가
   */
  addRule(rule: ValidatorRule): this {
    this.rules.push(rule);
    return this;
  }

  /**
   * 값 검증 실행
   */
  validate(value: any): ValidationResult {
    const errors: string[] = [];

    for (const rule of this.rules) {
      if (!rule.validate(value)) {
        errors.push(this.formatErrorMessage(rule.message, value));
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      value: errors.length === 0 ? this.transform(value) : undefined
    };
  }

  /**
   * 오류 메시지 포맷팅
   */
  protected formatErrorMessage(message: string, value: any): string {
    return message
      .replace('{field}', this.fieldName)
      .replace('{value}', String(value));
  }

  /**
   * 값 변환 (하위 클래스에서 구현)
   */
  protected transform(value: any): any {
    return value;
  }
} 