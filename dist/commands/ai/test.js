"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiTestCommand = void 0;
const commander_1 = require("commander");
const logger_1 = require("../../utils/logger");
const ai_1 = require("../../services/ai");
const env_1 = require("../../config/env");
exports.aiTestCommand = new commander_1.Command('ai-test')
    .description('AI 연동 상태를 테스트합니다')
    .option('--show-env', '환경 변수 정보를 표시합니다')
    .option('--validate', 'AI 클라이언트 연결을 검증합니다')
    .option('--generate <prompt>', '간단한 코드 생성 테스트를 실행합니다')
    .option('--pro-test', 'Claude Pro 전용 기능을 테스트합니다')
    .option('--large-context', '대용량 컨텍스트 처리를 테스트합니다')
    .action(async (options) => {
    try {
        logger_1.logger.info('🤖 AI 연동 테스트 시작');
        // 환경 변수 정보 표시
        if (options.showEnv) {
            (0, env_1.displayEnvironmentInfo)();
            return;
        }
        // 사용 가능한 AI 엔진 확인
        const availableEngines = ai_1.AIClientFactory.getAvailableEngines();
        logger_1.logger.info(`사용 가능한 AI 엔진: ${availableEngines.join(', ')}`);
        if (availableEngines.length === 0) {
            logger_1.logger.warn('⚠️ 설정된 AI API 키가 없습니다. .env 파일을 확인하세요.');
            return;
        }
        // 연결 검증
        if (options.validate) {
            logger_1.logger.info('🔗 AI 클라이언트 연결 검증 중...');
            const results = await ai_1.AIClientFactory.validateAllConnections();
            for (const [engine, isValid] of Object.entries(results)) {
                const status = isValid ? '✅ 성공' : '❌ 실패';
                logger_1.logger.info(`  ${engine}: ${status}`);
            }
            return;
        }
        // 코드 생성 테스트
        if (options.generate) {
            logger_1.logger.info('💻 코드 생성 테스트 실행 중...');
            try {
                const client = ai_1.AIClientFactory.createDefaultClient();
                const response = await client.generateCode({
                    prompt: options.generate,
                    language: 'javascript',
                    maxTokens: 200
                });
                logger_1.logger.info('✅ 코드 생성 성공!');
                logger_1.logger.info('--- 생성된 코드 ---');
                console.log(response.code);
                if (response.explanation) {
                    logger_1.logger.info('--- 설명 ---');
                    console.log(response.explanation);
                }
                if (response.suggestions && response.suggestions.length > 0) {
                    logger_1.logger.info('--- 제안사항 ---');
                    response.suggestions.forEach((suggestion, index) => {
                        console.log(`${index + 1}. ${suggestion}`);
                    });
                }
                logger_1.logger.info(`--- 메타데이터 ---`);
                logger_1.logger.info(`요청 ID: ${response.metadata.requestId}`);
                logger_1.logger.info(`응답 시간: ${response.metadata.responseTime}ms`);
                logger_1.logger.info(`토큰 사용량: ${response.metadata.tokensUsed || 'N/A'}`);
                logger_1.logger.info(`비용: $${response.metadata.cost?.toFixed(6) || 'N/A'}`);
                // Pro 클라이언트 정보 표시
                const clientInfo = client.getClientInfo?.();
                if (clientInfo && clientInfo.tier === 'pro') {
                    logger_1.logger.info('--- Claude Pro 혜택 ---');
                    logger_1.logger.info(`Pro 활성화: ${clientInfo.proEnabled ? '✅' : '❌'}`);
                    logger_1.logger.info(`최대 컨텍스트: ${clientInfo.maxContextTokens?.toLocaleString()} 토큰`);
                    logger_1.logger.info(`우선순위 처리: ${clientInfo.priorityRequests ? '✅' : '❌'}`);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                logger_1.logger.error(`❌ 코드 생성 실패: ${errorMessage}`);
            }
            return;
        }
        // Claude Pro 전용 테스트
        if (options.proTest) {
            logger_1.logger.info('🏆 Claude Pro 전용 기능 테스트 실행 중...');
            try {
                const client = ai_1.AIClientFactory.createDefaultClient();
                // Pro 전용 대용량 코드 생성 테스트
                const proResponse = await client.generateCode({
                    prompt: 'Create a comprehensive Express.js REST API with authentication, validation, error handling, and documentation',
                    language: 'typescript',
                    maxTokens: 2000, // 더 많은 토큰 사용
                    context: 'This is for a production application requiring high quality code'
                });
                logger_1.logger.info('✅ Claude Pro 테스트 성공!');
                logger_1.logger.info(`생성된 코드 길이: ${proResponse.code.length} 문자`);
                logger_1.logger.info(`설명 길이: ${proResponse.explanation?.length || 0} 문자`);
                logger_1.logger.info(`제안사항: ${proResponse.suggestions?.length || 0}개`);
                logger_1.logger.info(`토큰 사용량: ${proResponse.metadata.tokensUsed || 'N/A'}`);
                logger_1.logger.info(`응답 시간: ${proResponse.metadata.responseTime}ms`);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                logger_1.logger.error(`❌ Claude Pro 테스트 실패: ${errorMessage}`);
            }
            return;
        }
        // 대용량 컨텍스트 테스트
        if (options.largeContext) {
            logger_1.logger.info('📚 대용량 컨텍스트 처리 테스트 실행 중...');
            try {
                const client = ai_1.AIClientFactory.createDefaultClient();
                // 긴 컨텍스트를 포함한 요청
                const longContext = `
            프로젝트 구조:
            - src/controllers/ (REST API 컨트롤러)
            - src/services/ (비즈니스 로직)
            - src/models/ (데이터 모델)
            - src/middleware/ (인증, 로깅 등)
            - src/utils/ (유틸리티 함수)
            
            기술 스택:
            - Node.js + TypeScript
            - Express.js 프레임워크
            - MongoDB + Mongoose
            - JWT 인증
            - bcrypt 암호화
            - Joi 검증
            - Winston 로깅
            
            요구사항:
            - RESTful API 설계
            - 사용자 인증 시스템
            - 권한 기반 접근 제어
            - 데이터 검증
            - 오류 처리
            - API 문서화
            - 단위 테스트
            - 성능 최적화
          `;
                const contextResponse = await client.generateCode({
                    prompt: 'Create a user registration endpoint with all the requirements above',
                    language: 'typescript',
                    maxTokens: 1500,
                    context: longContext
                });
                logger_1.logger.info('✅ 대용량 컨텍스트 테스트 성공!');
                logger_1.logger.info(`컨텍스트 길이: ${longContext.length} 문자`);
                logger_1.logger.info(`생성된 코드 품질: ${contextResponse.suggestions?.length || 0}개 제안사항 포함`);
                logger_1.logger.info(`토큰 사용량: ${contextResponse.metadata.tokensUsed || 'N/A'}`);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                logger_1.logger.error(`❌ 대용량 컨텍스트 테스트 실패: ${errorMessage}`);
            }
            return;
        }
        // 기본 정보 표시
        logger_1.logger.info('🤖 AI 연동 시스템이 준비되었습니다.');
        logger_1.logger.info('사용 가능한 옵션:');
        logger_1.logger.info('  --show-env: 환경 변수 정보 표시');
        logger_1.logger.info('  --validate: 연결 상태 검증');
        logger_1.logger.info('  --generate "prompt": 코드 생성 테스트');
        logger_1.logger.info('  --pro-test: Claude Pro 전용 기능 테스트');
        logger_1.logger.info('  --large-context: 대용량 컨텍스트 처리 테스트');
        // Claude Pro 상태 확인
        if (env_1.env.claudeProEnabled) {
            logger_1.logger.info('');
            logger_1.logger.info('✨ Claude Pro 기능이 활성화되어 있습니다!');
            logger_1.logger.info(`   최대 컨텍스트: ${env_1.env.maxContextTokens.toLocaleString()} 토큰`);
            logger_1.logger.info(`   우선순위 처리: ${env_1.env.priorityRequests ? '활성화' : '비활성화'}`);
        }
        else {
            logger_1.logger.info('');
            logger_1.logger.info('💡 Claude Pro 기능을 활성화하려면 CLAUDE_PRO_ENABLED=true 를 설정하세요.');
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.logger.error(`AI 테스트 실행 중 오류 발생: ${errorMessage}`);
        process.exit(1);
    }
});
//# sourceMappingURL=test.js.map