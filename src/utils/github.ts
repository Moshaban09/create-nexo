
import { execa } from 'execa';
import pc from 'picocolors';
import {
    calculateBackoffDelay,
    DEFAULT_RETRY_CONFIG,
    NetworkError,
    OfflineError,
    RateLimitError,
    RetryConfig,
    sleep,
} from '../errors/index.js';
import { spinner } from './spinner.js';

/**
 * Maps presets to GitHub repositories
 * COMMENTED OUT: These template repositories haven't been created yet
 * Users can still use --template flag with their own repos
 */
export const PRESET_TEMPLATES: Record<string, string> = {
  // saas: 'Moshaban09/nexo-saas-template',
  // dashboard: 'Moshaban09/nexo-dashboard-template',
  // landing: 'Moshaban09/nexo-landing-template',
};

// ============================================
// Error Detection Helpers
// ============================================

/**
 * Get error message from unknown error
 */
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message.toLowerCase();
  }
  return String(error).toLowerCase();
};

/**
 * Check if error is a network/connectivity issue
 */
const isNetworkError = (error: unknown): boolean => {
  const message = getErrorMessage(error);
  return (
    message.includes('network') ||
    message.includes('enotfound') ||
    message.includes('econnrefused') ||
    message.includes('etimedout') ||
    message.includes('unable to connect') ||
    message.includes('unable to access')
  );
};

/**
 * Check if error is a rate limit (403)
 */
const isRateLimitError = (error: unknown): boolean => {
  const message = getErrorMessage(error);
  return message.includes('403') || message.includes('rate limit');
};

/**
 * Parse Retry-After header value from error message (if present)
 */
const parseRetryAfter = (error: unknown): number | undefined => {
  const message = getErrorMessage(error);
  const match = message.match(/retry[- ]?after[:\s]+(\d+)/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  return undefined;
};

/**
 * Check if the error is retryable
 */
const isRetryableError = (error: unknown): boolean => {
  const message = getErrorMessage(error);
  // Rate limits and server errors are retryable
  // 404 (repo not found) is NOT retryable
  return (
    isNetworkError(error) ||
    isRateLimitError(error) ||
    message.includes('500') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('504')
  );
};

// ============================================
// Clone Template with Retry
// ============================================

/**
 * Clones a GitHub repository using tiged with retry logic
 *
 * @param repo GitHub repository (e.g., 'user/repo')
 * @param targetDir Target directory
 * @param retryConfig Optional retry configuration
 * @throws NetworkError, RateLimitError, or OfflineError on failure
 */
export const cloneTemplate = async (
  repo: string,
  targetDir: string,
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<void> => {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    const isRetry = attempt > 0;
    const attemptLabel = isRetry
      ? `Retrying (${attempt}/${retryConfig.maxRetries})...`
      : `Cloning template from ${repo}...`;

    const s = spinner(attemptLabel);

    try {
      // Use locally installed tiged
      await execa('tiged', [repo, targetDir, '--force']);
      s.succeed('Template cloned successfully');
      return;
    } catch (error) {
      s.fail();
      lastError = error as Error;

      // Check if we should retry
      if (attempt < retryConfig.maxRetries && isRetryableError(error)) {
        const delay = calculateBackoffDelay(attempt, retryConfig);
        console.log(pc.yellow(`  ⏳ Waiting ${delay / 1000}s before retry...`));
        await sleep(delay);
        continue;
      }

      // No more retries - throw appropriate error
      break;
    }
  }

  // Convert to appropriate error type
  if (isRateLimitError(lastError)) {
    const retryAfter = parseRetryAfter(lastError);
    throw new RateLimitError(
      `GitHub rate limit exceeded while cloning "${repo}"`,
      retryAfter,
      retryAfter ? new Date(Date.now() + retryAfter * 1000) : undefined
    );
  }

  if (isNetworkError(lastError)) {
    throw new OfflineError(
      `Unable to clone "${repo}" - no network connection.\n` +
      `Try again when online, or use a local template with --template-dir.`
    );
  }

  // Generic network error
  throw new NetworkError(
    `Failed to clone template "${repo}" after ${retryConfig.maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`,
    `https://github.com/${repo}`,
    undefined,
    retryConfig.maxRetries + 1
  );
};

/**
 * Returns the template repository for a given preset
 */
export const getPresetTemplate = (presetName: string): string | undefined => {
  return PRESET_TEMPLATES[presetName.toLowerCase()];
};
