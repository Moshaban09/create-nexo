/**
 * NEXO Network Utilities
 * Provides offline-first network handling with smart timeouts,
 * global asset caching, and background prefetching
 */
import pc from 'picocolors';

// ============================================
// Configuration
// ============================================

const NETWORK_TIMEOUT_MS = 3000; // 3 seconds
const NPM_REGISTRY_URL = 'https://registry.npmjs.org';
const CACHE_TTL_MS = 3600000; // 1 hour

// Built-in stable versions fallback
const FALLBACK_VERSIONS: Record<string, string> = {
  // React ecosystem
  react: '^19.0.0',
  'react-dom': '^19.0.0',
  '@vitejs/plugin-react': '^4.3.4',

  // State management
  zustand: '^5.0.0',
  '@reduxjs/toolkit': '^2.5.0',
  jotai: '^2.11.0',

  // Routing
  'react-router-dom': '^7.13.0',
  '@tanstack/react-router': '^1.157.0',

  // Data fetching
  '@tanstack/react-query': '^5.64.0',
  axios: '^1.7.0',

  // Forms
  'react-hook-form': '^7.54.0',
  zod: '^3.24.0',

  // UI
  tailwindcss: '^4.0.0',
  'lucide-react': '^0.553.0',

  // ESLint ecosystem (pinned to v9 – plugins don't support v10 yet)
  eslint: '^9.29.0',
  '@eslint/js': '^9.29.0',
  globals: '^16.0.0',
  'typescript-eslint': '^8.33.0',
  'eslint-plugin-react-hooks': '^5.2.0',
  'eslint-plugin-react-refresh': '^0.4.20',
};

/**
 * Packages that must stay within a specific semver major version.
 * Used to prevent "latest" from jumping to a breaking major release.
 *
 * Key   = package name
 * Value = maximum allowed major version (inclusive)
 */
export const MAX_MAJOR_CONSTRAINTS: Record<string, number> = {
  // ESLint v10 broke peer-dep compatibility with most plugins (Feb 2026).
  // Keep on v9 until the ecosystem catches up.
  eslint: 9,
  '@eslint/js': 9,
};

// ============================================
// Global Asset Cache (In-Memory)
// ============================================

interface CacheEntry {
  value: string;
  timestamp: number;
}

const globalCache = new Map<string, CacheEntry>();

/**
 * Get cached value if not expired
 */
export const getCached = (key: string): string | null => {
  const entry = globalCache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    globalCache.delete(key);
    return null;
  }

  return entry.value;
};

/**
 * Set cached value
 */
export const setCache = (key: string, value: string): void => {
  globalCache.set(key, { value, timestamp: Date.now() });
};

/**
 * Clear entire cache
 */
export const clearCache = (): void => {
  globalCache.clear();
};

// ============================================
// Network State
// ============================================

let isOfflineMode = false;
let lastNetworkCheck = 0;
const NETWORK_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Check if we're in offline mode
 */
export const isOffline = (): boolean => isOfflineMode;

/**
 * Set offline mode manually
 */
export const setOfflineMode = (offline: boolean): void => {
  isOfflineMode = offline;
  if (offline) {
    console.log(pc.yellow('⚠ Offline mode enabled. Using built-in stable versions.'));
  }
};

// ============================================
// Network Requests with Timeout
// ============================================

