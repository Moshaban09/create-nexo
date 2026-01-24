import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { ensureDir } from './fs.js';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

interface CacheSchema {
  version: string;
  entries: Record<string, CacheEntry<unknown>>;
}

/**
 * Configuration cache - caches expensive operations
 */
class ConfigCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 24 * 60 * 60 * 1000; // 24 hours
  private cacheDir = path.join(os.homedir(), '.nexo');
  private cacheFile = path.join(this.cacheDir, 'cache.json');
  private version = '1.0.0'; // Bump to invalidate

  /**
   * Load cache from disk
   */
  async load(): Promise<void> {
    try {
      const exists = await fs
        .access(this.cacheFile)
        .then(() => true)
        .catch(() => false);

      if (!exists) return;

      const data = await fs.readFile(this.cacheFile, 'utf-8');
      const json = JSON.parse(data) as CacheSchema;

      if (json.version !== this.version) {
        return; // Invalidate old cache
      }

      this.cache = new Map(Object.entries(json.entries));
    } catch (error) {
      // Ignore load errors (corrupt cache, permissions, etc)
    }
  }

  /**
   * Save cache to disk
   */
  async save(): Promise<void> {
    try {
      await ensureDir(this.cacheDir);

      // Clean expired entries before saving
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > this.defaultTTL) {
          this.cache.delete(key);
        }
      }

      const exportData: CacheSchema = {
        version: this.version,
        entries: Object.fromEntries(this.cache),
      };

      await fs.writeFile(this.cacheFile, JSON.stringify(exportData, null, 2));
    } catch (error) {
      // Ignore save errors
    }
  }

  /**
   * Get or create cached value
   */
  async get<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    const now = Date.now();

    if (entry && now - entry.timestamp < (ttl ?? this.defaultTTL)) {
      return entry.value;
    }

    const value = await factory();
    this.cache.set(key, { value, timestamp: now });
    return value;
  }

  /**
   * Get synchronous cached value
   */
  getSync<T>(key: string, factory: () => T, ttl?: number): T {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    const now = Date.now();

    if (entry && now - entry.timestamp < (ttl ?? this.defaultTTL)) {
      return entry.value;
    }

    const value = factory();
    this.cache.set(key, { value, timestamp: now });
    return value;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string, ttl?: number): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    return Date.now() - entry.timestamp < (ttl ?? this.defaultTTL);
  }

  /**
   * Set a value directly
   */
  set<T>(key: string, value: T): void {
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  /**
   * Invalidate a specific key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate keys matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached values
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: [...this.cache.keys()],
    };
  }
}

// Singleton instance
export const cache = new ConfigCache();

// Helper functions
export const getCached = <T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> => {
  return cache.get(key, factory, ttl);
};

export const getCachedSync = <T>(key: string, factory: () => T, ttl?: number): T => {
  return cache.getSync(key, factory, ttl);
};

export const invalidateCache = (key: string): void => {
  cache.invalidate(key);
};

export const clearCache = (): void => {
  cache.clear();
};

/**
 * Memoize an async function
 */
export const memoize = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator?: (...args: T) => string
): ((...args: T) => Promise<R>) => {
  const generateKey = keyGenerator ?? ((...args: T) => JSON.stringify(args));

  return async (...args: T): Promise<R> => {
    const key = `memoize:${fn.name}:${generateKey(...args)}`;
    return cache.get(key, () => fn(...args));
  };
};

/**
 * Memoize a sync function
 */
export const memoizeSync = <T extends unknown[], R>(
  fn: (...args: T) => R,
  keyGenerator?: (...args: T) => string
): ((...args: T) => R) => {
  const generateKey = keyGenerator ?? ((...args: T) => JSON.stringify(args));

  return (...args: T): R => {
    const key = `memoize:${fn.name}:${generateKey(...args)}`;
    return cache.getSync(key, () => fn(...args));
  };
};
