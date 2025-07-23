# Dooray-AI 아키텍처 설계

## 📁 프로젝트 구조

```
dooray-ai/
├── src/
│   ├── cli.ts                  # CLI 메인 엔트리 포인트
│   ├── commands/               # CLI 명령어 구현
│   ├── services/              # 비즈니스 로직 서비스
│   ├── models/                # 데이터 모델 정의
│   ├── interfaces/            # 외부 시스템 인터페이스
│   ├── types/                 # TypeScript 타입 정의
│   ├── config/                # 설정 관리
│   ├── utils/                 # 공통 유틸리티
│   ├── middleware/            # 미들웨어 (인증, 로깅 등)
│   ├── validators/            # 입력 검증
│   ├── constants/             # 상수 정의
│   └── __tests__/             # 테스트 파일
├── dist/                      # 컴파일된 JavaScript
├── .taskmaster/               # Task Master 설정
├── docs/                      # 프로젝트 문서
└── config files...            # 설정 파일들
```

## 🏗️ 아키텍처 원칙

### 1. 계층 분리 (Layered Architecture)
- **CLI Layer**: 사용자 인터페이스 및 명령어 처리
- **Service Layer**: 비즈니스 로직 및 워크플로우
- **Interface Layer**: 외부 API 연동 (Dooray!, GitHub, AI)
- **Model Layer**: 데이터 구조 및 타입 정의

### 2. 의존성 주입 (Dependency Injection)
- 서비스 간 느슨한 결합
- 테스트 가능성 향상
- 모듈 간 재사용성 증대

### 3. 단일 책임 원칙 (Single Responsibility)
- 각 모듈은 하나의 명확한 책임
- 유지보수성 및 확장성 향상

## 📦 모듈 역할 정의

### commands/
- CLI 명령어별 구현
- 각 명령어는 독립적인 파일로 관리
- 명령어 옵션 파싱 및 검증

### services/
- **GitService**: Git 작업 관리
- **AIService**: LLM API 연동
- **DoorayService**: Dooray! API 연동
- **GitHubService**: GitHub API 연동
- **CodeGeneratorService**: 코드 생성 로직
- **LoggerService**: 로깅 관리

### interfaces/
- 외부 시스템과의 인터페이스 정의
- API 클라이언트 구현
- 응답 데이터 변환

### models/
- 데이터 구조 정의
- 도메인 객체 모델
- 검증 로직 포함

### middleware/
- 인증 미들웨어
- 로깅 미들웨어
- 에러 핸들링
- 요청 검증

### validators/
- 입력 데이터 검증
- 스키마 검증
- 커스텀 검증 규칙

### constants/
- 애플리케이션 상수
- 환경 변수 기본값
- 메시지 템플릿
- API 엔드포인트

## 🔄 데이터 흐름

```
User Input → CLI → Command → Service → Interface → External API
                    ↓           ↓         ↓
                 Validator → Model → Logger
```

## 🧪 테스트 전략

- **Unit Tests**: 각 서비스 및 유틸리티
- **Integration Tests**: API 연동 테스트
- **E2E Tests**: 전체 워크플로우 테스트
- **Mock**: 외부 의존성 모킹

## 🔧 확장성 고려사항

- 플러그인 시스템 지원
- 설정 기반 동작 변경
- 다양한 외부 시스템 연동 지원
- 성능 최적화 및 캐싱 