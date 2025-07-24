/**
 * 명령어 도움말 정보 구조
 */
export interface CommandHelp {
    name: string;
    description: string;
    usage: string;
    arguments?: ArgumentHelp[];
    options?: OptionHelp[];
    examples?: ExampleHelp[];
    related?: string[];
    notes?: string[];
}
/**
 * 인자 도움말 정보
 */
export interface ArgumentHelp {
    name: string;
    description: string;
    required: boolean;
    type?: string;
}
/**
 * 옵션 도움말 정보
 */
export interface OptionHelp {
    short?: string;
    long: string;
    description: string;
    type?: string;
    default?: any;
    choices?: string[];
}
/**
 * 예제 도움말 정보
 */
export interface ExampleHelp {
    command: string;
    description: string;
    output?: string;
}
/**
 * 도움말 포맷터 클래스
 */
export declare class HelpFormatter {
    /**
     * 명령어 도움말을 포맷팅
     */
    formatCommandHelp(help: CommandHelp): string;
    /**
     * 헤더 포맷팅
     */
    private formatHeader;
    /**
     * 사용법 포맷팅
     */
    private formatUsage;
    /**
     * 인자 포맷팅
     */
    private formatArguments;
    /**
     * 옵션 포맷팅
     */
    private formatOptions;
    /**
     * 예제 포맷팅
     */
    private formatExamples;
    /**
     * 관련 명령어 포맷팅
     */
    private formatRelated;
    /**
     * 주의사항 포맷팅
     */
    private formatNotes;
    /**
     * 오류 도움말 포맷팅
     */
    formatErrorHelp(errorCode: string, suggestion?: string): string;
    /**
     * 빠른 시작 가이드 포맷팅
     */
    formatQuickStart(): string;
}
/**
 * 전역 도움말 포맷터 인스턴스
 */
export declare const helpFormatter: HelpFormatter;
//# sourceMappingURL=help.d.ts.map