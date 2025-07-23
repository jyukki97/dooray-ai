# 📘 AI 기반 개발 자동화 CLI - `dooray-ai`

## 💾 개요

`dooray-ai`는 Dooray!와 연동하여 자연어 기반 타스크를 처리하고, Git 브랜치 생성부터 코드 자동 생성, 커미트, PR 생성까지 자동화하는 **CLI 기반 개발 도움이**입니다.
Anthropic의 Claude Code나 GPT 기반 AI 코딩 투드처럼, 터미널에서 명령어 한 줄로 전체 작업을 자동화하는 것을 목표로 합니다.

---

## 🌟 목적

* **Dooray! Task**를 기반으로 자동 개발 워크플로우 수행
* **CLI 한 줄 입력**으로:

  * 브랜치 생성
  * 코드 자동 작성 (LLM 활용)
  * 커미트 및 푸시
  * Pull Request 생성
  * PR 설명 자동 작성

---

## 🧰 주요 기능 화름

1. **사용자 입력**

   ```bash
   dooray-ai "사용자 로그인 기능 추가"
   ```

2. **브랜치 이름 자동 생성**

   ```
   feat/login-feature
   ```

3. **코드 콘템스트 수집**

   * 간단한 파일 구성
   * 관련 디렉터리 (예: `controllers/`, `routes/`, `services/` 등)

4. **LLM 호출**

   * GPT 또는 Claude를 통해 코드 변경사항 생성
   * 필요 시 파일 생성/수정 메어지 포함

5. **코드 반영**

   * 기존 코드 수정 또는 신규 파일 생성

6. **Git 작업**

   * 자동 add, commit, push

7. **PR 생성**

   * GitHub API 호출
   * PR 제목/보문 자동 생성 (Task 설명 기반)
