/**
 * NEXO CLI - Lazy Loader
 *
 * Dynamically loads configurators on-demand to improve startup time.
 * Only loads configurators that are actually needed based on user selections.
 */

import type { Configurator, ConfiguratorContext } from '../types/index.js';

// ============================================
// ============================================
// Types
// ============================================

export type ConfiguratorModule = {
  default?: Configurator;
  [key: string]: Configurator | undefined;
};

export interface LazyConfiguratorConfig {
  /** Loader function for dynamic import */
  loader: () => Promise<ConfiguratorModule>;
  /** Export name (default: 'default' or derived from path) */
  exportName?: string;
  /** Condition to load this configurator */
  condition?: (ctx: ConfiguratorContext) => boolean;
  /** Dependencies (other configurator names) */
  dependencies?: string[];
}

export interface LazyLoaderOptions {
  /** Cache loaded modules */
  cache?: boolean;
}

// ============================================
// Configurator Registry
// ============================================

/**
 * Registry of available configurators with their lazy load configs
 */
export const configuratorRegistry: Record<string, LazyConfiguratorConfig> = {
  // Core
  framework: {
    loader: () => import('../configurators/core/framework.js'),
    exportName: 'frameworkConfigurator',
  },
  variant: {
    loader: () => import('../configurators/core/variant.js'),
    exportName: 'variantConfigurator',
    dependencies: ['framework'],
  },
  language: {
    loader: () => import('../configurators/core/language.js'),
    exportName: 'languageConfigurator',
    dependencies: ['variant'],
  },

  // Styling
  styling: {
    loader: () => import('../configurators/styling/styling.js'),
    exportName: 'stylingConfigurator',
    dependencies: ['language'],
  },
  ui: {
    loader: () => import('../configurators/styling/ui.js'),
    exportName: 'uiConfigurator',
    dependencies: ['styling'],
    condition: (ctx) => ctx.selections.ui !== 'none',
  },
  icons: {
    loader: () => import('../configurators/styling/icons.js'),
    exportName: 'iconsConfigurator',
    dependencies: ['language'],
    condition: (ctx) => ctx.selections.icons !== 'none',
  },

  // State
  forms: {
    loader: () => import('../configurators/state/forms.js'),
    exportName: 'formsConfigurator',
    dependencies: ['language'],
    condition: (ctx) => ctx.selections.forms !== 'none',
  },
  state: {
    loader: () => import('../configurators/state/state.js'),
    exportName: 'stateConfigurator',
    dependencies: ['language'],
    condition: (ctx) => ctx.selections.state !== 'none',
  },
  routing: {
    loader: () => import('../configurators/state/routing.js'),
    exportName: 'routingConfigurator',
    dependencies: ['language'],
    condition: (ctx) => ctx.selections.routing !== 'none',
  },
  dataFetching: {
    loader: () => import('../configurators/state/dataFetching.js'),
    exportName: 'dataFetchingConfigurator',
    dependencies: ['language'],
    condition: (ctx) => ctx.selections.dataFetching !== 'none',
  },
  animation: {
    loader: () => import('../configurators/state/animation.js'),
    exportName: 'animationConfigurator',
    dependencies: ['language'],
    condition: (ctx) => ctx.selections.animation !== undefined && ctx.selections.animation !== 'none',
  },

  // Project
  structure: {
    loader: () => import('../configurators/project/structure.js'),
    exportName: 'structureConfigurator',
    dependencies: ['language'],
  },

  mandatory: {
    loader: () => import('../configurators/project/mandatory.js'),
    exportName: 'mandatoryConfigurator',
    dependencies: ['styling', 'structure'],
  },
  'ai-instructions': {
    loader: () => import('../configurators/project/ai-instructions.js'),
    exportName: 'aiInstructionsConfigurator',
    dependencies: ['language'],
    condition: (ctx) => {
      const aiTools = ctx.selections.aiInstructions as string[] | undefined;
      return aiTools !== undefined && aiTools.length > 0;
    },
  },

  // Optional Features
  testing: {
    loader: () => import('../configurators/project/testing.js'),
    exportName: 'testingConfigurator',
    dependencies: ['mandatory'],
    condition: (ctx) => ctx.selections.testing !== undefined && ctx.selections.testing !== 'none',
  },
  linting: {
    loader: () => import('../configurators/project/linting.js'),
    exportName: 'lintingConfigurator',
    dependencies: ['mandatory'],
    condition: (ctx) => ctx.selections.linting !== undefined && ctx.selections.linting !== 'none',
  },
};

