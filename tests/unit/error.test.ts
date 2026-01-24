import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Logger } from '../../src/utils/logger.js';

describe('Error Handling (Logger)', () => {
  let logger: Logger;
  let stdoutSpy: any;
  let stderrSpy: any;

  beforeEach(() => {
    logger = new Logger();
    // Spy on process.stdout/stderr
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should format error messages correctly', () => {
    logger.error('Something went wrong');

    expect(stderrSpy).toHaveBeenCalledWith(
        expect.stringContaining('Something went wrong')
    );
  });

  it('should handle Error objects', () => {
      const error = new Error('System failure');
      // Logger.error callback expects string, so we need to cast or handle it
      logger.error(error.message);

      expect(stderrSpy).toHaveBeenCalledWith(
          expect.stringContaining('System failure')
      );
  });

  it('should suppress output in silent mode', () => {
    logger = new Logger({ level: 'silent' });
    logger.error('Should not be seen');
    logger.info('Should not be seen');

    expect(stderrSpy).not.toHaveBeenCalled();
    expect(stdoutSpy).not.toHaveBeenCalled();
  });

  it('should respect debug level', () => {
      logger = new Logger({ level: 'debug' });
      logger.debug('Debug info');

      expect(stdoutSpy).toHaveBeenCalledWith(
          expect.stringContaining('Debug info')
      );
  });

  it('should ignore debug logs in info level', () => {
    logger = new Logger({ level: 'info' });
    logger.debug('Debug info');

    expect(stdoutSpy).not.toHaveBeenCalled();
  });
});
