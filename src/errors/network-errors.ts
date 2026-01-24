/**
 * NEXO Network Error Classes
 *
 * Specialized error classes for network-related failures:
 * - NetworkError: General network failures
 * - RateLimitError: GitHub API rate limit (403)
 * - OfflineError: No network connectivity
 *
 * @module errors/network-errors
 */

import { DEFAULT_RETRY_CONFIG, type RetryConfig } from '../constants/index.js';
import { NexoError } from './base.js';

// ============================================
// Network Error Classes
// ============================================

/**
 * General network error for fetch/clone failures
 */
export class NetworkError extends NexoError {
  constructor(
    message: string,
    public url?: string,
    public statusCode?: number,
    public retryCount?: number
  ) {
    super(message, 'NETWORK_ERROR', {
      url,
      statusCode,
      retryCount,
    });
    this.name = 'NetworkError';
  }
}

/**
 * GitHub API rate limit error (HTTP 403)
 */
export class RateLimitError extends NexoError {
  constructor(
    message: string,
    public retryAfter?: number,
    public resetTime?: Date
  ) {
    super(message, 'RATE_LIMIT_ERROR', {
      retryAfter,
      resetTime: resetTime?.toISOString(),
    });
    this.name = 'RateLimitError';
  }
}

/**
 * Offline/no connectivity error
 */
export class OfflineError extends NexoError {
  constructor(message: string = 'No network connection available') {
    super(message, 'OFFLINE_ERROR', {});
    this.name = 'OfflineError';
  }
}

// ============================================
// Retry Utilities
// ============================================

export { DEFAULT_RETRY_CONFIG, type RetryConfig };

/**
 * Calculate delay for a given retry attempt using exponential backoff
 *
 * @param attempt - The current retry attempt (0-indexed)
 * @param config - Retry configuration
 * @returns Delay in milliseconds
 */
export const calculateBackoffDelay = (
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number => {
  const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt);
  return Math.min(delay, config.maxDelayMs);
};

/**
 * Sleep for the specified duration
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
