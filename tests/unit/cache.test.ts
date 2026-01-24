/**
 * Tests for templates/cache.ts - Template caching
 */
import { beforeEach, describe, expect, it } from 'vitest';
import {
    cacheTemplate,
    clearTemplateCache,
    getCacheKey,
    getCacheStats,
    getCachedTemplate,
    withCache,
} from '../../src/templates/cache.js';

describe('Template Cache', () => {
  beforeEach(() => {
    clearTemplateCache();
  });

  describe('getCacheKey', () => {
    it('should generate consistent cache keys', () => {
      const key1 = getCacheKey('component', 'Button', true);
      const key2 = getCacheKey('component', 'Button', true);
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different params', () => {
      const key1 = getCacheKey('component', 'Button', true);
      const key2 = getCacheKey('component', 'Button', false);
      expect(key1).not.toBe(key2);
    });
  });

  describe('cacheTemplate / getCachedTemplate', () => {
    it('should return null for non-existent key', () => {
      expect(getCachedTemplate('non-existent')).toBeNull();
    });

    it('should cache and retrieve template', () => {
      cacheTemplate('test-key', 'template content');
      expect(getCachedTemplate('test-key')).toBe('template content');
    });
  });

  describe('withCache', () => {
    it('should cache generator result', () => {
      let callCount = 0;
      const generator = () => {
        callCount++;
        return 'generated content';
      };

      const result1 = withCache('test', ['param1'], generator);
      const result2 = withCache('test', ['param1'], generator);

      expect(result1).toBe('generated content');
      expect(result2).toBe('generated content');
      expect(callCount).toBe(1); // Generator called only once
    });

    it('should call generator for different params', () => {
      let callCount = 0;
      const generator = () => {
        callCount++;
        return `content-${callCount}`;
      };

      withCache('test', ['param1'], generator);
      withCache('test', ['param2'], generator);

      expect(callCount).toBe(2);
    });
  });

  describe('clearTemplateCache', () => {
    it('should clear all cached templates', () => {
      cacheTemplate('key1', 'value1');
      cacheTemplate('key2', 'value2');
      clearTemplateCache();
      expect(getCachedTemplate('key1')).toBeNull();
      expect(getCachedTemplate('key2')).toBeNull();
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', () => {
      cacheTemplate('key1', 'value1');
      cacheTemplate('key2', 'value2');
      const stats = getCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
    });
  });
});
