# 🤖 Dooray AI - AI 기반 개발 자동화 CLI 도구

[![Version](https://img.shields.io/npm/v/dooray-ai)](https://npmjs.com/package/dooray-ai)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

> **Dooray!와 연동하여 자연어 기반 태스크를 처리하고, Git 브랜치 생성부터 코드 자동 생성, 커밋, PR 생성까지 자동화하는 AI 기반 개발 도구입니다.**

## ✨ 주요 기능

- 🎯 **자연어 기반 작업 처리**: "사용자 로그인 기능 추가"와 같은 자연어 명령으로 전체 개발 워크플로우 자동화
- 🔗 **Dooray! 완벽 연동**: Dooray! 태스크를 기반으로 자동 개발 워크플로우 수행
- 🧠 **AI 코드 생성**: Claude Code, GPT 등 최신 AI 모델을 활용한 스마트 코드 생성
- 🌿 **Git 자동화**: 브랜치 생성, 커밋, 푸시까지 완전 자동화
- 📝 **PR 자동 생성**: GitHub API를 통한 Pull Request 자동 생성 및 설명 작성
- 🎨 **VS Code 확장**: IDE와 완벽 통합된 개발 환경 제공
- ⚡ **실시간 협업**: WebSocket 기반 실시간 팀 협업 지원

## 🚀 빠른 시작

### 설치

```bash
# npm을 통한 전역 설치
npm install -g dooray-ai

# 또는 yarn 사용
yarn global add dooray-ai
```

### 초기 설정

```bash
# 프로젝트 초기화
dooray-ai init

# Dooray! 인증 설정
dooray-ai auth login

# AI 모델 설정
dooray-ai config set-ai-provider claude
```

### 기본 사용법

```bash
# 자연어로 작업 명령
dooray-ai "사용자 로그인 기능 추가"

# Dooray! 태스크 기반 작업
dooray-ai task --id 12345

# 브랜치 생성 및 전환
dooray-ai branch create feat/user-authentication

# AI 코드 생성
dooray-ai ai generate --prompt "JWT 인증 미들웨어 생성"

# PR 자동 생성
dooray-ai pr create --auto-description
```

## 📖 주요 명령어

### 🏗️ 프로젝트 관리
```bash
dooray-ai init                    # 프로젝트 초기화
dooray-ai config <key> <value>    # 설정 관리
dooray-ai auth login              # 인증 설정
dooray-ai status                  # 프로젝트 상태 확인
```

### 📋 태스크 관리
```bash
dooray-ai task list               # 태스크 목록 조회
dooray-ai task show <id>          # 태스크 상세 정보
dooray-ai task create <title>     # 새 태스크 생성
dooray-ai task update <id>        # 태스크 상태 업데이트
```

### 🌿 Git 브랜치 관리
```bash
dooray-ai branch create <name>    # 새 브랜치 생성
dooray-ai branch switch <name>    # 브랜치 전환
dooray-ai branch cleanup          # 병합된 브랜치 정리
dooray-ai branch list             # 브랜치 목록
```

### 🤖 AI 코드 생성
```bash
dooray-ai ai generate             # 대화형 코드 생성
dooray-ai ai claude <prompt>      # Claude를 통한 코드 생성
dooray-ai ai review               # AI 코드 리뷰
dooray-ai ai optimize             # 코드 최적화 제안
```

### 🔄 워크플로우 자동화
```bash
dooray-ai workflow run            # 전체 워크플로우 실행
dooray-ai workflow create         # 커스텀 워크플로우 생성
dooray-ai workflow list           # 워크플로우 목록
```

### 📝 Pull Request 관리
```bash
dooray-ai pr create               # PR 생성
dooray-ai pr update <number>      # PR 업데이트
dooray-ai pr list                 # PR 목록
```

## 🔧 설정

### 환경 변수

`.env` 파일 또는 시스템 환경 변수로 설정:

```bash
# AI 서비스 API 키
ANTHROPIC_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key

# Dooray! API 설정
DOORAY_API_TOKEN=your_dooray_token
DOORAY_DOMAIN=your_company.dooray.com

# GitHub 설정
GITHUB_TOKEN=your_github_token

# 기타 설정
LOG_LEVEL=info
AI_MODEL_PREFERENCE=claude
```

### 설정 파일

`~/.dooray-ai/config.json`:

```json
{
  "ai": {
    "provider": "claude",
    "model": "claude-3-sonnet-20240229",
    "temperature": 0.7,
    "maxTokens": 4000
  },
  "dooray": {
    "domain": "your-company.dooray.com",
    "defaultProject": "12345"
  },
  "git": {
    "defaultBranch": "main",
    "branchPrefix": "feat/",
    "autoCommit": true,
    "autoPush": true
  },
  "github": {
    "owner": "your-username",
    "repo": "your-repo",
    "autoCreatePR": true
  }
}
```

## 🎨 VS Code 확장

Dooray AI는 VS Code 확장으로도 사용할 수 있습니다:

1. VS Code 마켓플레이스에서 "Dooray AI" 검색
2. 설치 후 `Ctrl+Shift+P` → "Dooray AI: 시작하기"
3. 코드 에디터에서 `Ctrl+Shift+D`로 AI 코드 생성 실행

### 확장 기능
- 🔗 **실시간 CLI 연동**: WebSocket을 통한 실시간 통신
- 📝 **컨텍스트 인식**: 현재 편집 중인 파일의 컨텍스트 자동 인식
- 🎯 **선택 영역 처리**: 선택된 코드 영역에 대한 AI 처리
- 📊 **작업 진행 상황**: 사이드바에서 작업 진행 상황 실시간 모니터링

## 🔄 워크플로우 예시

### 전체 자동화 워크플로우

```bash
# 1. 자연어 명령으로 전체 워크플로우 실행
dooray-ai "사용자 인증 API 개발"

# 내부적으로 다음과 같이 실행됨:
# 1. 브랜치 생성: feat/user-authentication-api
# 2. AI를 통한 코드 생성
# 3. 파일 생성/수정
# 4. 테스트 코드 생성
# 5. Git 커밋 및 푸시
# 6. GitHub PR 생성
# 7. Dooray! 태스크 상태 업데이트
```

### 단계별 워크플로우

```bash
# 1. 태스크 확인
dooray-ai task show 12345

# 2. 브랜치 생성
dooray-ai branch create feat/user-auth

# 3. AI 코드 생성
dooray-ai ai generate --context "Express.js JWT 인증"

# 4. 변경사항 커밋
git add . && git commit -m "feat: JWT 인증 구현"

# 5. PR 생성
dooray-ai pr create --title "사용자 JWT 인증 기능 구현"

# 6. 태스크 상태 업데이트
dooray-ai task update 12345 --status completed
```

## 🧪 테스트

```bash
# 전체 테스트 실행
npm test

# 특정 테스트 실행
npm test -- --testNamePattern="CLI"

# 테스트 커버리지 확인
npm run test:coverage

# 변경사항 감지 모드
npm run test:watch
```

## 🛠️ 개발

### 로컬 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/your-username/dooray-ai.git
cd dooray-ai

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 링크 생성 (로컬 테스트용)
npm link
```

### 프로젝트 구조

```
dooray-ai/
├── src/
│   ├── cli.ts                 # CLI 진입점
│   ├── commands/              # CLI 명령어들
│   │   ├── ai/               # AI 관련 명령어
│   │   ├── task/             # 태스크 관리 명령어
│   │   ├── branch/           # 브랜치 관리 명령어
│   │   └── pr/               # PR 관리 명령어
│   ├── services/             # 핵심 서비스들
│   │   ├── ai/               # AI 서비스 (Claude, GPT 등)
│   │   ├── dooray/           # Dooray! API 클라이언트
│   │   ├── git/              # Git 작업 클라이언트
│   │   ├── github/           # GitHub API 클라이언트
│   │   └── workflow/         # 워크플로우 엔진
│   ├── extension/            # VS Code 확장
│   ├── utils/                # 유틸리티 함수들
│   └── types/                # TypeScript 타입 정의
├── docs/                     # 문서
├── tests/                    # 테스트 파일들
└── generated-code/           # AI 생성 코드 예시
```

## 🤝 기여하기

Dooray AI는 오픈소스 프로젝트입니다. 기여를 환영합니다!

1. 저장소를 Fork 합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'feat: amazing feature 추가'`)
4. 브랜치에 Push 합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

### 기여 가이드라인

- 코드 스타일: ESLint + Prettier 설정을 따라주세요
- 커밋 메시지: Conventional Commits 형식을 사용해주세요
- 테스트: 새로운 기능에는 반드시 테스트를 추가해주세요
- 문서: 새로운 기능이나 변경사항은 문서를 업데이트해주세요

## 📜 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🔗 관련 링크

- [공식 문서](https://dooray-ai-docs.com)
- [GitHub 저장소](https://github.com/your-username/dooray-ai)
- [npm 패키지](https://npmjs.com/package/dooray-ai)
- [이슈 트래커](https://github.com/your-username/dooray-ai/issues)
- [변경 로그](CHANGELOG.md)

## 💬 지원 및 커뮤니티

- 🐛 [버그 리포트](https://github.com/your-username/dooray-ai/issues/new?template=bug_report.md)
- 💡 [기능 요청](https://github.com/your-username/dooray-ai/issues/new?template=feature_request.md)
- 💬 [디스커션](https://github.com/your-username/dooray-ai/discussions)
- 📧 [이메일 지원](mailto:support@dooray-ai.com)

---

**Dooray AI와 함께 AI 기반 개발 자동화의 새로운 경험을 시작하세요! 🚀**