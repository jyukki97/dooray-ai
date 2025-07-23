# 🔒 Dooray-AI 보안 설정 가이드

## 📋 API 키 설정

### 1. MCP 설정 (Cursor 사용자용)

`.cursor/mcp.json.example` 파일을 `.cursor/mcp.json`으로 복사하고 실제 API 키로 변경하세요:

```bash
cp .cursor/mcp.json.example .cursor/mcp.json
```

그 다음 `.cursor/mcp.json` 파일에서 다음 API 키들을 실제 값으로 변경:

- `ANTHROPIC_API_KEY`: Anthropic Claude API 키
- `OPENAI_API_KEY`: OpenAI API 키  
- `PERPLEXITY_API_KEY`: Perplexity AI API 키 (선택사항)

### 2. CLI 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가:

```bash
# AI 서비스 API 키들
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Dooray! API (추후 구현)
DOORAY_API_KEY=your_dooray_api_key_here

# GitHub API (추후 구현)
GITHUB_TOKEN=your_github_personal_access_token_here

# 로깅 설정
DOORAY_AI_LOG_LEVEL=info
```

## 🔑 API 키 발급 방법

### Anthropic Claude API
1. [Anthropic Console](https://console.anthropic.com/) 방문
2. 계정 생성 또는 로그인
3. API Keys 섹션에서 새 키 생성
4. 생성된 키를 복사하여 설정 파일에 추가

### OpenAI API
1. [OpenAI Platform](https://platform.openai.com/) 방문
2. 계정 생성 또는 로그인
3. API Keys 섹션에서 새 키 생성
4. 생성된 키를 복사하여 설정 파일에 추가

### Perplexity AI (선택사항)
1. [Perplexity AI](https://www.perplexity.ai/settings/api) 방문
2. 계정 생성 또는 로그인
3. API 키 생성
4. 생성된 키를 복사하여 설정 파일에 추가

## ⚠️ 보안 주의사항

1. **절대로 API 키를 코드에 하드코딩하지 마세요**
2. **API 키가 포함된 파일을 Git에 커밋하지 마세요**
3. **API 키를 공개 저장소에 업로드하지 마세요**
4. **정기적으로 API 키를 로테이션하세요**
5. **필요한 권한만 부여하세요**

## 🔧 설정 확인

설정이 올바르게 되었는지 확인하려면:

```bash
# CLI에서 테스트
npm run dev test

# 또는 빌드된 버전으로 테스트  
node dist/cli.js test
```

## 🚨 API 키가 노출된 경우

만약 실수로 API 키가 Git에 커밋되었다면:

1. **즉시 해당 API 키를 무효화하세요**
2. **새 API 키를 발급받으세요**
3. **Git 히스토리에서 키를 제거하세요**:
   ```bash
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .cursor/mcp.json' --prune-empty --tag-name-filter cat -- --all
   ```
4. **새 키로 설정을 업데이트하세요**

## 📞 지원

설정에 문제가 있다면 프로젝트 이슈 트래커에 문의하세요. 