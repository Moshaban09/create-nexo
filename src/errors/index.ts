import pc from 'picocolors';
import { NexoError } from './base.js';

// Re-export base error class
export { NexoError } from './base.js';

// ============================================
// NEXO Error Classes
// ============================================

/**
 * Validation errors - invalid user input or selections
 */
export class ValidationError extends NexoError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

/**
 * File system errors - file operations failed
 */
export class FileSystemError extends NexoError {
  constructor(message: string, filePath: string, originalError?: Error) {
    super(message, 'FS_ERROR', {
      path: filePath,
      originalError: originalError?.message
    });
    this.name = 'FileSystemError';
  }
}

/**
 * Configurator errors - configuration step failed
 */
export class ConfiguratorError extends NexoError {
  constructor(configuratorName: string, message: string, originalError?: Error) {
    super(message, 'CONFIGURATOR_ERROR', {
      configurator: configuratorName,
      originalError: originalError?.message
    });
    this.name = 'ConfiguratorError';
  }
}

/**
 * Dependency errors - package installation/resolution failed
 */
export class DependencyError extends NexoError {
  constructor(dependency: string, message: string) {
    super(message, 'DEPENDENCY_ERROR', { dependency });
    this.name = 'DependencyError';
  }
}

/**
 * Compatibility errors - incompatible selections
 */
export class CompatibilityError extends NexoError {
  constructor(message: string, selections: Record<string, string>) {
    super(message, 'COMPATIBILITY_ERROR', { selections });
    this.name = 'CompatibilityError';
  }
}

/**
 * Security errors - security violation detected
 */
export class SecurityError extends NexoError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'SECURITY_ERROR', context);
    this.name = 'SecurityError';
  }
}

// ============================================
// Error Messages Registry
// ============================================

interface ErrorMessage {
  title: string;
  description: string | ((ctx: Record<string, unknown>) => string);
  suggestions?: string[];
}

const errorMessages: Record<string, ErrorMessage> = {
  ENOENT: {
    title: 'File not found',
    description: 'The specified file or directory does not exist.',
    suggestions: [
      'Check if the path is correct',
      'Ensure you have the necessary permissions',
    ],
  },
  EACCES: {
    title: 'Permission denied',
    description: 'You do not have permission to access this file.',
    suggestions: [
      'Try running with administrator/sudo privileges',
      'Check file permissions',
    ],
  },
  EEXIST: {
    title: 'Directory already exists',
    description: (ctx) => `A directory named "${ctx.projectName || 'unknown'}" already exists.`,
    suggestions: [
      'Choose a different project name',
      'Delete the existing directory first',
      'Use --force to overwrite',
    ],
  },
  VALIDATION_ERROR: {
    title: 'Validation Error',
    description: 'The provided input is invalid.',
    suggestions: [
      'Check your input values',
      'Run with --help to see available options',
    ],
  },
  COMPATIBILITY_ERROR: {
    title: 'Compatibility Error',
    description: 'The selected options are not compatible with each other.',
    suggestions: [
      'Review your selections',
      'Check the documentation for compatible options',
    ],
  },
  FS_ERROR: {
    title: 'File System Error',
    description: 'An error occurred while performing file operations.',
    suggestions: [
      'Check disk space',
      'Ensure you have write permissions',
    ],
  },
  CONFIGURATOR_ERROR: {
    title: 'Configuration Error',
    description: 'An error occurred during project configuration.',
    suggestions: [
      'Try running the command again',
      'Check if all dependencies are available',
    ],
  },
  SECURITY_ERROR: {
    title: 'Security Error',
    description: 'A security violation was detected.',
    suggestions: [
      'Check the target path',
      'Ensure input values are safe',
    ],
  },
  NETWORK_ERROR: {
    title: 'Network Error',
    description: 'A network request failed after multiple attempts.',
    suggestions: [
      'Check your internet connection',
      'Try again in a few minutes',
      'Use offline mode with --offline flag',
    ],
  },
  RATE_LIMIT_ERROR: {
    title: 'Rate Limit Exceeded',
    description: 'GitHub API rate limit has been exceeded.',
    suggestions: [
      'Wait a few minutes before trying again',
      'Authenticate with GitHub to increase rate limits',
      'Use a local template instead',
    ],
  },
  OFFLINE_ERROR: {
    title: 'No Internet Connection',
    description: 'Unable to reach remote servers.',
    suggestions: [
      'Check your internet connection',
      'Use --offline flag for offline mode',
      'Use a local template with --template-dir',
    ],
  },
};

