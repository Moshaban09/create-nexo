/**
 * NEXO Logger Module
 *
 * Unified logging system for CLI output.
 * All console output should go through this module.
 *
 * @module utils/logger
 */

import pc from 'picocolors';

// ============================================
// Logger Types
// ============================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export interface LoggerOptions {
  /** Minimum log level to display */
  level?: LogLevel;
  /** Prefix for all messages */
  prefix?: string;
  /** Enable colors */
  colors?: boolean;
}

// ============================================
// Log Level Priority
// ============================================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

// ============================================
// Logger Class
// ============================================

/**
 * Unified logger for NEXO CLI
 */
export class Logger {
  private level: LogLevel;
  private prefix: string;
  private colors: boolean;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level || (process.env.DEBUG ? 'debug' : 'info');
    this.prefix = options.prefix || '';
    this.colors = options.colors !== false;
  }

  /**
   * Check if a log level should be displayed
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  /**
   * Format a message with optional prefix
   */
  private format(message: string): string {
    return this.prefix ? `${this.prefix} ${message}` : message;
  }

  // ============================================
  // Output Methods
  // ============================================

  /**
   * Print a blank line
   */
  newline(): void {
    if (this.shouldLog('info')) {
      process.stdout.write('\n');
    }
  }

  /**
   * Print a message (no formatting)
   */
  print(message: string): void {
    if (this.shouldLog('info')) {
      process.stdout.write(message + '\n');
    }
  }

  /**
   * Debug message (only shown with DEBUG=true)
   */
  debug(message: string): void {
    if (this.shouldLog('debug')) {
      process.stdout.write(this.colors ? pc.dim(`[debug] ${message}`) + '\n' : `[debug] ${message}\n`);
    }
  }

  /**
   * Verbose message (only shown with --verbose flag)
   */
  verbose(message: string): void {
    if (process.env.NEXO_VERBOSE === 'true') {
      process.stdout.write(this.colors ? pc.dim(`[verbose] ${message}`) + '\n' : `[verbose] ${message}\n`);
    }
  }

  /**
   * Info message
   */
  info(message: string): void {
    if (this.shouldLog('info')) {
      process.stdout.write(this.format(message) + '\n');
    }
  }

  /**
   * Success message (green)
   */
  success(message: string): void {
    if (this.shouldLog('info')) {
      process.stdout.write(this.colors ? pc.green(this.format(message)) + '\n' : this.format(message) + '\n');
    }
  }

  /**
   * Warning message (yellow)
   */
  warn(message: string): void {
    if (this.shouldLog('warn')) {
      process.stderr.write(this.colors ? pc.yellow(`⚠ ${message}`) + '\n' : `Warning: ${message}\n`);
    }
  }

  /**
   * Error message (red)
   */
  error(message: string): void {
    if (this.shouldLog('error')) {
      process.stderr.write(this.colors ? pc.red(`✖ ${message}`) + '\n' : `Error: ${message}\n`);
    }
  }

  /**
   * Dim text (for secondary info)
   */
  dim(message: string): void {
    if (this.shouldLog('info')) {
      process.stdout.write(this.colors ? pc.dim(message) + '\n' : message + '\n');
    }
  }

  /**
   * Cyan text (for highlights)
   */
  cyan(message: string): void {
    if (this.shouldLog('info')) {
      process.stdout.write(this.colors ? pc.cyan(message) + '\n' : message + '\n');
    }
  }

  /**
   * Bold text
   */
  bold(message: string): void {
    if (this.shouldLog('info')) {
      process.stdout.write(this.colors ? pc.bold(message) + '\n' : message + '\n');
    }
  }

  // ============================================
  // Styled Output
  // ============================================

  /**
   * Print a header with background
   */
  header(message: string, type: 'error' | 'warning' | 'info' = 'info'): void {
    if (!this.shouldLog('info')) return;

    const styled = this.colors
      ? type === 'error'
        ? pc.bgRed(pc.white(pc.bold(` ${message} `)))
        : type === 'warning'
          ? pc.bgYellow(pc.black(` ${message} `))
          : pc.bgCyan(pc.white(` ${message} `))
      : `[ ${message} ]`;

    process.stdout.write(styled + '\n');
  }

  /**
   * Print a list of items
   */
  list(items: string[], indent = 2): void {
    if (!this.shouldLog('info')) return;

    const spaces = ' '.repeat(indent);
    for (const item of items) {
      process.stdout.write(this.colors ? pc.dim(`${spaces}${item}`) + '\n' : `${spaces}${item}\n`);
    }
  }
}

// ============================================
// Default Logger Instance
// ============================================

export const logger = new Logger();

// ============================================
// Convenience Functions
// ============================================

export const log = {
  newline: () => logger.newline(),
  print: (msg: string) => logger.print(msg),
  debug: (msg: string) => logger.debug(msg),
  verbose: (msg: string) => logger.verbose(msg),
  info: (msg: string) => logger.info(msg),
  success: (msg: string) => logger.success(msg),
  warn: (msg: string) => logger.warn(msg),
  error: (msg: string) => logger.error(msg),
  dim: (msg: string) => logger.dim(msg),
  cyan: (msg: string) => logger.cyan(msg),
  bold: (msg: string) => logger.bold(msg),
  header: (msg: string, type?: 'error' | 'warning' | 'info') => logger.header(msg, type),
  list: (items: string[], indent?: number) => logger.list(items, indent),
};
