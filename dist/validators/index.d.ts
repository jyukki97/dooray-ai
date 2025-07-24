export { BaseValidator, ValidationResult, ValidatorRule } from './base';
export { StringValidator } from './string';
export { NumberValidator } from './number';
export { ArrayValidator } from './array';
import { StringValidator } from './string';
import { NumberValidator } from './number';
import { ArrayValidator } from './array';
export declare const createStringValidator: (fieldName: string) => StringValidator;
export declare const createNumberValidator: (fieldName: string) => NumberValidator;
export declare const createArrayValidator: (fieldName: string) => ArrayValidator;
//# sourceMappingURL=index.d.ts.map