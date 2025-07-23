import program from '../cli';

describe('CLI Application', () => {
  test('should have correct name', () => {
    expect(program.name()).toBe('dooray-ai');
  });

  test('should have version', () => {
    expect(program.version()).toBeDefined();
  });

  test('should have description', () => {
    expect(program.description()).toContain('AI-powered CLI tool');
  });

  test('should have init command', () => {
    const commands = program.commands.map(cmd => cmd.name());
    expect(commands).toContain('init');
  });

  test('should have generate command', () => {
    const commands = program.commands.map(cmd => cmd.name());
    expect(commands).toContain('generate');
  });

  test('should have test command', () => {
    const commands = program.commands.map(cmd => cmd.name());
    expect(commands).toContain('test');
  });
});