// ============================================
// Error Formatting & Handling
// ============================================

/**
 * Format and display an error with helpful information
 */
export const formatError = (error: unknown, context?: Record<string, unknown>): void => {
  console.log();

  if (error instanceof NexoError) {
    const info = errorMessages[error.code] || {
      title: error.name,
      description: error.message,
    };

    // Title
    console.log(pc.bgRed(pc.white(pc.bold(` ${info.title} `))));
    console.log();

    // Description
    const description = typeof info.description === 'function'
      ? info.description({ ...error.context, ...context })
      : info.description;
    console.log(pc.red(description));

    // Context details
    if (error.context && Object.keys(error.context).length > 0) {
      console.log();
      console.log(pc.dim('Details:'));
      Object.entries(error.context).forEach(([key, value]) => {
        if (value !== undefined) {
          console.log(pc.dim(`  ${key}: ${value}`));
        }
      });
    }

    // Suggestions
    if (info.suggestions && info.suggestions.length > 0) {
      console.log();
      console.log(pc.yellow('Suggestions:'));
      info.suggestions.forEach((s) => console.log(pc.dim(`  • ${s}`)));
    }
  } else if (error instanceof Error) {
    // Handle standard errors
    const nodeError = error as NodeJS.ErrnoException;
    const info = errorMessages[nodeError.code || ''] || {
      title: 'Unexpected Error',
      description: error.message,
    };

    console.log(pc.bgRed(pc.white(pc.bold(` ${info.title} `))));
    console.log();
    console.log(pc.red(
      typeof info.description === 'function'
        ? info.description(context || {})
        : info.description
    ));

    if (info.suggestions) {
      console.log();
      console.log(pc.yellow('Suggestions:'));
      info.suggestions.forEach((s) => console.log(pc.dim(`  • ${s}`)));
    }

    // Show stack trace in debug mode
    if (process.env.DEBUG) {
      console.log();
      console.log(pc.dim('Stack trace:'));
      console.log(pc.dim(error.stack || 'No stack trace available'));
    }
  } else {
    // Unknown error type
    console.log(pc.bgRed(pc.white(pc.bold(' Unknown Error '))));
    console.log();
    console.log(pc.red('An unexpected error occurred'));
    console.log(pc.dim(String(error)));
  }

  console.log();
};

/**
 * Global error handler - use at CLI entry point
 */
export const handleError = (error: unknown, context?: Record<string, unknown>): never => {
  formatError(error, context);
  process.exit(1);
};

/**
 * Wrap an async function with error handling
 */
export const withErrorHandling = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  errorContext?: Record<string, unknown>
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      // handleError calls process.exit(1), so this never returns
      return handleError(error, errorContext);
    }
  };
};

/**
 * Try to execute a function and return a result object
 */
export interface Result<T> {
  success: boolean;
  data?: T;
  error?: NexoError;
}

export const tryExecute = async <T>(
  fn: () => Promise<T>,
  errorClass: new (message: string, ...args: unknown[]) => NexoError = NexoError as new (message: string, ...args: unknown[]) => NexoError,
  ...errorArgs: unknown[]
): Promise<Result<T>> => {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: new errorClass(message, ...errorArgs),
    };
  }
};

// Re-export messages module
export * from './messages.js';

// Re-export network errors
export * from './network-errors.js';

