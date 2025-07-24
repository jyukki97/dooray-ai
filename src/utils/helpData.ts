import { CommandHelp } from './help';

/**
 * init 명령어 도움말
 */
export const initHelp: CommandHelp = {
  name: 'init',
  description: 'dooray-ai를 현재 프로젝트에 초기화하고 설정 파일을 생성합니다.',
  usage: 'dooray-ai init [options]',
  options: [
    {
      short: 'f',
      long: 'force',
      description: '기존 설정 파일이 있어도 덮어씁니다'
    },
    {
      short: 't',
      long: 'template',
      description: '설정 템플릿을 선택합니다',
      type: 'string',
      default: 'default',
      choices: ['default', 'minimal', 'advanced']
    }
  ],
  examples: [
    {
      command: 'dooray-ai init',
      description: '기본 설정으로 초기화',
      output: '✅ dooray-ai initialized successfully!\n📁 Configuration saved to: ~/.dooray-ai/config.json'
    },
    {
      command: 'dooray-ai init --force',
      description: '기존 설정을 덮어쓰며 초기화'
    },
    {
      command: 'dooray-ai init --template advanced',
      description: '고급 설정 템플릿으로 초기화'
    }
  ],
  related: ['config', 'help'],
  notes: [
    '홈 디렉토리에 ~/.dooray-ai/config.json 파일이 생성됩니다.',
    '초기화 후 "dooray-ai config" 명령어로 상세 설정을 구성하세요.'
  ]
};

/**
 * config 명령어 도움말
 */
export const configHelp: CommandHelp = {
  name: 'config',
  description: 'dooray-ai 설정을 관리합니다.',
  usage: 'dooray-ai config [options]',
  options: [
    {
      short: 'g',
      long: 'get',
      description: '설정값을 조회합니다',
      type: 'string'
    },
    {
      short: 's',
      long: 'set',
      description: '설정값을 변경합니다 (key=value 형식)',
      type: 'string'
    },
    {
      short: 'l',
      long: 'list',
      description: '모든 설정을 출력합니다'
    },
    {
      short: 'r',
      long: 'reset',
      description: '설정을 초기화합니다'
    }
  ],
  examples: [
    {
      command: 'dooray-ai config',
      description: '대화형 설정 모드로 진입'
    },
    {
      command: 'dooray-ai config --list',
      description: '현재 모든 설정 출력'
    },
    {
      command: 'dooray-ai config --get dooray.apiKey',
      description: 'Dooray API 키 조회'
    },
    {
      command: 'dooray-ai config --set dooray.apiKey=your-api-key',
      description: 'Dooray API 키 설정'
    }
  ],
  related: ['init', 'help'],
  notes: [
    'API 키와 같은 민감한 정보는 안전하게 암호화되어 저장됩니다.',
    '설정 변경 후에는 CLI를 다시 시작해야 적용됩니다.'
  ]
};

/**
 * task create 명령어 도움말
 */
export const taskCreateHelp: CommandHelp = {
  name: 'task create',
  description: '새로운 작업을 생성하고 해당 브랜치를 만듭니다.',
  usage: 'dooray-ai task create [description] [options]',
  arguments: [
    {
      name: 'description',
      description: '작업 설명 (3-200자)',
      required: false,
      type: 'string'
    }
  ],
  options: [
    {
      short: 'b',
      long: 'branch',
      description: '사용자 정의 브랜치 이름',
      type: 'string'
    },
    {
      short: 'p',
      long: 'priority',
      description: '작업 우선순위',
      type: 'string',
      default: 'medium',
      choices: ['low', 'medium', 'high']
    },
    {
      long: 'no-branch',
      description: '브랜치를 생성하지 않습니다'
    }
  ],
  examples: [
    {
      command: 'dooray-ai task create "사용자 로그인 기능 구현"',
      description: '작업 설명과 함께 새 작업 생성'
    },
    {
      command: 'dooray-ai task create --priority high',
      description: '높은 우선순위로 작업 생성 (대화형)'
    },
    {
      command: 'dooray-ai task create "버그 수정" --branch fix/login-bug',
      description: '커스텀 브랜치 이름으로 작업 생성'
    },
    {
      command: 'dooray-ai task create "문서 작업" --no-branch',
      description: '브랜치 없이 작업만 생성'
    }
  ],
  related: ['task list', 'task update', 'branch create'],
  notes: [
    '작업 설명이 없으면 대화형 모드로 입력받습니다.',
    '브랜치 이름은 자동으로 안전한 형식으로 변환됩니다.',
    'Git 저장소가 초기화되어 있어야 브랜치가 생성됩니다.'
  ]
};

/**
 * task list 명령어 도움말
 */
export const taskListHelp: CommandHelp = {
  name: 'task list',
  description: 'Dooray! 작업 목록을 조회합니다.',
  usage: 'dooray-ai task list [options]',
  options: [
    {
      short: 's',
      long: 'status',
      description: '상태별 필터링',
      type: 'string',
      default: 'open',
      choices: ['open', 'closed', 'all']
    },
    {
      short: 'a',
      long: 'assignee',
      description: '담당자별 필터링',
      type: 'string'
    },
    {
      short: 'l',
      long: 'limit',
      description: '결과 개수 제한',
      type: 'number',
      default: 10
    }
  ],
  examples: [
    {
      command: 'dooray-ai task list',
      description: '열린 작업 목록 조회 (기본 10개)'
    },
    {
      command: 'dooray-ai task list --status all --limit 20',
      description: '모든 상태의 작업 20개 조회'
    },
    {
      command: 'dooray-ai task list --assignee john.doe',
      description: 'john.doe가 담당하는 작업만 조회'
    }
  ],
  related: ['task create', 'task update', 'task sync'],
  notes: [
    'Dooray! API 키가 설정되어 있어야 합니다.',
    '프로젝트 ID가 구성되어 있어야 해당 프로젝트의 작업을 조회할 수 있습니다.'
  ]
};

/**
 * 전체 명령어 도움말 맵
 */
export const helpData = {
  init: initHelp,
  config: configHelp,
  'task create': taskCreateHelp,
  'task list': taskListHelp,
};

/**
 * 명령어 카테고리별 그룹핑
 */
export const commandCategories = {
  '초기화': ['init', 'config'],
  '작업 관리': ['task create', 'task list', 'task update', 'task sync'],
  '브랜치 관리': ['branch create', 'branch switch', 'branch cleanup'],
  'PR 관리': ['pr create', 'pr update'],
  '기타': ['help', 'test']
}; 