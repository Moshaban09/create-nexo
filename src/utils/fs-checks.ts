/**
 * NEXO Pre-Write Safety Checks
 *
 * Validates filesystem conditions before writing files:
 * - Write permissions
 * - Disk space availability
 * - Path length (Windows MAX_PATH)
 *
 * @module utils/fs-checks
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  MAX_PATH_COMPONENT,
  MIN_DISK_SPACE_BYTES,
  WINDOWS_MAX_PATH,
} from '../constants/index.js';
import { FileSystemError } from '../errors/index.js';

// ============================================
// Permission Checks
// ============================================

/**
 * Check if we have write permission at the target path.
 * Creates a temporary file to verify write access.
 *
 * @param targetPath - The directory path to check
 * @throws FileSystemError if write permission is denied
 */
export const checkWritePermission = async (targetPath: string): Promise<void> => {
  const testDir = path.dirname(targetPath);
  const testFile = path.join(testDir, `.nexo-write-test-${Date.now()}`);

  try {
    // Ensure parent directory exists
    await fs.mkdir(testDir, { recursive: true });

    // Try to create and immediately delete a test file
    await fs.writeFile(testFile, '');
    await fs.unlink(testFile);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'EACCES' || nodeError.code === 'EPERM') {
      throw new FileSystemError(
        `Permission denied: Cannot write to "${testDir}"`,
        testDir,
        error as Error
      );
    }
    // For other errors, re-throw if it's a real issue
    if (nodeError.code !== 'ENOENT') {
      throw new FileSystemError(
        `Cannot access directory "${testDir}": ${nodeError.message}`,
        testDir,
        error as Error
      );
    }
  }
};

// ============================================
// Disk Space Checks
// ============================================

/**
 * Platform-specific disk space info
 */
interface DiskSpaceInfo {
  available: number;
  total: number;
}

/**
 * Get available disk space for the given path.
 * Uses different methods based on OS.
 *
 * @param targetPath - Path to check disk space for
 * @returns DiskSpaceInfo or null if unable to determine
 */
const getDiskSpace = async (targetPath: string): Promise<DiskSpaceInfo | null> => {
  try {
    // Use fs.statfs (Node.js 18.15+)
    const stats = await fs.statfs(targetPath);
    return {
      available: stats.bavail * stats.bsize,
      total: stats.blocks * stats.bsize,
    };
  } catch {
    // fs.statfs not available or path doesn't exist
    // Try to check parent directory
    const parent = path.dirname(targetPath);
    if (parent !== targetPath) {
      try {
        const stats = await fs.statfs(parent);
        return {
          available: stats.bavail * stats.bsize,
          total: stats.blocks * stats.bsize,
        };
      } catch {
        return null;
      }
    }
    return null;
  }
};

/**
 * Format bytes to human-readable string
 */
const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

/**
 * Check if sufficient disk space is available.
 *
 * @param targetPath - The path to check disk space for
 * @param requiredBytes - Minimum required bytes (default: 100MB)
 * @throws FileSystemError if insufficient disk space
 */
export const checkDiskSpace = async (
  targetPath: string,
  requiredBytes: number = MIN_DISK_SPACE_BYTES
): Promise<void> => {
  const diskInfo = await getDiskSpace(targetPath);

  if (diskInfo === null) {
    // Unable to determine disk space - proceed with warning
    console.warn('⚠ Unable to check disk space. Proceeding anyway...');
    return;
  }

  if (diskInfo.available < requiredBytes) {
    throw new FileSystemError(
      `Insufficient disk space: ${formatBytes(diskInfo.available)} available, ` +
      `${formatBytes(requiredBytes)} required`,
      targetPath
    );
  }
};

// ============================================
// Path Length Validation
// ============================================

/**
 * Validate that the path length doesn't exceed OS limits.
 * Primarily for Windows MAX_PATH (260 characters).
 *
 * @param targetPath - The path to validate
 * @throws FileSystemError if path exceeds limit
 */
export const validatePathLength = (targetPath: string): void => {
  const isWindows = os.platform() === 'win32';

  if (isWindows && targetPath.length >= WINDOWS_MAX_PATH) {
    throw new FileSystemError(
      `Path too long: ${targetPath.length} characters exceeds Windows limit of ${WINDOWS_MAX_PATH}.\n` +
      `Consider using a shorter project name or parent directory.`,
      targetPath
    );
  }

  // Also check if any single path component is too long (255 chars on most filesystems)
  // Split on both / and \ for cross-platform compatibility
  const components = targetPath.split(/[/\\]/).filter(Boolean);
  for (const component of components) {
    if (component.length > MAX_PATH_COMPONENT) {
      throw new FileSystemError(
        `Path component "${component.slice(0, 50)}..." is too long (${component.length} chars). ` +
        `Maximum is ${MAX_PATH_COMPONENT} characters.`,
        targetPath
      );
    }
  }
};

// ============================================
// Combined Pre-Write Checks
// ============================================

/**
 * Options for pre-write checks
 */
export interface PreWriteCheckOptions {
  /** Check write permissions (default: true) */
  checkPermissions?: boolean;
  /** Check disk space (default: true) */
  checkDisk?: boolean;
  /** Required disk space in bytes (default: 100MB) */
  requiredDiskSpace?: number;
  /** Validate path length (default: true) */
  validatePath?: boolean;
}

/**
 * Run all pre-write safety checks before creating a project.
 *
 * @param projectPath - The full project path to validate
 * @param options - Check options
 * @throws FileSystemError if any check fails
 */
export const preWriteChecks = async (
  projectPath: string,
  options: PreWriteCheckOptions = {}
): Promise<void> => {
  const {
    checkPermissions = true,
    checkDisk = true,
    requiredDiskSpace = MIN_DISK_SPACE_BYTES,
    validatePath = true,
  } = options;

  // Path length validation (sync, fast)
  if (validatePath) {
    validatePathLength(projectPath);
  }

  // Permission check
  if (checkPermissions) {
    await checkWritePermission(projectPath);
  }

  // Disk space check
  if (checkDisk) {
    await checkDiskSpace(projectPath, requiredDiskSpace);
  }
};

// Export constants for testing - handled by src/constants/index.ts
export { };

