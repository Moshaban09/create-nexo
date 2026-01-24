/**
 * NEXO Base Error Class
 *
 * This file exists to break circular dependencies between error modules.
 *
 * @module errors/base
 */

/**
 * Base error class for all NEXO errors
 */
export class NexoError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'NexoError';
    Error.captureStackTrace?.(this, this.constructor);
  }
}
