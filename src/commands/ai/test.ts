import { Command } from 'commander';
import { logger } from '../../utils/logger';
import { AIClientFactory } from '../../services/ai';
import { displayEnvironmentInfo } from '../../config/env';

export const aiTestCommand = new Command('ai-test')
  .description('AI 연동 상태를 테스트합니다')
  .option('--show-env', '환경 변수 정보를 표시합니다')
  .option('--validate', 'AI 클라이언트 연결을 검증합니다')
  .option('--generate <prompt>', '간단한 코드 생성 테스트를 실행합니다')
  .action(async (options) => {
    try {
      logger.info('🤖 AI 연동 테스트 시작');

      // 환경 변수 정보 표시
      if (options.showEnv) {
        displayEnvironmentInfo();
        return;
      }

      // 사용 가능한 AI 엔진 확인
      const availableEngines = AIClientFactory.getAvailableEngines();
      logger.info(`사용 가능한 AI 엔진: ${availableEngines.join(', ')}`);

      if (availableEngines.length === 0) {
        logger.warn('⚠️ 설정된 AI API 키가 없습니다. .env 파일을 확인하세요.');
        return;
      }

      // 연결 검증
      if (options.validate) {
        logger.info('🔗 AI 클라이언트 연결 검증 중...');
        const results = await AIClientFactory.validateAllConnections();
        
        for (const [engine, isValid] of Object.entries(results)) {
          const status = isValid ? '✅ 성공' : '❌ 실패';
          logger.info(`  ${engine}: ${status}`);
        }
        return;
      }

      // 코드 생성 테스트
      if (options.generate) {
        logger.info('💻 코드 생성 테스트 실행 중...');
        
        try {
          const client = AIClientFactory.createDefaultClient();
          const response = await client.generateCode({
            prompt: options.generate,
            language: 'javascript',
            maxTokens: 200
          });

          logger.info('✅ 코드 생성 성공!');
          logger.info('--- 생성된 코드 ---');
          console.log(response.code);
          
          if (response.explanation) {
            logger.info('--- 설명 ---');
            console.log(response.explanation);
          }

          logger.info(`--- 메타데이터 ---`);
          logger.info(`요청 ID: ${response.metadata.requestId}`);
          logger.info(`응답 시간: ${response.metadata.responseTime}ms`);
          logger.info(`토큰 사용량: ${response.metadata.tokensUsed || 'N/A'}`);
          logger.info(`비용: $${response.metadata.cost?.toFixed(6) || 'N/A'}`);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          logger.error(`❌ 코드 생성 실패: ${errorMessage}`);
        }
        return;
      }

      // 기본 정보 표시
      logger.info('AI 연동 시스템이 준비되었습니다.');
      logger.info('옵션:');
      logger.info('  --show-env: 환경 변수 정보 표시');
      logger.info('  --validate: 연결 상태 검증');
      logger.info('  --generate "prompt": 코드 생성 테스트');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`AI 테스트 실행 중 오류 발생: ${errorMessage}`);
      process.exit(1);
    }
  }); 