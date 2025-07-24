# 📝 Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 포괄적인 프로젝트 문서화 (README.md)
- 프로젝트 상태 확인 명령어 (`dooray-ai status`)
- 고급 설정 관리 시스템
- 설정 마법사 기능
- 설정 백업 및 복원 기능
- 설정 검증 기능

### Enhanced
- CLI 명령어 구조 개선
- 오류 처리 및 로깅 시스템 강화
- TypeScript 타입 정의 확장

## [0.1.0] - 2024-12-24

### Added
- 🎯 **AI 기반 코드 생성 기능**
  - Claude Code API 연동
  - OpenAI GPT API 연동
  - AI 엔진 자동 선택 기능
  - 폴백 핸들러 구현

- 🔗 **Dooray! 완벽 연동**
  - Dooray! API 클라이언트 구현
  - 프로젝트 및 태스크 관리 기능
  - 태스크 상태 자동 업데이트
  - Dooray! 웹훅 지원

- 🎨 **VS Code 확장 프로그램**
  - IDE와 실시간 통신을 위한 WebSocket 서버
  - 파일 감시 및 자동 동기화
  - 명령어 팔레트 통합
  - 컨텍스트 메뉴 통합

- 🌿 **Git 자동화 기능**
  - 브랜치 자동 생성 및 관리
  - 스마트 커밋 메시지 생성
  - 자동 커밋 및 푸시 기능
  - Git 상태 모니터링

- 📝 **GitHub 연동**
  - Pull Request 자동 생성
  - PR 설명 자동 작성
  - 라벨 및 Assignee 자동 설정
  - GitHub API 완전 지원

- 🔄 **워크플로우 자동화**
  - 전체 개발 워크플로우 자동화 엔진
  - 커스텀 워크플로우 지원
  - 병렬 작업 처리
  - 작업 진행 상황 추적

- 🏗️ **CLI 인터페이스**
  - 직관적인 명령어 구조
  - 대화형 설정 모드
  - 상세한 도움말 시스템
  - 다국어 지원 (한국어/영어)

- 🔧 **고급 설정 시스템**
  - 프로젝트별 설정 관리
  - 전역 설정 지원
  - 환경 변수 통합
  - 설정 유효성 검사

- 🧪 **테스트 프레임워크**
  - Jest 기반 단위 테스트
  - CLI 명령어 테스트
  - 로거 시스템 테스트
  - 자동화된 테스트 실행

- 📊 **모니터링 및 로깅**
  - 구조화된 로깅 시스템
  - 다양한 로그 레벨 지원
  - 컬러 출력 지원
  - 성능 모니터링

### Technical Improvements
- **Architecture**: 모듈화된 아키텍처 설계
- **TypeScript**: 완전한 타입 안전성 보장
- **Error Handling**: 포괄적인 오류 처리 시스템
- **Configuration**: 계층적 설정 관리 시스템
- **Security**: API 키 및 인증 정보 보안 관리
- **Performance**: 비동기 처리 및 성능 최적화
- **Maintainability**: 클린 코드 원칙 적용

### Developer Experience
- **Hot Reload**: 개발 중 자동 재시작
- **TypeScript**: 타입 안전성과 IntelliSense 지원
- **ESLint & Prettier**: 코드 품질 및 일관성 유지
- **NPM Scripts**: 편리한 빌드 및 개발 스크립트
- **VS Code Integration**: 개발 환경 완벽 통합

### Dependencies
- **Runtime Dependencies**:
  - `axios ^1.6.2` - HTTP 클라이언트
  - `chalk ^4.1.2` - 터미널 컬러 출력
  - `commander ^11.1.0` - CLI 프레임워크
  - `fs-extra ^11.2.0` - 파일 시스템 유틸리티
  - `inquirer ^9.2.12` - 대화형 프롬프트
  - `ora ^5.4.1` - 스피너 및 로딩 인디케이터
  - `simple-git ^3.20.0` - Git 작업 클라이언트
  - `ws ^8.16.0` - WebSocket 서버

- **Development Dependencies**:
  - TypeScript 완전 지원
  - Jest 테스트 프레임워크
  - ESLint + Prettier 코드 품질 도구
  - VS Code 확장 개발 도구

## [0.0.1] - 2024-12-20

### Added
- 초기 프로젝트 설정
- 기본 CLI 구조 구현
- TypeScript 설정
- 개발 환경 구축

---

## 📋 변경사항 카테고리

- **Added**: 새로운 기능
- **Changed**: 기존 기능의 변경
- **Deprecated**: 곧 제거될 기능
- **Removed**: 제거된 기능
- **Fixed**: 버그 수정
- **Security**: 보안 관련 변경
- **Enhanced**: 기능 개선

## 🔗 관련 링크

- [GitHub 저장소](https://github.com/your-username/dooray-ai)
- [이슈 트래커](https://github.com/your-username/dooray-ai/issues)
- [기여 가이드](CONTRIBUTING.md)
- [라이선스](LICENSE) 