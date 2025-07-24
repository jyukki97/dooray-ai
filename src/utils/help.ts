import chalk from 'chalk';

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
export class HelpFormatter {
  
  /**
   * 명령어 도움말을 포맷팅
   */
  formatCommandHelp(help: CommandHelp): string {
    const sections: string[] = [];

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
  private formatHeader(name: string, description: string): string {
    return [
      chalk.bold.blue(`dooray-ai ${name}`),
      '',
      chalk.white(description)
    ].join('\n');
  }

  /**
   * 사용법 포맷팅
   */
  private formatUsage(usage: string): string {
    return [
      chalk.bold.yellow('사용법:'),
      `  ${chalk.cyan(usage)}`
    ].join('\n');
  }

  /**
   * 인자 포맷팅
   */
  private formatArguments(args: ArgumentHelp[]): string {
    const lines = [chalk.bold.yellow('인자:')];
    
    args.forEach(arg => {
      const required = arg.required ? chalk.red('(필수)') : chalk.gray('(선택)');
      const type = arg.type ? chalk.gray(`[${arg.type}]`) : '';
      lines.push(`  ${chalk.cyan(arg.name)} ${required} ${type}`);
      lines.push(`    ${chalk.white(arg.description)}`);
    });

    return lines.join('\n');
  }

  /**
   * 옵션 포맷팅
   */
  private formatOptions(options: OptionHelp[]): string {
    const lines = [chalk.bold.yellow('옵션:')];
    
    // 플래그 부분의 최대 길이 계산
    const maxFlagLength = Math.max(
      ...options.map(opt => {
        const short = opt.short ? `-${opt.short}, ` : '';
        const long = `--${opt.long}`;
        const type = opt.type && opt.type !== 'boolean' ? ` <${opt.type}>` : '';
        return `${short}${long}${type}`.length;
      })
    );

    options.forEach(option => {
      const short = option.short ? `-${option.short}, ` : '    ';
      const long = `--${option.long}`;
      const type = option.type && option.type !== 'boolean' ? ` <${option.type}>` : '';
      const flagStr = `${short}${long}${type}`;
      const padding = ' '.repeat(Math.max(2, maxFlagLength - flagStr.length + 4));
      
      let description = option.description;
      if (option.default !== undefined) {
        description += chalk.gray(` (기본값: ${option.default})`);
      }
      if (option.choices) {
        description += chalk.gray(` [${option.choices.join('|')}]`);
      }

      lines.push(`  ${chalk.cyan(flagStr)}${padding}${chalk.white(description)}`);
    });

    return lines.join('\n');
  }

  /**
   * 예제 포맷팅
   */
  private formatExamples(examples: ExampleHelp[]): string {
    const lines = [chalk.bold.yellow('예제:')];
    
    examples.forEach((example, index) => {
      if (index > 0) lines.push('');
      
      lines.push(`  ${chalk.gray('# ' + example.description)}`);
      lines.push(`  ${chalk.green('$')} ${chalk.white(example.command)}`);
      
      if (example.output) {
        lines.push('');
        example.output.split('\n').forEach(line => {
          lines.push(`  ${chalk.gray(line)}`);
        });
      }
    });

    return lines.join('\n');
  }

  /**
   * 관련 명령어 포맷팅
   */
  private formatRelated(related: string[]): string {
    const lines = [chalk.bold.yellow('관련 명령어:')];
    
    related.forEach(command => {
      lines.push(`  ${chalk.cyan(command)}`);
    });
    
    lines.push('');
    lines.push(chalk.gray('자세한 내용은 "dooray-ai help <command>"를 사용하세요.'));

    return lines.join('\n');
  }

  /**
   * 주의사항 포맷팅
   */
  private formatNotes(notes: string[]): string {
    const lines = [chalk.bold.yellow('주의사항:')];
    
    notes.forEach(note => {
      lines.push(`  ${chalk.yellow('⚠️')} ${chalk.white(note)}`);
    });

    return lines.join('\n');
  }

  /**
   * 오류 도움말 포맷팅
   */
  formatErrorHelp(errorCode: string, suggestion?: string): string {
    const lines = [
      chalk.bold.red(`오류 ${errorCode}에 대한 도움말:`),
      ''
    ];

    if (suggestion) {
      lines.push(chalk.white(suggestion));
      lines.push('');
    }

    lines.push(chalk.gray('더 많은 도움이 필요하시면:'));
    lines.push(`  ${chalk.cyan('dooray-ai --help')} - 전체 명령어 목록`);
    lines.push(`  ${chalk.cyan('dooray-ai help <command>')} - 특정 명령어 도움말`);

    return lines.join('\n');
  }

  /**
   * 빠른 시작 가이드 포맷팅
   */
  formatQuickStart(): string {
    return [
      chalk.bold.blue('🚀 dooray-ai 빠른 시작 가이드'),
      '',
      chalk.bold.yellow('1. 프로젝트 초기화'),
      `   ${chalk.green('$')} ${chalk.white('dooray-ai init')}`,
      '',
      chalk.bold.yellow('2. 설정 구성'),
      `   ${chalk.green('$')} ${chalk.white('dooray-ai config')}`,
      '',
      chalk.bold.yellow('3. 작업 생성'),
      `   ${chalk.green('$')} ${chalk.white('dooray-ai task create "새로운 기능 구현"')}`,
      '',
      chalk.bold.yellow('4. 도움말'),
      `   ${chalk.green('$')} ${chalk.white('dooray-ai --help')}`,
      `   ${chalk.green('$')} ${chalk.white('dooray-ai help <command>')}`,
      '',
      chalk.gray('자세한 문서: https://github.com/dooray/dooray-ai')
    ].join('\n');
  }
}

/**
 * 전역 도움말 포맷터 인스턴스
 */
export const helpFormatter = new HelpFormatter(); 