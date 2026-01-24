/**
 * Tests for fs-checks.ts - Pre-Write Safety Checks
 */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WINDOWS_MAX_PATH } from '../../src/constants/index.js';
import { FileSystemError } from '../../src/errors/index.js';
import {
  checkDiskSpace,
  checkWritePermission,
  preWriteChecks,
  validatePathLength,
} from '../../src/utils/fs-checks.js';

describe('fs-checks Module', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `nexo-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
    vi.restoreAllMocks();
  });

  describe('validatePathLength', () => {
    it('should accept paths under MAX_PATH limit', () => {
      const shortPath = 'C:\\Users\\test\\my-project';
      expect(() => validatePathLength(shortPath)).not.toThrow();
    });

    it('should throw on Windows for paths exceeding MAX_PATH', () => {
      // Mock Windows platform
      vi.spyOn(os, 'platform').mockReturnValue('win32');

      // Create a path that exceeds 260 characters
      const longPath = 'C:\\' + 'a'.repeat(260);

      expect(() => validatePathLength(longPath)).toThrow(FileSystemError);
    });

    it('should not throw on non-Windows for long paths with valid components', () => {
      // Mock Linux platform
      vi.spyOn(os, 'platform').mockReturnValue('linux');

      // Create a path > 260 chars but with valid component lengths (< 255 each)
      const longPath = '/home/user/' + Array(30).fill('abcdefghij').join('/');

      expect(() => validatePathLength(longPath)).not.toThrow();
    });

    it('should not throw on macOS for long paths with valid components', () => {
      // Mock macOS platform
      vi.spyOn(os, 'platform').mockReturnValue('darwin');

      // Create a path > 260 chars but with valid component lengths (< 255 each)
      const longPath = '/Users/developer/' + Array(30).fill('abcdefghij').join('/');

      expect(() => validatePathLength(longPath)).not.toThrow();
    });

    it('should throw for path components exceeding 255 chars', () => {
      const longComponent = 'a'.repeat(260);
      const pathWithLongComponent = path.join(tempDir, longComponent);

      expect(() => validatePathLength(pathWithLongComponent)).toThrow(FileSystemError);
    });
  });

  describe('checkWritePermission', () => {
    it('should not throw for writable directories', async () => {
      const testPath = path.join(tempDir, 'test-project');
      await expect(checkWritePermission(testPath)).resolves.not.toThrow();
    });

    it('should handle non-existent parent directories gracefully', async () => {
      const deepPath = path.join(tempDir, 'deep', 'nested', 'path');
      await expect(checkWritePermission(deepPath)).resolves.not.toThrow();
    });
  });

  describe('checkDiskSpace', () => {
    it('should not throw when sufficient space is available', async () => {
      // Most systems have more than 1KB free
      await expect(checkDiskSpace(tempDir, 1024)).resolves.not.toThrow();
    });

    it('should warn but not throw when disk space check is unavailable', async () => {
      // Mock fs.statfs to throw
      vi.spyOn(fs, 'statfs').mockRejectedValue(new Error('Not supported'));

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      await expect(checkDiskSpace('/nonexistent', 1024)).resolves.not.toThrow();

      // Should have logged a warning
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('preWriteChecks', () => {
    it('should run all checks by default', async () => {
      const testPath = path.join(tempDir, 'test-project');
      await expect(preWriteChecks(testPath)).resolves.not.toThrow();
    });

    it('should allow disabling specific checks', async () => {
      const testPath = path.join(tempDir, 'test-project');
      await expect(preWriteChecks(testPath, {
        checkPermissions: false,
        checkDisk: false,
        validatePath: false,
      })).resolves.not.toThrow();
    });

    it('should fail fast on path validation errors', async () => {
      vi.spyOn(os, 'platform').mockReturnValue('win32');
      const longPath = 'C:\\' + 'a'.repeat(260);

      await expect(preWriteChecks(longPath)).rejects.toThrow(FileSystemError);
    });
  });

  describe('Constants', () => {
    it('should export WINDOWS_MAX_PATH as 260', () => {
      expect(WINDOWS_MAX_PATH).toBe(260);
    });
  });
});
