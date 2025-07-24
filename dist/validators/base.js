"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseValidator = void 0;
class BaseValidator {
    constructor(fieldName) {
        this.rules = [];
        this.fieldName = fieldName;
    }
    /**
     * 규칙 추가
     */
    addRule(rule) {
        this.rules.push(rule);
        return this;
    }
    /**
     * 값 검증 실행
     */
    validate(value) {
        const errors = [];
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
    formatErrorMessage(message, value) {
        return message
            .replace('{field}', this.fieldName)
            .replace('{value}', String(value));
    }
    /**
     * 값 변환 (하위 클래스에서 구현)
     */
    transform(value) {
        return value;
    }
}
exports.BaseValidator = BaseValidator;
//# sourceMappingURL=base.js.map