"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberValidator = void 0;
const base_1 = require("./base");
class NumberValidator extends base_1.BaseValidator {
    /**
     * 필수 입력 검증
     */
    required() {
        this.addRule({
            name: 'required',
            message: '{field}은(는) 필수 입력 항목입니다.',
            validate: (value) => {
                return value !== null && value !== undefined && !isNaN(Number(value));
            }
        });
        return this;
    }
    /**
     * 정수 검증
     */
    integer() {
        this.addRule({
            name: 'integer',
            message: '{field}은(는) 정수여야 합니다.',
            validate: (value) => {
                const num = Number(value);
                return !isNaN(num) && Number.isInteger(num);
            }
        });
        return this;
    }
    /**
     * 양수 검증
     */
    positive() {
        this.addRule({
            name: 'positive',
            message: '{field}은(는) 양수여야 합니다.',
            validate: (value) => {
                const num = Number(value);
                return !isNaN(num) && num > 0;
            }
        });
        return this;
    }
    /**
     * 최솟값 검증
     */
    min(minValue) {
        this.addRule({
            name: 'min',
            message: `{field}은(는) ${minValue} 이상이어야 합니다.`,
            validate: (value) => {
                const num = Number(value);
                return !isNaN(num) && num >= minValue;
            }
        });
        return this;
    }
    /**
     * 최댓값 검증
     */
    max(maxValue) {
        this.addRule({
            name: 'max',
            message: `{field}은(는) ${maxValue} 이하여야 합니다.`,
            validate: (value) => {
                const num = Number(value);
                return !isNaN(num) && num <= maxValue;
            }
        });
        return this;
    }
    /**
     * 범위 검증
     */
    range(min, max) {
        return this.min(min).max(max);
    }
    /**
     * 값 변환 (숫자로 변환)
     */
    transform(value) {
        return Number(value);
    }
}
exports.NumberValidator = NumberValidator;
//# sourceMappingURL=number.js.map