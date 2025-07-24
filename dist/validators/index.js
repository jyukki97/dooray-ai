"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createArrayValidator = exports.createNumberValidator = exports.createStringValidator = exports.ArrayValidator = exports.NumberValidator = exports.StringValidator = exports.BaseValidator = void 0;
var base_1 = require("./base");
Object.defineProperty(exports, "BaseValidator", { enumerable: true, get: function () { return base_1.BaseValidator; } });
var string_1 = require("./string");
Object.defineProperty(exports, "StringValidator", { enumerable: true, get: function () { return string_1.StringValidator; } });
var number_1 = require("./number");
Object.defineProperty(exports, "NumberValidator", { enumerable: true, get: function () { return number_1.NumberValidator; } });
var array_1 = require("./array");
Object.defineProperty(exports, "ArrayValidator", { enumerable: true, get: function () { return array_1.ArrayValidator; } });
// 편의 함수들
const string_2 = require("./string");
const number_2 = require("./number");
const array_2 = require("./array");
const createStringValidator = (fieldName) => new string_2.StringValidator(fieldName);
exports.createStringValidator = createStringValidator;
const createNumberValidator = (fieldName) => new number_2.NumberValidator(fieldName);
exports.createNumberValidator = createNumberValidator;
const createArrayValidator = (fieldName) => new array_2.ArrayValidator(fieldName);
exports.createArrayValidator = createArrayValidator;
//# sourceMappingURL=index.js.map