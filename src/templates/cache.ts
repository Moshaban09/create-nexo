/**
 * NEXO Template Cache
 * Caches generated template strings to avoid rebuilding on repeated calls
 */

// ============================================
// Cache Storage
// ============================================

interface CacheEntry {
  content: string;
  timestamp: number;
}

const templateCache = new Map<string, CacheEntry>();

// Cache TTL in milliseconds (10 minutes for templates)
const CACHE_TTL_MS = 600000;

// ============================================
// Cache Functions
// ============================================

/**
 * Generate a cache key from template parameters
 */
export const getCacheKey = (
  templateName: string,
  ...params: (string | boolean | undefined)[]
): string => {
  return `${templateName}:${params.map(p => String(p)).join(':')}`;
};

/**
 * Get cached template if available and not expired
 */
export const getCachedTemplate = (key: string): string | null => {
  const entry = templateCache.get(key);
  if (!entry) return null;

  // Check if expired
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    templateCache.delete(key);
    return null;
  }

  return entry.content;
};

/**
 * Cache a template result
 */
export const cacheTemplate = (key: string, content: string): void => {
  templateCache.set(key, {
    content,
    timestamp: Date.now(),
  });
};

/**
 * Get template from cache or generate it
 * This is the main function to use for caching templates
 */
export const withCache = (
  templateName: string,
  params: (string | boolean | undefined)[],
  generator: () => string
): string => {
  const key = getCacheKey(templateName, ...params);

  // Check cache first
  const cached = getCachedTemplate(key);
  if (cached !== null) {
    return cached;
  }

  // Generate and cache
  const content = generator();
  cacheTemplate(key, content);
  return content;
};

/**
 * Clear all cached templates
 * Useful after configuration changes
 */
export const clearTemplateCache = (): void => {
  templateCache.clear();
};

/**
 * Get cache statistics
 */
export const getCacheStats = (): { size: number; keys: string[] } => {
  return {
    size: templateCache.size,
    keys: Array.from(templateCache.keys()),
  };
};
