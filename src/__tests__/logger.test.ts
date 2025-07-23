import { Logger, LogLevel } from '../utils/logger';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = Logger.getInstance();
  });

  afterEach(() => {
    // 싱글톤이므로 설정을 초기화
    logger.configure({
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: false,
    });
  });

  test('should be a singleton', () => {
    const logger1 = Logger.getInstance();
    const logger2 = Logger.getInstance();
    expect(logger1).toBe(logger2);
  });

  test('should configure log level', () => {
    logger.configure({ level: LogLevel.ERROR });
    
    // 콘솔 스파이 설정
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    logger.debug('debug message');
    logger.info('info message');
    logger.warn('warn message');
    logger.error('error message');
    
    // ERROR 레벨로 설정했으므로 error 메시지만 출력되어야 함
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    
    consoleSpy.mockRestore();
  });

  test('should disable console logging', () => {
    logger.configure({ enableConsole: false });
    
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    logger.info('test message');
    
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  test('should display success message', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    logger.success('Operation completed');
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('✅ Operation completed')
    );
    
    consoleSpy.mockRestore();
  });

  test('should display failure message', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    logger.failure('Operation failed');
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('❌ Operation failed')
    );
    
    consoleSpy.mockRestore();
  });

  test('should display progress message', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    logger.progress('Processing...');
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('🔄 Processing...')
    );
    
    consoleSpy.mockRestore();
  });

  test('should include context in log messages', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    logger.info('test message', 'TEST_CONTEXT');
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[TEST_CONTEXT]')
    );
    
    consoleSpy.mockRestore();
  });
}); 