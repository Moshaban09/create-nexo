/**
 * Tests for network-errors.ts - Network Error Classes and Retry Logic
 */
import { describe, expect, it } from 'vitest';
import {
    DEFAULT_RETRY_CONFIG,
    NetworkError,
    OfflineError,
    RateLimitError,
    calculateBackoffDelay,
    sleep,
} from '../../src/errors/network-errors.js';

describe('Network Errors Module', () => {
  describe('NetworkError', () => {
    it('should create error with code NETWORK_ERROR', () => {
      const error = new NetworkError('Connection failed', 'https://example.com', 500, 3);

      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.name).toBe('NetworkError');
      expect(error.message).toBe('Connection failed');
      expect(error.url).toBe('https://example.com');
      expect(error.statusCode).toBe(500);
      expect(error.retryCount).toBe(3);
    });

    it('should include context in error', () => {
      const error = new NetworkError('Failed', 'https://api.com');

      expect(error.context).toEqual({
        url: 'https://api.com',
        statusCode: undefined,
        retryCount: undefined,
      });
    });
  });

  describe('RateLimitError', () => {
    it('should create error with rate limit details', () => {
      const resetTime = new Date();
      const error = new RateLimitError('Rate limited', 60, resetTime);

      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.name).toBe('RateLimitError');
      expect(error.retryAfter).toBe(60);
      expect(error.resetTime).toEqual(resetTime);
    });
  });

  describe('OfflineError', () => {
    it('should create error with default message', () => {
      const error = new OfflineError();

      expect(error.code).toBe('OFFLINE_ERROR');
      expect(error.name).toBe('OfflineError');
      expect(error.message).toBe('No network connection available');
    });

    it('should accept custom message', () => {
      const error = new OfflineError('Custom offline message');
      expect(error.message).toBe('Custom offline message');
    });
  });

  describe('DEFAULT_RETRY_CONFIG', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_RETRY_CONFIG.maxRetries).toBe(3);
      expect(DEFAULT_RETRY_CONFIG.initialDelayMs).toBe(1000);
      expect(DEFAULT_RETRY_CONFIG.backoffMultiplier).toBe(2);
      expect(DEFAULT_RETRY_CONFIG.maxDelayMs).toBe(10000);
    });
  });

  describe('calculateBackoffDelay', () => {
    it('should calculate exponential backoff correctly', () => {
      // First attempt: 1000ms
      expect(calculateBackoffDelay(0)).toBe(1000);

      // Second attempt: 2000ms
      expect(calculateBackoffDelay(1)).toBe(2000);

      // Third attempt: 4000ms
      expect(calculateBackoffDelay(2)).toBe(4000);
    });

    it('should respect max delay', () => {
      // Very high attempt number should still be capped at maxDelayMs
      const delay = calculateBackoffDelay(10);
      expect(delay).toBe(10000); // maxDelayMs
    });

    it('should use custom config', () => {
      const customConfig = {
        maxRetries: 5,
        initialDelayMs: 500,
        backoffMultiplier: 3,
        maxDelayMs: 5000,
      };

      expect(calculateBackoffDelay(0, customConfig)).toBe(500);
      expect(calculateBackoffDelay(1, customConfig)).toBe(1500);
      expect(calculateBackoffDelay(2, customConfig)).toBe(4500);
      expect(calculateBackoffDelay(3, customConfig)).toBe(5000); // Capped
    });
  });

  describe('sleep', () => {
    it('should resolve after specified time', async () => {
      const start = Date.now();
      await sleep(50);
      const elapsed = Date.now() - start;

      // Allow some tolerance for timer precision
      expect(elapsed).toBeGreaterThanOrEqual(45);
      expect(elapsed).toBeLessThan(100);
    });
  });
});
