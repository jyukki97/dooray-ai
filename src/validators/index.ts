export { BaseValidator, ValidationResult, ValidatorRule } from './base';
export { StringValidator } from './string';
export { NumberValidator } from './number';
export { ArrayValidator } from './array';

// 편의 함수들
import { StringValidator } from './string';
import { NumberValidator } from './number';
import { ArrayValidator } from './array';

export const createStringValidator = (fieldName: string) => new StringValidator(fieldName);
export const createNumberValidator = (fieldName: string) => new NumberValidator(fieldName);
export const createArrayValidator = (fieldName: string) => new ArrayValidator(fieldName); 