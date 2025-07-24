"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCommandArgs = parseCommandArgs;
exports.validateRequired = validateRequired;
exports.sanitizeInput = sanitizeInput;
exports.formatErrorMessage = formatErrorMessage;
exports.validateInteractiveInput = validateInteractiveInput;
exports.getOptionValue = getOptionValue;
exports.resolveValue = resolveValue;
exports.parseArrayInput = parseArrayInput;
/**
 * 명령행 인자를 파싱합니다
 */
function parseCommandArgs(args, options = {}) {
    const { stripQuotes = true, parseNumbers = true } = options;
    const positional = [];
    const flags = {};
    const raw = [...args];
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (!arg)
            continue; // undefined/null 체크
        // 플래그 처리 (--flag 또는 -f)
        if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=');
            if (value !== undefined && key) {
                // --key=value 형태
                flags[key] = processValue(value, { stripQuotes, parseNumbers });
            }
            else if (key && i + 1 < args.length && args[i + 1] && !args[i + 1].startsWith('-')) {
                // --key value 형태
                flags[key] = processValue(args[i + 1], { stripQuotes, parseNumbers });
                i++; // 다음 인자 건너뛰기
            }
            else if (key) {
                // --key (boolean flag)
                flags[key] = true;
            }
        }
        else if (arg.startsWith('-') && arg.length > 1) {
            // 단축 플래그 (-f)
            const key = arg.slice(1);
            if (i + 1 < args.length && args[i + 1] && !args[i + 1].startsWith('-')) {
                flags[key] = processValue(args[i + 1], { stripQuotes, parseNumbers });
                i++;
            }
            else {
                flags[key] = true;
            }
        }
        else {
            // 위치 인자
            positional.push(processValue(arg, { stripQuotes, parseNumbers }));
        }
    }
    return { positional, flags, raw };
}
/**
 * 값 처리 (따옴표 제거, 타입 변환 등)
 */
function processValue(value, options) {
    let processed = value;
    // 따옴표 제거
    if (options.stripQuotes) {
        if ((processed.startsWith('"') && processed.endsWith('"')) ||
            (processed.startsWith("'") && processed.endsWith("'"))) {
            processed = processed.slice(1, -1);
        }
    }
    // 숫자 변환
    if (options.parseNumbers && !isNaN(Number(processed)) && processed.trim() !== '') {
        return Number(processed);
    }
    // boolean 변환
    if (processed.toLowerCase() === 'true')
        return true;
    if (processed.toLowerCase() === 'false')
        return false;
    return processed;
}
/**
 * 필수 파라미터가 모두 제공되었는지 확인
 */
function validateRequired(params, required) {
    const errors = [];
    for (const param of required) {
        const value = params[param.name];
        // 값이 존재하는지 확인
        if (value === undefined || value === null || value === '') {
            errors.push(`${param.description}은(는) 필수 항목입니다.`);
            continue;
        }
        // 커스텀 검증기 실행
        if (param.validator) {
            const result = param.validator(value);
            if (!result.isValid) {
                errors.push(...result.errors);
            }
        }
    }
    return {
        isValid: errors.length === 0,
        errors,
        value: errors.length === 0 ? params : undefined
    };
}
/**
 * 입력값을 정제하고 이스케이프 처리
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        input = String(input);
    }
    return input
        .trim()
        .replace(/[\x00-\x1f\x7f]/g, '') // 제어 문자 제거
        .replace(/[<>]/g, '') // HTML 태그 방지
        .substring(0, 1000); // 최대 길이 제한
}
/**
 * 사용자 친화적 오류 메시지 생성
 */
function formatErrorMessage(error, context, suggestions) {
    const message = error instanceof Error ? error.message : error;
    let formatted = `❌ 오류: ${message}`;
    if (context) {
        formatted += `\n📍 컨텍스트: ${context}`;
    }
    if (suggestions && suggestions.length > 0) {
        formatted += '\n\n💡 제안사항:';
        suggestions.forEach((suggestion, index) => {
            formatted += `\n  ${index + 1}. ${suggestion}`;
        });
    }
    return formatted;
}
/**
 * 대화형 프롬프트를 위한 입력 검증
 */
async function validateInteractiveInput(value, validators) {
    const errors = [];
    for (const validator of validators) {
        const result = validator(value);
        if (!result.isValid) {
            errors.push(...result.errors);
        }
    }
    return {
        isValid: errors.length === 0,
        errors,
        value: errors.length === 0 ? value : undefined
    };
}
/**
 * 커맨드 라인 옵션의 타입 안전 접근
 */
function getOptionValue(options, key, defaultValue) {
    const value = options[key];
    return value !== undefined ? value : defaultValue;
}
/**
 * 여러 입력 소스에서 값 우선순위 결정
 */
function resolveValue(...sources) {
    return sources.find(source => source !== undefined && source !== null);
}
/**
 * 배열 형태의 입력을 파싱 (콤마 구분)
 */
function parseArrayInput(input) {
    if (Array.isArray(input)) {
        return input;
    }
    if (typeof input !== 'string') {
        return [];
    }
    return input
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
}
//# sourceMappingURL=input.js.map