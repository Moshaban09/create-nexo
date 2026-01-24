/**
 * Tests for network.ts - Offline-first network utilities
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    clearCache,
    getCached,
    getLatestVersion,
    getPackageVersions,
    isOffline,
    setCache,
    setOfflineMode,
    startPrefetch,
    waitForPrefetch
} from '../../src/core/network.js';

describe('Network Module', () => {
  beforeEach(() => {
    clearCache();
    setOfflineMode(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Cache Functions', () => {
    it('should return null for non-existent cache key', () => {
      expect(getCached('non-existent')).toBeNull();
    });

    it('should cache and retrieve values', () => {
      setCache('test-key', 'test-value');
      expect(getCached('test-key')).toBe('test-value');
    });

    it('should clear all cached values', () => {
      setCache('key1', 'value1');
      setCache('key2', 'value2');
      clearCache();
      expect(getCached('key1')).toBeNull();
      expect(getCached('key2')).toBeNull();
    });
  });

  describe('Offline Mode', () => {
    it('should start in online mode', () => {
      expect(isOffline()).toBe(false);
    });

    it('should switch to offline mode', () => {
      setOfflineMode(true);
      expect(isOffline()).toBe(true);
    });
  });

  describe('getLatestVersion', () => {
    it('should return cached version if available', async () => {
      setCache('version:react', '^19.0.0');
      const version = await getLatestVersion('react');
      expect(version).toBe('^19.0.0');
    });

    it('should return fallback version in offline mode', async () => {
      setOfflineMode(true);
      const version = await getLatestVersion('react');
      expect(version).toBe('^19.0.0'); // From FALLBACK_VERSIONS
    });

    it('should return "latest" for unknown packages in offline mode', async () => {
      setOfflineMode(true);
      const version = await getLatestVersion('unknown-package-xyz');
      expect(version).toBe('latest');
    });
  });

  describe('getPackageVersions', () => {
    it('should return versions for multiple packages', async () => {
      setOfflineMode(true); // Use fallback for predictable results
      const versions = await getPackageVersions(['react', 'zustand']);
      expect(versions['react']).toBe('^19.0.0');
      expect(versions['zustand']).toBe('^5.0.0');
    });
  });

  describe('Prefetching', () => {
    it('should not throw when starting prefetch', () => {
      expect(() => startPrefetch()).not.toThrow();
    });

    it('should not throw when waiting for prefetch', async () => {
      await expect(waitForPrefetch()).resolves.not.toThrow();
    });
  });
});
