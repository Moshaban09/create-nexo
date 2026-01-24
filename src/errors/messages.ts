/**
 * NEXO CLI - Error Messages
 *
 * User-friendly error messages with suggestions and context.
 */

import pc from 'picocolors';

// ============================================
// Types
// ============================================

export interface ErrorMessage {
  title: string;
  description: string | ((context?: Record<string, unknown>) => string);
  suggestions?: string[];
  docs?: string;
}

export interface FormattedError {
  title: string;
  description: string;
  suggestions: string[];
  docs?: string;
}

// ============================================
// Error Message Registry
// ============================================

export const errorMessages: Record<string, ErrorMessage> = {
  // File System Errors
  ENOENT: {
    title: 'File not found',
    description: 'The specified file or directory does not exist.',
    suggestions: [
      'Check if the path is correct',
      'Ensure you have the necessary permissions',
      'Make sure the file hasn\'t been moved or deleted',
    ],
  },
  EACCES: {
    title: 'Permission denied',
    description: 'You do not have permission to access this file or directory.',
    suggestions: [
      'Try running with administrator/sudo privileges',
      'Check file and directory permissions',
      'Ensure the path is not read-only',
    ],
  },
  EEXIST: {
    title: 'Directory already exists',
    description: (ctx) => `A directory named "${ctx?.projectName || 'the specified name'}" already exists.`,
    suggestions: [
      'Choose a different project name',
      'Delete the existing directory first',
      'Use --force to overwrite (use with caution)',
    ],
  },
  ENOSPC: {
    title: 'No space left on device',
    description: 'There is not enough disk space to complete this operation.',
    suggestions: [
      'Free up disk space',
      'Try a different drive or directory',
      'Check for large temporary files',
    ],
  },
  EMFILE: {
    title: 'Too many open files',
    description: 'The system limit for open files has been reached.',
    suggestions: [
      'Close some applications',
      'Increase the file descriptor limit (ulimit -n)',
      'Restart your terminal',
    ],
  },

  // Network Errors
  ENOTFOUND: {
    title: 'Network error',
    description: 'Could not connect to the server. DNS lookup failed.',
    suggestions: [
      'Check your internet connection',
      'Verify the server address is correct',
      'Try again later',
    ],
  },
  ECONNREFUSED: {
    title: 'Connection refused',
    description: 'The server refused the connection.',
    suggestions: [
      'Check if the server is running',
      'Verify the port number is correct',
      'Check firewall settings',
    ],
  },
  ETIMEDOUT: {
    title: 'Connection timed out',
    description: 'The connection took too long to establish.',
    suggestions: [
      'Check your internet connection',
      'Try again later',
      'Increase timeout settings if possible',
    ],
  },

  // Validation Errors
  INVALID_PROJECT_NAME: {
    title: 'Invalid project name',
    description: (ctx) => `"${ctx?.name || 'The project name'}" is not a valid project name.`,
    suggestions: [
      'Use only lowercase letters, numbers, hyphens, and underscores',
      'Start with a letter or number',
      'Avoid reserved names like "test", "node_modules"',
    ],
    docs: 'https://docs.npmjs.com/cli/v8/configuring-npm/package-json#name',
  },
  INCOMPATIBLE_OPTIONS: {
    title: 'Incompatible options',
    description: (ctx) => ctx?.message as string || 'The selected options are not compatible.',
    suggestions: [
      'Review the compatibility requirements',
      'Use the wizard mode for guided selection',
    ],
  },

  // Configurator Errors
  CONFIGURATOR_FAILED: {
    title: 'Configurator failed',
    description: (ctx) => `The "${ctx?.configurator || 'configurator'}" step failed.`,
    suggestions: [
      'Check the error details above',
      'Ensure all dependencies are installed',
      'Try running with --verbose for more details',
    ],
  },

  // Plugin Errors
  PLUGIN_LOAD_FAILED: {
    title: 'Failed to load plugin',
    description: (ctx) => `Could not load plugin "${ctx?.plugin || 'unknown'}".`,
    suggestions: [
      'Check if the plugin is installed',
      'Verify the plugin path is correct',
      'Ensure the plugin exports a valid configuration',
    ],
  },
  PLUGIN_INVALID: {
    title: 'Invalid plugin',
    description: (ctx) => `The plugin "${ctx?.plugin || 'unknown'}" is not valid.`,
    suggestions: [
      'Ensure the plugin has name and version properties',
      'Check for syntax errors in the plugin file',
      'Refer to the plugin documentation',
    ],
  },

  // Generic Errors
  UNKNOWN_ERROR: {
    title: 'Unexpected error',
    description: 'An unexpected error occurred.',
    suggestions: [
      'Try running the command again',
      'Check the error details above',
      'Report this issue if it persists',
    ],
  },
};

// ============================================
// Formatting Functions
// ============================================

/**
 * Get error message info by code
 */
export const getErrorMessage = (
  code: string,
  context?: Record<string, unknown>
): FormattedError => {
  const info = errorMessages[code] || errorMessages.UNKNOWN_ERROR;

  const description = typeof info.description === 'function'
    ? info.description(context)
    : info.description;

  return {
    title: info.title,
    description,
    suggestions: info.suggestions || [],
    docs: info.docs,
  };
};

/**
 * Format error for console output
 */
export const formatErrorMessage = (
  code: string,
  context?: Record<string, unknown>
): string => {
  const { title, description, suggestions, docs } = getErrorMessage(code, context);

  let output = '\n';
  output += pc.bgRed(pc.white(` ${title} `));
  output += '\n\n';
  output += pc.red(description);

  if (suggestions.length > 0) {
    output += '\n\n';
    output += pc.yellow('Suggestions:');
    suggestions.forEach(s => {
      output += `\n  ${pc.dim('•')} ${s}`;
    });
  }

  if (docs) {
    output += '\n\n';
    output += pc.dim(`Documentation: ${docs}`);
  }

  output += '\n';

  return output;
};

/**
 * Print formatted error to console
 */
export const printError = (
  code: string,
  context?: Record<string, unknown>
): void => {
  console.error(formatErrorMessage(code, context));
};

/**
 * Get error code from Error object
 */
export const getErrorCode = (error: Error & { code?: string }): string => {
  if (error.code && errorMessages[error.code]) {
    return error.code;
  }

  // Try to detect common errors
  const message = error.message.toLowerCase();

  if (message.includes('no such file') || message.includes('enoent')) {
    return 'ENOENT';
  }
  if (message.includes('permission denied') || message.includes('eacces')) {
    return 'EACCES';
  }
  if (message.includes('already exists') || message.includes('eexist')) {
    return 'EEXIST';
  }
  if (message.includes('incompatible')) {
    return 'INCOMPATIBLE_OPTIONS';
  }

  return 'UNKNOWN_ERROR';
};

/**
 * Handle and print an error
 */
export const handleErrorWithMessage = (
  error: Error & { code?: string },
  context?: Record<string, unknown>
): void => {
  const code = getErrorCode(error);
  printError(code, { ...context, originalError: error.message });

  // Print stack trace in debug mode
  if (process.env.DEBUG === 'true') {
    console.error(pc.dim('\nStack trace:'));
    console.error(pc.dim(error.stack));
  }
};

export default {
  errorMessages,
  getErrorMessage,
  formatErrorMessage,
  printError,
  getErrorCode,
  handleErrorWithMessage,
};
