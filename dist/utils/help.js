"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.helpFormatter = exports.HelpFormatter = void 0;
const chalk_1 = __importDefault(require("chalk"));
/**
 * 도움말 포맷터 클래스
 */
class HelpFormatter {
    /**
     * 명령어 도움말을 포맷팅
     */
    formatCommandHelp(help) {
        const sections = [];
        // 제목과 설명
        sections.push(this.formatHeader(help.name, help.description));
        // 사용법
        sections.push(this.formatUsage(help.usage));
        // 인자
        if (help.arguments && help.arguments.length > 0) {
            sections.push(this.formatArguments(help.arguments));
        }
        // 옵션
        if (help.options && help.options.length > 0) {
            sections.push(this.formatOptions(help.options));
        }
        // 예제
        if (help.examples && help.examples.length > 0) {
            sections.push(this.formatExamples(help.examples));
        }
        // 관련 명령어
        if (help.related && help.related.length > 0) {
            sections.push(this.formatRelated(help.related));
        }
        // 주의사항
        if (help.notes && help.notes.length > 0) {
            sections.push(this.formatNotes(help.notes));
        }
        return sections.join('\n\n');
    }
    /**
     * 헤더 포맷팅
     */
    formatHeader(name, description) {
        return [
            chalk_1.default.bold.blue(`dooray-ai ${name}`),
            '',
            chalk_1.default.white(description)
        ].join('\n');
    }
    /**
     * 사용법 포맷팅
     */
    formatUsage(usage) {
        return [
            chalk_1.default.bold.yellow('사용법:'),
            `  ${chalk_1.default.cyan(usage)}`
        ].join('\n');
    }
    /**
     * 인자 포맷팅
     */
    formatArguments(args) {
        const lines = [chalk_1.default.bold.yellow('인자:')];
        args.forEach(arg => {
            const required = arg.required ? chalk_1.default.red('(필수)') : chalk_1.default.gray('(선택)');
            const type = arg.type ? chalk_1.default.gray(`[${arg.type}]`) : '';
            lines.push(`  ${chalk_1.default.cyan(arg.name)} ${required} ${type}`);
            lines.push(`    ${chalk_1.default.white(arg.description)}`);
        });
        return lines.join('\n');
    }
    /**
     * 옵션 포맷팅
     */
    formatOptions(options) {
        const lines = [chalk_1.default.bold.yellow('옵션:')];
        // 플래그 부분의 최대 길이 계산
        const maxFlagLength = Math.max(...options.map(opt => {
            const short = opt.short ? `-${opt.short}, ` : '';
            const long = `--${opt.long}`;
            const type = opt.type && opt.type !== 'boolean' ? ` <${opt.type}>` : '';
            return `${short}${long}${type}`.length;
        }));
        options.forEach(option => {
            const short = option.short ? `-${option.short}, ` : '    ';
            const long = `--${option.long}`;
            const type = option.type && option.type !== 'boolean' ? ` <${option.type}>` : '';
            const flagStr = `${short}${long}${type}`;
            const padding = ' '.repeat(Math.max(2, maxFlagLength - flagStr.length + 4));
            let description = option.description;
            if (option.default !== undefined) {
                description += chalk_1.default.gray(` (기본값: ${option.default})`);
            }
            if (option.choices) {
                description += chalk_1.default.gray(` [${option.choices.join('|')}]`);
            }
            lines.push(`  ${chalk_1.default.cyan(flagStr)}${padding}${chalk_1.default.white(description)}`);
        });
        return lines.join('\n');
    }
    /**
     * 예제 포맷팅
     */
    formatExamples(examples) {
        const lines = [chalk_1.default.bold.yellow('예제:')];
        examples.forEach((example, index) => {
            if (index > 0)
                lines.push('');
            lines.push(`  ${chalk_1.default.gray('# ' + example.description)}`);
            lines.push(`  ${chalk_1.default.green('$')} ${chalk_1.default.white(example.command)}`);
            if (example.output) {
                lines.push('');
                example.output.split('\n').forEach(line => {
                    lines.push(`  ${chalk_1.default.gray(line)}`);
                });
            }
        });
        return lines.join('\n');
    }
    /**
     * 관련 명령어 포맷팅
     */
    formatRelated(related) {
        const lines = [chalk_1.default.bold.yellow('관련 명령어:')];
        related.forEach(command => {
            lines.push(`  ${chalk_1.default.cyan(command)}`);
        });
        lines.push('');
        lines.push(chalk_1.default.gray('자세한 내용은 "dooray-ai help <command>"를 사용하세요.'));
        return lines.join('\n');
    }
    /**
     * 주의사항 포맷팅
     */
    formatNotes(notes) {
        const lines = [chalk_1.default.bold.yellow('주의사항:')];
        notes.forEach(note => {
            lines.push(`  ${chalk_1.default.yellow('⚠️')} ${chalk_1.default.white(note)}`);
        });
        return lines.join('\n');
    }
    /**
     * 오류 도움말 포맷팅
     */
    formatErrorHelp(errorCode, suggestion) {
        const lines = [
            chalk_1.default.bold.red(`오류 ${errorCode}에 대한 도움말:`),
            ''
        ];
        if (suggestion) {
            lines.push(chalk_1.default.white(suggestion));
            lines.push('');
        }
        lines.push(chalk_1.default.gray('더 많은 도움이 필요하시면:'));
        lines.push(`  ${chalk_1.default.cyan('dooray-ai --help')} - 전체 명령어 목록`);
        lines.push(`  ${chalk_1.default.cyan('dooray-ai help <command>')} - 특정 명령어 도움말`);
        return lines.join('\n');
    }
    /**
     * 빠른 시작 가이드 포맷팅
     */
    formatQuickStart() {
        return [
            chalk_1.default.bold.blue('🚀 dooray-ai 빠른 시작 가이드'),
            '',
            chalk_1.default.bold.yellow('1. 프로젝트 초기화'),
            `   ${chalk_1.default.green('$')} ${chalk_1.default.white('dooray-ai init')}`,
            '',
            chalk_1.default.bold.yellow('2. 설정 구성'),
            `   ${chalk_1.default.green('$')} ${chalk_1.default.white('dooray-ai config')}`,
            '',
            chalk_1.default.bold.yellow('3. 작업 생성'),
            `   ${chalk_1.default.green('$')} ${chalk_1.default.white('dooray-ai task create "새로운 기능 구현"')}`,
            '',
            chalk_1.default.bold.yellow('4. 도움말'),
            `   ${chalk_1.default.green('$')} ${chalk_1.default.white('dooray-ai --help')}`,
            `   ${chalk_1.default.green('$')} ${chalk_1.default.white('dooray-ai help <command>')}`,
            '',
            chalk_1.default.gray('자세한 문서: https://github.com/dooray/dooray-ai')
        ].join('\n');
    }
}
exports.HelpFormatter = HelpFormatter;
/**
 * 전역 도움말 포맷터 인스턴스
 */
exports.helpFormatter = new HelpFormatter();
//# sourceMappingURL=help.js.map