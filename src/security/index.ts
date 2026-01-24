import path from 'node:path';
import pc from 'picocolors';
import validateNpmPackageName from 'validate-npm-package-name';
import { SecurityError } from '../errors/index.js';

// Re-export SecurityError for convenience
export { SecurityError } from '../errors/index.js';

// ============================================
// Input Sanitization
// ============================================

// Note: sanitizeProjectName is in validation/index.ts

/**
 * Sanitize file path to prevent directory traversal
 */
export const sanitizePath = (inputPath: string): string => {
  return inputPath
    .replace(/\.\./g, '')
    .replace(/\/+/g, '/')
    .replace(/\\+/g, '/')
    .replace(/^\//, '');
};

/**
 * Sanitize string for use in generated code
 */
export const sanitizeForCode = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/[`${}]/g, '')
    .replace(/['"\\/]/g, (char) => `\\${char}`);
};

// ============================================
// Path Validation
// ============================================

/**
 * Validate that a path is safe to write to
 */
export const validateTargetPath = (
  targetPath: string,
  basePath?: string,
  options: { strict?: boolean } = {}
): void => {
  const resolved = path.resolve(targetPath);
  const base = basePath ? path.resolve(basePath) : process.cwd();

  // Check for directory traversal
  if (!resolved.startsWith(base)) {
    throw new SecurityError(
      'Cannot write outside the base directory',
      { targetPath, basePath: base, resolvedPath: resolved }
    );
  }

  // Check for system directories (cross-platform)
  const forbiddenPaths = [
    // Unix
    '/etc',
    '/usr',
    '/bin',
    '/sbin',
    '/var',
    '/root',
    '/home',
    // Windows
    'C:\\Windows',
    'C:\\Program Files',
    'C:\\Program Files (x86)',
    'C:\\ProgramData',
    'C:\\Users\\Default',
  ];

  const normalizedResolved = resolved.replace(/\\/g, '/').toLowerCase();

  for (const forbidden of forbiddenPaths) {
    const normalizedForbidden = forbidden.replace(/\\/g, '/').toLowerCase();
    if (normalizedResolved.startsWith(normalizedForbidden)) {
      throw new SecurityError(
        'Cannot write to system directories',
        { targetPath: resolved, forbiddenPath: forbidden }
      );
    }
  }

  // Check for hidden directories (starting with .)
  const pathParts = resolved.split(path.sep);
  const hasHiddenParent = pathParts.some(
    (part, index) => index > 0 && part.startsWith('.') && part !== '.' && part !== '..'
  );

  if (hasHiddenParent) {
    if (options.strict) {
      throw new SecurityError(
        'Cannot write to hidden directories in strict mode',
        { targetPath: resolved }
      );
    } else {
      // Just warn, don't block
      console.warn(pc.yellow('Warning: Writing to a hidden directory'));
    }
  }
};

/**
 * Check if path is within allowed boundaries
 */
export const isPathSafe = (targetPath: string, basePath?: string): boolean => {
  try {
    validateTargetPath(targetPath, basePath);
    return true;
  } catch {
    return false;
  }
};

// ============================================
// Dependency Validation
// ============================================

/**
 * Validate package name for npm using validate-npm-package-name library
 */
export const validatePackageName = (name: string): boolean => {
  const result = validateNpmPackageName(name);

  if (!result.validForNewPackages) {
    return false;
  }

  // Additional check for suspicious patterns
  const suspicious = [
    'eval',
    'exec',
    'spawn',
    'child_process',
    'require(',
    'import(',
  ];

  const lowerName = name.toLowerCase();
  return !suspicious.some((s) => lowerName.includes(s));
};

/**
 * Validate dependency entry
 */
export const validateDependency = (name: string, version: string): void => {
  if (!validatePackageName(name)) {
    throw new SecurityError(
      `Invalid or suspicious package name: ${name}`,
      { packageName: name }
    );
  }

  // Validate version format (semver-like)
  const validVersionRegex = /^[\^~]?\d+(\.\d+)*(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$|^latest$|^next$|^\*$/;

  if (!validVersionRegex.test(version)) {
    throw new SecurityError(
      `Invalid version format: ${version}`,
      { packageName: name, version }
    );
  }
};

// ============================================
// Content Validation
// ============================================

/**
 * Patterns that might indicate dangerous code
 */
const DANGEROUS_PATTERNS = [
  { pattern: /eval\s*\(/, name: 'eval()' },
  { pattern: /new\s+Function\s*\(/, name: 'new Function()' },
  { pattern: /child_process/, name: 'child_process' },
  { pattern: /\.exec\s*\(/, name: '.exec()' },
  { pattern: /\.spawn\s*\(/, name: '.spawn()' },
  { pattern: /fs\.(rm|rmdir|unlink)(Sync)?\s*\(/, name: 'fs.rm/rmdir/unlink' },
  { pattern: /process\.exit\s*\(/, name: 'process.exit()' },
  { pattern: /require\s*\(\s*['"`]child_process/, name: 'require child_process' },
  { pattern: /__proto__/, name: '__proto__' },
  { pattern: /constructor\s*\[\s*['"`]prototype/, name: 'prototype pollution' },
];

/**
 * Scan content for potentially dangerous patterns
 */
export const scanContent = (content: string): { safe: boolean; warnings: string[] } => {
  const warnings: string[] = [];

  for (const { pattern, name } of DANGEROUS_PATTERNS) {
    if (pattern.test(content)) {
      warnings.push(`Potentially dangerous pattern detected: ${name}`);
    }
  }

  return {
    safe: warnings.length === 0,
    warnings,
  };
};

/**
 * Validate file content before writing
 */
export const validateFileContent = (
  content: string,
  options: { strict?: boolean } = {}
): void => {
  const { safe, warnings } = scanContent(content);

  if (!safe) {
    if (options.strict) {
      throw new SecurityError(
        'Dangerous code patterns detected in file content',
        { warnings }
      );
    } else {
      warnings.forEach((w) => {
        console.warn(pc.yellow(`⚠ ${w}`));
      });
    }
  }
};

// ============================================
// Environment Validation
// ============================================

/**
 * Check if running in a safe environment
 */
export const validateEnvironment = (): { safe: boolean; warnings: string[] } => {
  const warnings: string[] = [];

  // Check for root/admin (Unix)
  if (process.getuid && process.getuid() === 0) {
    warnings.push('Running as root is not recommended');
  }

  // Check for suspicious environment variables
  const suspiciousEnvVars = ['LD_PRELOAD', 'LD_LIBRARY_PATH', 'NODE_OPTIONS'];
  for (const envVar of suspiciousEnvVars) {
    if (process.env[envVar]) {
      warnings.push(`Suspicious environment variable set: ${envVar}`);
    }
  }

  return {
    safe: warnings.length === 0,
    warnings,
  };
};

// ============================================
// Safe Wrappers
// ============================================

/**
 * Safely join paths, preventing directory traversal
 */
export const safeJoin = (basePath: string, ...segments: string[]): string => {
  // Join paths first, letting path.join resolve '..'
  const result = path.join(basePath, ...segments);

  // Ensure result is within base path (Strict Traversal Check)
  const resolvedBase = path.resolve(basePath);
  const resolvedResult = path.resolve(result);

  if (!resolvedResult.startsWith(resolvedBase)) {
    throw new SecurityError(
      'Path traversal detected',
      { basePath, segments, result }
    );
  }

  return result;
};

/**
 * Create a safe context for file operations
 */
export const createSafeContext = (basePath: string) => {
  const resolvedBase = path.resolve(basePath);

  return {
    basePath: resolvedBase,

    join: (...segments: string[]) => safeJoin(resolvedBase, ...segments),

    validate: (targetPath: string) => {
      validateTargetPath(targetPath, resolvedBase);
    },

    isWithinBase: (targetPath: string) => {
      const resolved = path.resolve(targetPath);
      return resolved.startsWith(resolvedBase);
    },
  };
};