// ============================================
// Lazy Loader Implementation
// ============================================

/**
 * Module cache for loaded configurators
 */
const moduleCache = new Map<string, ConfiguratorModule>();

/**
 * Load a configurator module dynamically
 */
export const loadConfigurator = async (
  name: string,
  options: LazyLoaderOptions = {}
): Promise<Configurator | null> => {
  const config = configuratorRegistry[name];
  if (!config) {
    console.warn(`Unknown configurator: ${name}`);
    return null;
  }

  const { cache = true } = options;

  // Check cache
  // Check cache
  // Use name as cache key for simplicity in bundled env, or keep simple string
  const cacheKey = name;
  if (cache && moduleCache.has(cacheKey)) {
    const module = moduleCache.get(cacheKey)!;
    return getExport(module, config.exportName || name);
  }

  try {
    // Execute loader function (explicit import)
    const module = await config.loader();

    // Cache the module
    if (cache) {
      moduleCache.set(cacheKey, module);
    }

    return getExport(module, config.exportName || name);
  } catch (error) {
    console.error(`Failed to load configurator "${name}":`, error);
    return null;
  }
};

/**
 * Get export from module
 */
const getExport = (module: ConfiguratorModule, exportName: string): Configurator | null => {
  // Try exact name
  if (module[exportName]) {
    return module[exportName] as Configurator;
  }

  // Try default export
  if (module.default) {
    return module.default;
  }

  // Try with "Configurator" suffix
  const withSuffix = `${exportName}Configurator`;
  if (module[withSuffix]) {
    return module[withSuffix] as Configurator;
  }

  return null;
};

/**
 * Load multiple configurators
 */
export const loadConfigurators = async (
  names: string[],
  options: LazyLoaderOptions = {}
): Promise<Map<string, Configurator>> => {
  const results = new Map<string, Configurator>();

  await Promise.all(
    names.map(async (name) => {
      const configurator = await loadConfigurator(name, options);
      if (configurator) {
        results.set(name, configurator);
      }
    })
  );

  return results;
};

/**
 * Get configurators that should run based on context
 */
export const getRequiredConfigurators = (ctx: ConfiguratorContext): string[] => {
  const required: string[] = [];

  for (const [name, config] of Object.entries(configuratorRegistry)) {
    // Check condition
    if (config.condition && !config.condition(ctx)) {
      continue;
    }
    required.push(name);
  }

  return required;
};

/**
 * Sort configurators by dependencies
 */
export const sortByDependencies = (names: string[]): string[] => {
  const sorted: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  const visit = (name: string) => {
    if (visited.has(name)) return;
    if (visiting.has(name)) {
      throw new Error(`Circular dependency detected: ${name}`);
    }

    visiting.add(name);

    const config = configuratorRegistry[name];
    if (config?.dependencies) {
      for (const dep of config.dependencies) {
        if (names.includes(dep)) {
          visit(dep);
        }
      }
    }

    visiting.delete(name);
    visited.add(name);
    sorted.push(name);
  };

  for (const name of names) {
    visit(name);
  }

  return sorted;
};

/**
 * Clear the module cache
 */
export const clearModuleCache = (): void => {
  moduleCache.clear();
};

/**
 * Preload configurators (for warming up)
 */
export const preloadConfigurators = async (
  names?: string[],
  options: LazyLoaderOptions = {}
): Promise<void> => {
  const toLoad = names || Object.keys(configuratorRegistry);
  await loadConfigurators(toLoad, options);
};

export default loadConfigurator;
