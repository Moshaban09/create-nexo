
import { downloadTemplate } from 'giget';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NetworkError, OfflineError, RateLimitError } from '../../src/errors/network-errors.js';
import { cloneTemplate, getPresetTemplate } from '../../src/utils/github.js';

vi.mock('giget');
vi.mock('../../src/utils/spinner.js', () => ({
  spinner: vi.fn(() => ({
    succeed: vi.fn(),
    fail: vi.fn(),
    stop: vi.fn(),
  })),
}));

describe('github-utils', () => {
  describe('getPresetTemplate', () => {
    it('should return correct template for saas preset', () => {
      expect(getPresetTemplate('saas')).toBe('gh:Moshaban09/nexo-templates/react/saas');
    });

    it('should return correct template for dashboard preset', () => {
      expect(getPresetTemplate('dashboard')).toBe('gh:Moshaban09/nexo-templates/react/dashboard');
    });

    it('should return undefined for unknown preset', () => {
      expect(getPresetTemplate('unknown')).toBeUndefined();
    });

    it('should be case insensitive', () => {
      expect(getPresetTemplate('SAAS')).toBe('gh:Moshaban09/nexo-templates/react/saas');
    });
  });

  describe('cloneTemplate', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should call downloadTemplate from giget', async () => {
      await cloneTemplate('user/repo', './target');

      expect(downloadTemplate).toHaveBeenCalledWith('user/repo', {
        dir: './target',
        force: true,
      });
    });

    it('should throw error if downloadTemplate fails', async () => {
      vi.mocked(downloadTemplate).mockRejectedValueOnce(new Error('Clone failed'));

      await expect(cloneTemplate('user/repo', './target')).rejects.toThrow('Clone failed');
    });
  });

  describe('cloneTemplate - Network Failure Handling', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should retry on network errors with exponential backoff', async () => {
      // Fail twice, then succeed
      vi.mocked(downloadTemplate)
        .mockRejectedValueOnce(new Error('ENOTFOUND'))
        .mockRejectedValueOnce(new Error('ETIMEDOUT'))
        .mockResolvedValueOnce({} as any);

      const promise = cloneTemplate('user/repo', './target', {
        maxRetries: 3,
        initialDelayMs: 100,
        backoffMultiplier: 2,
        maxDelayMs: 1000,
      });

      // Advance timers for backoff delays
      await vi.advanceTimersByTimeAsync(100); // First retry delay
      await vi.advanceTimersByTimeAsync(200); // Second retry delay

      await expect(promise).resolves.not.toThrow();
      expect(downloadTemplate).toHaveBeenCalledTimes(3);
    });

    it('should throw RateLimitError on 403 response', async () => {
      vi.mocked(downloadTemplate).mockRejectedValue(new Error('403 rate limit exceeded'));

      const promise = cloneTemplate('user/repo', './target', {
        maxRetries: 0,
        initialDelayMs: 100,
        backoffMultiplier: 2,
        maxDelayMs: 1000,
      });

      await expect(promise).rejects.toThrow(RateLimitError);
    });

    it('should throw OfflineError on ENOTFOUND after max retries', async () => {
      vi.mocked(downloadTemplate).mockRejectedValue(new Error('ENOTFOUND'));

      const promise = cloneTemplate('user/repo', './target', {
        maxRetries: 0,
        initialDelayMs: 100,
        backoffMultiplier: 2,
        maxDelayMs: 1000,
      });

      await expect(promise).rejects.toThrow(OfflineError);
    });

    it('should throw NetworkError on non-network failure after max retries', async () => {
      vi.mocked(downloadTemplate).mockRejectedValue(new Error('Unknown error'));

      const promise = cloneTemplate('user/repo', './target', {
        maxRetries: 0,
        initialDelayMs: 100,
        backoffMultiplier: 2,
        maxDelayMs: 1000,
      });

      await expect(promise).rejects.toThrow(NetworkError);
    });

    it('should NOT retry on 404 (repo not found)', async () => {
      vi.mocked(downloadTemplate).mockRejectedValue(new Error('404 not found'));

      const promise = cloneTemplate('user/repo', './target', {
        maxRetries: 3,
        initialDelayMs: 100,
        backoffMultiplier: 2,
        maxDelayMs: 1000,
      });

      await expect(promise).rejects.toThrow();
      // Should only be called once - no retries for 404
      expect(downloadTemplate).toHaveBeenCalledTimes(1);
    });

    it('should respect max retries limit', async () => {
      vi.mocked(downloadTemplate).mockRejectedValue(new Error('ECONNREFUSED'));

      let caughtError: Error | null = null;
      const promise = cloneTemplate('user/repo', './target', {
        maxRetries: 2,
        initialDelayMs: 50,
        backoffMultiplier: 2,
        maxDelayMs: 500,
      }).catch((err) => {
        caughtError = err;
      });

      // Advance timers for all retry delays in sequence
      await vi.runAllTimersAsync();
      await promise;

      // Verify error was thrown and retries occurred
      expect(caughtError).not.toBeNull();
      // Initial attempt + 2 retries = 3 calls
      expect(downloadTemplate).toHaveBeenCalledTimes(3);
    });
  });
});
