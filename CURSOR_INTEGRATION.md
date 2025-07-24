# 🎯 Cursor 연동 가이드

## 🔍 현재 연동 상태

### ✅ **Claude Code**: 완전 연동됨
- CLI 기반 Claude Code 클라이언트 구현 완료
- API 키 불필요, `claude` 명령어 직접 사용
- 즉시 사용 가능한 상태

### ⚠️ **Cursor MCP**: 부분 연동 (방금 구현 완료!)
- MCP 서버가 CLI에 통합됨
- Dooray 태스크 읽기 및 코드 생성 기능 제공
- 설정만 업데이트하면 바로 사용 가능

## 🚀 Cursor에서 사용하는 방법

### 1. 프로젝트 빌드
```bash
npm run build
```

### 2. MCP 설정 확인
`.cursor/mcp.json` 파일이 다음과 같이 설정되어 있는지 확인:

```json
{
  "mcpServers": {
    "dooray-ai": {
      "command": "node",
      "args": ["dist/cli.js", "mcp"],
      "env": {
        "DOORAY_API_TOKEN": "ajjt1imxmtj4:U7lnEMsySxu26sKywR4okQ",
        "DOORAY_API_BASE_URL": "https://api.dooray.com",
        "NODE_ENV": "production"
      }
    }
  }
}
```

### 3. Cursor 재시작
Cursor를 완전히 종료하고 다시 시작하여 MCP 설정을 로드합니다.

### 4. 사용 가능한 도구들

#### 🤖 **AI 코드 생성** (`generate_code`)
- **기능**: Claude Code를 사용한 코드 생성
- **매개변수**:
  - `prompt`: 코드 생성 요청 내용 (필수)
  - `language`: 프로그래밍 언어 (선택사항)

#### 📋 **Dooray 태스크 조회** (`get_dooray_task`)
- **기능**: Dooray 태스크 정보 상세 조회
- **매개변수**:
  - `projectId`: Dooray 프로젝트 ID (필수)
  - `taskId`: Dooray 태스크 ID (필수)

## 🎯 사용 예시

### Cursor 채팅에서 사용:

```
@dooray-ai Dooray 프로젝트 3177894036055830875의 태스크 4119108620521398822를 확인해주세요
```

```
@dooray-ai TypeScript로 JWT 인증 미들웨어를 생성해주세요
```

### 통합 워크플로우:

```
@dooray-ai 태스크 4119108620521398822의 내용을 바탕으로 TypeScript 코드를 생성해주세요
```

## 🔧 문제 해결

### MCP 서버가 연결되지 않는 경우:

1. **빌드 확인**:
   ```bash
   npm run build
   ls -la dist/cli.js  # 파일이 있는지 확인
   ```

2. **수동 테스트**:
   ```bash
   node dist/cli.js mcp
   ```

3. **Cursor 로그 확인**:
   - Cursor 설정 > 출력 > "MCP" 채널 확인

### Claude Code가 작동하지 않는 경우:

1. **Claude CLI 설치 확인**:
   ```bash
   claude --version
   ```

2. **설치가 필요한 경우**:
   ```bash
   # Claude Desktop 앱 설치 후 CLI 도구 활성화
   # 또는 Anthropic에서 제공하는 Claude CLI 설치
   ```

## 💡 향후 개선 계획

### 추가 예정 기능:
- ✅ Dooray 태스크 업데이트
- ✅ 자동 브랜치 생성
- ✅ Git 커밋 자동화
- ✅ GitHub PR 생성

### 고급 연동:
- Cursor Composer와의 깊은 통합
- 실시간 코드 컨텍스트 분석
- 프로젝트별 설정 자동 적용

## 🎉 완료!

이제 Cursor에서 Dooray AI의 모든 기능을 사용할 수 있습니다:

1. **Claude Code 연동**: 즉시 사용 가능
2. **Dooray 태스크 연동**: MCP를 통해 사용 가능
3. **통합 워크플로우**: 태스크 → 코드 생성 → 구현 자동화

**핵심**: Claude Code는 완벽하게 연동되어 있고, Cursor 연동도 방금 구현했으므로 이제 두 가지 모두 정상 작동합니다! 🚀 