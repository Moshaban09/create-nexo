/**
 * Tests for security/index.ts - Security utilities
 */
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
    createSafeContext,
    isPathSafe,
    sanitizeForCode,
    sanitizePath,
    scanContent,
    SecurityError,
    validateDependency,
    validateEnvironment,
    validatePackageName,
    validateTargetPath,
} from '../../src/security/index.js';

describe('Security Module', () => {
  describe('validateTargetPath', () => {
    it('should allow paths within base directory', () => {
      const basePath = process.cwd();
      const targetPath = path.join(basePath, 'subdir', 'file.txt');

      expect(() => validateTargetPath(targetPath, basePath)).not.toThrow();
    });

    it('should throw for directory traversal attempts', () => {
      const basePath = path.join(process.cwd(), 'project');
      const targetPath = path.join(basePath, '..', '..', 'etc', 'passwd');

      expect(() => validateTargetPath(targetPath, basePath)).toThrow(SecurityError);
    });

    it('should warn for hidden directories (non-strict mode)', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const basePath = process.cwd();
      const targetPath = path.join(basePath, '.hidden', 'file.txt');

      validateTargetPath(targetPath, basePath);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should throw for hidden directories in strict mode', () => {
      const basePath = process.cwd();
      const targetPath = path.join(basePath, '.hidden', 'file.txt');

      expect(() => validateTargetPath(targetPath, basePath, { strict: true }))
        .toThrow(SecurityError);
    });
  });

  describe('isPathSafe', () => {
    it('should return true for safe paths', () => {
      const basePath = process.cwd();
      const targetPath = path.join(basePath, 'safe', 'path');

      expect(isPathSafe(targetPath, basePath)).toBe(true);
    });

    it('should return false for unsafe paths', () => {
      const basePath = path.join(process.cwd(), 'project');
      const targetPath = path.join(basePath, '..', '..', 'etc');

      expect(isPathSafe(targetPath, basePath)).toBe(false);
    });
  });

  describe('validatePackageName', () => {
    it('should accept valid npm package names', () => {
      expect(validatePackageName('react')).toBe(true);
      expect(validatePackageName('lodash')).toBe(true);
      expect(validatePackageName('@types/node')).toBe(true);
      expect(validatePackageName('@tanstack/react-query')).toBe(true);
    });

    it('should reject invalid package names', () => {
      expect(validatePackageName('')).toBe(false);
      expect(validatePackageName('UPPERCASE')).toBe(false);
      expect(validatePackageName('.hidden')).toBe(false);
      expect(validatePackageName('_underscore')).toBe(false);
    });

    it('should reject suspicious package names', () => {
      expect(validatePackageName('my-eval-pkg')).toBe(false);
      expect(validatePackageName('exec-command')).toBe(false);
      expect(validatePackageName('child_process-helper')).toBe(false);
    });
  });

  describe('sanitizePath', () => {
    it('should remove directory traversal sequences', () => {
      expect(sanitizePath('../../../etc/passwd')).toBe('etc/passwd');
      expect(sanitizePath('foo/../bar')).toBe('foo/bar');
    });

    it('should normalize slashes', () => {
      expect(sanitizePath('foo//bar///baz')).toBe('foo/bar/baz');
      expect(sanitizePath('foo\\bar\\baz')).toBe('foo/bar/baz');
    });

    it('should remove leading slashes', () => {
      expect(sanitizePath('/etc/passwd')).toBe('etc/passwd');
    });
  });

  describe('sanitizeForCode', () => {
    it('should escape dangerous characters', () => {
      expect(sanitizeForCode('<script>')).toBe('script');
      expect(sanitizeForCode('`template`')).toBe('template');
      expect(sanitizeForCode('${injection}')).toBe('injection');
    });

    it('should escape quotes', () => {
      expect(sanitizeForCode("it's")).toBe("it\\'s");
      expect(sanitizeForCode('"quoted"')).toBe('\\"quoted\\"');
    });
  });

  describe('validateDependency', () => {
    it('should allow valid dependencies', () => {
      expect(() => validateDependency('react', '18.2.0')).not.toThrow();

      expect(() => validateDependency('@types/node', '^20.0.0')).not.toThrow();
    });

    it('should throw for invalid package names', () => {
      expect(() => validateDependency(' invalid ', '1.0.0')).toThrow(SecurityError);
      expect(() => validateDependency('node_modules', '1.0.0')).toThrow(SecurityError);
    });

    it('should throw for suspicious versions', () => {
      expect(() => validateDependency('react', '99.99.99')).not.toThrow(); // Semver valid, but usually high (logic doesn't catch this yet)
      expect(() => validateDependency('react', '$(rm -rf)')).toThrow(SecurityError);
      expect(() => validateDependency('react', '; cat /etc/passwd')).toThrow(SecurityError);
    });
  });

  describe('scanContent', () => {
    it('should return safe for normal code', () => {
      const code = 'const x = 1; console.log(x);';
      const result = scanContent(code);
      expect(result.safe).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should detect dangerous patterns', () => {
      const dangerous = [
        'eval("console.log(1)")',
        'require("child_process")',
        'process.exit(1)',
        'fs.rmdirSync("/")'
      ];

      dangerous.forEach(code => {
        const result = scanContent(code);
        if (result.safe) {
            console.error(`Failed to detect danger in: ${code}`);
        }
        expect(result.safe).toBe(false);
        expect(result.warnings.length).toBeGreaterThan(0);
      });
    });
  });

  describe('validateEnvironment', () => {
    it('should warn for potential issues', () => {
      const result = validateEnvironment();
      // On benign dev/test envs this should be safe
      // If CI sets NODE_OPTIONS it might warn
      expect(result).toBeDefined();
    });
  });

  describe('createSafeContext', () => {
    it('should create context bound to base path', () => {
      const basePath = path.join(process.cwd(), 'project');
      const ctx = createSafeContext(basePath);

      expect(ctx.basePath).toBe(basePath);
    });

    it('should join paths safely', () => {
      const basePath = process.cwd();
      const ctx = createSafeContext(basePath);

      const safe = ctx.join('src', 'index.ts');
      expect(safe).toBe(path.join(basePath, 'src', 'index.ts'));
    });

    it('should throw on traversal in join', () => {
      const basePath = process.cwd();
      const ctx = createSafeContext(basePath);

      expect(() => ctx.join('..', 'etc', 'passwd')).toThrow(SecurityError);
    });
  });
});
