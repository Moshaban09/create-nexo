/**
 * Tests for cross-platform path handling
 *
 * Tests path validation and normalization across Windows, macOS, and Linux.
 */
import os from 'node:os';
import { describe, expect, it, vi } from 'vitest';
import {
    MAX_PATH_COMPONENT,
    WINDOWS_MAX_PATH,
} from '../../src/constants/index.js';
import { FileSystemError } from '../../src/errors/index.js';
import { validatePathLength } from '../../src/utils/fs-checks.js';
import { validateProjectName } from '../../src/utils/validation.js';

describe('Cross-Platform Path Handling', () => {
  describe('Windows Paths', () => {
    it('should accept paths under MAX_PATH limit on Windows', () => {
      vi.spyOn(os, 'platform').mockReturnValue('win32');

      const shortPath = 'C:\\Users\\test\\my-project';
      expect(() => validatePathLength(shortPath)).not.toThrow();

      vi.restoreAllMocks();
    });

    it('should throw FileSystemError for paths exceeding MAX_PATH on Windows', () => {
      vi.spyOn(os, 'platform').mockReturnValue('win32');

      // Create a path that exceeds 260 characters
      const longPath = 'C:\\' + 'a'.repeat(WINDOWS_MAX_PATH);

      expect(() => validatePathLength(longPath)).toThrow(FileSystemError);

      vi.restoreAllMocks();
    });

    it('should handle Windows paths with forward slashes', () => {
      vi.spyOn(os, 'platform').mockReturnValue('win32');

      const mixedPath = 'C:/Users/test/my-project';
      expect(() => validatePathLength(mixedPath)).not.toThrow();

      vi.restoreAllMocks();
    });

    it('should handle UNC paths', () => {
      vi.spyOn(os, 'platform').mockReturnValue('win32');

      const uncPath = '\\\\server\\share\\folder\\project';
      expect(() => validatePathLength(uncPath)).not.toThrow();

      vi.restoreAllMocks();
    });
  });

  describe('Unix Paths (Linux/macOS)', () => {
    it('should NOT enforce MAX_PATH limit on Linux', () => {
      vi.spyOn(os, 'platform').mockReturnValue('linux');

      // Create a path > 260 chars but with valid component lengths
      const longPath = '/home/user/' + Array(30).fill('abcdefghij').join('/');

      expect(() => validatePathLength(longPath)).not.toThrow();

      vi.restoreAllMocks();
    });

    it('should NOT enforce MAX_PATH limit on macOS', () => {
      vi.spyOn(os, 'platform').mockReturnValue('darwin');

      // Create a path > 260 chars
      const longPath = '/Users/developer/' + Array(30).fill('abcdefghij').join('/');

      expect(() => validatePathLength(longPath)).not.toThrow();

      vi.restoreAllMocks();
    });

    it('should handle paths with spaces', () => {
      vi.spyOn(os, 'platform').mockReturnValue('linux');

      const pathWithSpaces = '/home/user/my project folder/app';
      expect(() => validatePathLength(pathWithSpaces)).not.toThrow();

      vi.restoreAllMocks();
    });
  });

  describe('Path Component Length (All Platforms)', () => {
    it('should throw for path components exceeding 255 chars on any platform', () => {
      vi.spyOn(os, 'platform').mockReturnValue('linux');

      const longComponent = 'a'.repeat(MAX_PATH_COMPONENT + 5);
      const pathWithLongComponent = `/home/user/${longComponent}`;

      expect(() => validatePathLength(pathWithLongComponent)).toThrow(FileSystemError);

      vi.restoreAllMocks();
    });

    it('should accept components at exactly 255 chars', () => {
      vi.spyOn(os, 'platform').mockReturnValue('linux');

      const maxComponent = 'a'.repeat(MAX_PATH_COMPONENT);
      const pathWithMaxComponent = `/home/user/${maxComponent}`;

      expect(() => validatePathLength(pathWithMaxComponent)).not.toThrow();

      vi.restoreAllMocks();
    });

    it('should validate each component separately', () => {
      vi.spyOn(os, 'platform').mockReturnValue('darwin');

      // First component is fine, second is too long
      const longComponent = 'b'.repeat(MAX_PATH_COMPONENT + 10);
      const mixedPath = `/home/short/${longComponent}/file`;

      expect(() => validatePathLength(mixedPath)).toThrow(FileSystemError);

      vi.restoreAllMocks();
    });
  });

  describe('Path Separators', () => {
    it('should handle mixed separators', () => {
      vi.spyOn(os, 'platform').mockReturnValue('win32');

      // Mixed Windows and Unix separators
      const mixedPath = 'C:\\Users/test\\my-project/src';
      expect(() => validatePathLength(mixedPath)).not.toThrow();

      vi.restoreAllMocks();
    });

    it('should split on both / and \\ for component validation', () => {
      vi.spyOn(os, 'platform').mockReturnValue('win32');

      const longComponent = 'x'.repeat(MAX_PATH_COMPONENT + 5);
      const mixedPath = `C:\\short/${longComponent}\\file`;

      expect(() => validatePathLength(mixedPath)).toThrow(FileSystemError);

      vi.restoreAllMocks();
    });
  });

  describe('Project Path Validation', () => {
    it('should reject project names with invalid characters', () => {
      const result = validateProjectName('my project!');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should accept valid project names', () => {
      expect(validateProjectName('my-project').valid).toBe(true);
      expect(validateProjectName('my_project_123').valid).toBe(true);
    });

    it('should reject empty project names', () => {
      const result = validateProjectName('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Project name is required');
    });
  });

  describe('Constants', () => {
    it('should have WINDOWS_MAX_PATH as 260', () => {
      expect(WINDOWS_MAX_PATH).toBe(260);
    });

    it('should have MAX_PATH_COMPONENT as 255', () => {
      expect(MAX_PATH_COMPONENT).toBe(255);
    });
  });
});