/**
 * Fetch with smart timeout
 */
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs: number = NETWORK_TIMEOUT_MS
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === 'AbortError') {
      throw new Error(`Network timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
};

// ============================================
// NPM Registry Client
// ============================================

interface PackageInfo {
  name: string;
  version: string;
  description?: string;
}

/**
 * Get latest version of a package from npm registry
 * Falls back to built-in versions if offline or timeout
 */
export const getLatestVersion = async (packageName: string): Promise<string> => {
  // Check cache first
  const cached = getCached(`version:${packageName}`);
  if (cached) return cached;

  // Check for fallback first if offline
  if (isOfflineMode) {
    return FALLBACK_VERSIONS[packageName] || 'latest';
  }

  // Determine if this package has a max-major ceiling
  const maxMajor = MAX_MAJOR_CONSTRAINTS[packageName];

  try {
    let resolvedVersion: string;

    if (maxMajor !== undefined) {
      // Fetch the dist-tag for the specific major series (e.g. "latest-9" or "v9-latest")
      // npm uses the full package metadata to list versions; we pick the highest in the allowed major.
      const response = await fetchWithTimeout(
        `${NPM_REGISTRY_URL}/${encodeURIComponent(packageName)}`,
        { headers: { Accept: 'application/json' } }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = (await response.json()) as {
        versions: Record<string, unknown>;
        'dist-tags': Record<string, string>;
      };
      const allVersions = Object.keys(data.versions ?? {});

      // Filter to allowed major and pick the highest patch
      const compatible = allVersions
        .filter((v) => {
          const match = v.match(/^(\d+)\./);
          return match && parseInt(match[1], 10) <= maxMajor;
        })
        .sort((a, b) => {
          // Simple semver compare (no pre-release handling needed here)
          const parts = (v: string) => v.split('.').map(Number);
          const [aMaj, aMin, aPat] = parts(a);
          const [bMaj, bMin, bPat] = parts(b);
          return bMaj - aMaj || bMin - aMin || bPat - aPat;
        });

      if (compatible.length === 0) throw new Error('No compatible version found');

      resolvedVersion = `^${compatible[0]}`;
    } else {
      // Normal path: just use /latest dist-tag
      const response = await fetchWithTimeout(
        `${NPM_REGISTRY_URL}/${encodeURIComponent(packageName)}/latest`,
        { headers: { Accept: 'application/json' } }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = (await response.json()) as PackageInfo;
      resolvedVersion = `^${data.version}`;
    }

    // Cache the result
    setCache(`version:${packageName}`, resolvedVersion);
    return resolvedVersion;
  } catch {
    // Fallback to built-in versions
    return FALLBACK_VERSIONS[packageName] ?? 'latest';
  }
};

/**
 * Check network connectivity
 */
export const checkNetworkConnectivity = async (): Promise<boolean> => {
  const now = Date.now();
  if (now - lastNetworkCheck < NETWORK_CHECK_INTERVAL) {
    return !isOfflineMode;
  }

  try {
    await fetchWithTimeout(`${NPM_REGISTRY_URL}/react`, {}, 2000);
    lastNetworkCheck = now;
    isOfflineMode = false;
    return true;
  } catch {
    lastNetworkCheck = now;
    isOfflineMode = true;
    return false;
  }
};

/**
 * Get multiple package versions in parallel
 */
export const getPackageVersions = async (packages: string[]): Promise<Record<string, string>> => {
  const results: Record<string, string> = {};

  await Promise.all(
    packages.map(async (pkg) => {
      results[pkg] = await getLatestVersion(pkg);
    })
  );

  return results;
};

// ============================================
// Background Prefetching
// ============================================

let prefetchPromise: Promise<void> | null = null;

// Common packages to prefetch
const PREFETCH_PACKAGES = [
  'react',
  'react-dom',
  'zustand',
  'react-router-dom',
  '@tanstack/react-query',
  'react-hook-form',
  'zod',
  'tailwindcss',
  'lucide-react',
];

/**
 * Start background prefetching of common package versions
 * Call this while user is answering prompts
 */
export const startPrefetch = (): void => {
  if (prefetchPromise) return; // Already prefetching

  prefetchPromise = (async () => {
    try {
      // Check connectivity first
      const online = await checkNetworkConnectivity();
      if (!online) return;

      // Prefetch in background
      await getPackageVersions(PREFETCH_PACKAGES);
    } catch {
      // Silently fail - prefetch is optional
    } finally {
      prefetchPromise = null;
    }
  })();
};

/**
 * Wait for prefetch to complete (if running)
 */
export const waitForPrefetch = async (): Promise<void> => {
  if (prefetchPromise) {
    await prefetchPromise;
  }
};
