"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringValidator = void 0;
const base_1 = require("./base");
class StringValidator extends base_1.BaseValidator {
    /**
     * 필수 입력 검증
     */
    required() {
        this.addRule({
            name: 'required',
            message: '{field}은(는) 필수 입력 항목입니다.',
            validate: (value) => {
                return value !== null && value !== undefined && String(value).trim().length > 0;
            }
        });
        return this;
    }
    /**
     * 최소 길이 검증
     */
    minLength(min) {
        this.addRule({
            name: 'minLength',
            message: `{field}은(는) 최소 ${min}자 이상이어야 합니다.`,
            validate: (value) => {
                return String(value || '').length >= min;
            }
        });
        return this;
    }
    /**
     * 최대 길이 검증
     */
    maxLength(max) {
        this.addRule({
            name: 'maxLength',
            message: `{field}은(는) 최대 ${max}자 이하여야 합니다.`,
            validate: (value) => {
                return String(value || '').length <= max;
            }
        });
        return this;
    }
    /**
     * 정규표현식 패턴 검증
     */
    pattern(regex, message) {
        this.addRule({
            name: 'pattern',
            message: message || '{field}의 형식이 올바르지 않습니다.',
            validate: (value) => {
                return regex.test(String(value || ''));
            }
        });
        return this;
    }
    /**
     * 이메일 형식 검증
     */
    email() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return this.pattern(emailRegex, '{field}은(는) 올바른 이메일 형식이어야 합니다.');
    }
    /**
     * URL 형식 검증
     */
    url() {
        const urlRegex = /^https?:\/\/.+/;
        return this.pattern(urlRegex, '{field}은(는) 올바른 URL 형식이어야 합니다.');
    }
    /**
     * 허용된 값 목록 검증
     */
    oneOf(allowedValues) {
        this.addRule({
            name: 'oneOf',
            message: `{field}은(는) 다음 값 중 하나여야 합니다: ${allowedValues.join(', ')}`,
            validate: (value) => {
                return allowedValues.includes(String(value));
            }
        });
        return this;
    }
    /**
     * 값 변환 (트림)
     */
    transform(value) {
        return String(value || '').trim();
    }
}
exports.StringValidator = StringValidator;
//# sourceMappingURL=string.js.map