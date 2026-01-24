import path from 'node:path';
import { ConfiguratorContext } from '../types/index.js';
import {
  addDependency,
  ensureDir,
  getPackageJson,
  PackageJson,
  savePackageJson,
  writeFile,
} from './fs.js';

// ============================================
// Dependency Helpers
// ============================================

export interface DependencyConfig {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/**
 * Add multiple dependencies at once
 */
export const addDependencies = async (
  ctx: ConfiguratorContext,
  config: DependencyConfig
): Promise<PackageJson> => {
  const pkg = await getPackageJson(ctx);

  if (config.dependencies) {
    for (const [name, version] of Object.entries(config.dependencies)) {
      addDependency(pkg, name, version, false);
    }
  }

  if (config.devDependencies) {
    for (const [name, version] of Object.entries(config.devDependencies)) {
      addDependency(pkg, name, version, true);
    }
  }

  await savePackageJson(ctx, pkg);
  return pkg;
};

/**
 * Add dependencies only if a condition is met
 */
export const addDependenciesIf = async (
  ctx: ConfiguratorContext,
  condition: boolean,
  config: DependencyConfig
): Promise<PackageJson | null> => {
  if (!condition) return null;
  return addDependencies(ctx, config);
};

// ============================================
// File Creation Helpers
// ============================================

export interface FileConfig {
  path: string;
  content: string;
}

/**
 * Create multiple files at once
 */
export const createFiles = async (
  ctx: ConfiguratorContext,
  files: FileConfig[]
): Promise<void> => {
  await Promise.all(
    files.map(async (file) => {
      const fullPath = path.join(ctx.projectPath, file.path);
      await ensureDir(path.dirname(fullPath));
      await writeFile(fullPath, file.content);
    })
  );
};

/**
 * Create files from a record (path -> content)
 */
export const createFilesFromRecord = async (
  ctx: ConfiguratorContext,
  files: Record<string, string>
): Promise<void> => {
  const fileConfigs = Object.entries(files).map(([filePath, content]) => ({
    path: filePath,
    content,
  }));
  await createFiles(ctx, fileConfigs);
};

/**
 * Create a file only if it doesn't exist
 */
export const createFileIfNotExists = async (
  ctx: ConfiguratorContext,
  filePath: string,
  content: string
): Promise<boolean> => {
  const fullPath = path.join(ctx.projectPath, filePath);
  const { pathExists } = await import('./fs.js');

  if (await pathExists(fullPath)) {
    return false;
  }

  await ensureDir(path.dirname(fullPath));
  await writeFile(fullPath, content);
  return true;
};

// ============================================
// Directory Helpers
// ============================================

/**
 * Create multiple directories at once
 */
export const createDirectories = async (
  ctx: ConfiguratorContext,
  dirs: string[]
): Promise<void> => {
  await Promise.all(
    dirs.map((dir) => ensureDir(path.join(ctx.projectPath, dir)))
  );
};

// ============================================
// Template Helpers
// ============================================

/**
 * Simple template replacement
 */
export const template = (
  str: string,
  vars: Record<string, string>
): string => {
  let result = str;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
};

/**
 * Generate imports string from array
 */
export const generateImports = (
  imports: Array<{ from: string; imports: string[] | string; default?: string }>
): string => {
  return imports
    .map(({ from, imports: imp, default: defaultImport }) => {
      const parts: string[] = [];

      if (defaultImport) {
        parts.push(defaultImport);
      }

      if (Array.isArray(imp) && imp.length > 0) {
        parts.push(`{ ${imp.join(', ')} }`);
      } else if (typeof imp === 'string' && imp) {
        parts.push(`{ ${imp} }`);
      }

      return `import ${parts.join(', ')} from '${from}'`;
    })
    .join('\n');
};

// ============================================
// Configurator Utilities
// ============================================

/**
 * Skip configurator if selection is 'none'
 */
export const skipIfNone = (
  ctx: ConfiguratorContext,
  key: keyof typeof ctx.selections
): boolean => {
  return ctx.selections[key] === 'none';
};

/**
 * Get file extension based on variant
 */
export const getExtension = (ctx: ConfiguratorContext): { ts: boolean; ext: string; configExt: string } => {
  const isTypeScript = ctx.selections.variant.startsWith('ts');
  return {
    ts: isTypeScript,
    ext: isTypeScript ? 'tsx' : 'jsx',
    configExt: isTypeScript ? 'ts' : 'js',
  };
};

/**
 * Create a standard configurator with common patterns
 */
export interface StandardConfiguratorOptions {
  /** Selection key to check */
  selectionKey: string;
  /** Config map: selection value -> config */
  configs: Record<string, {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    files?: (ctx: ConfiguratorContext) => Record<string, string>;
    directories?: string[];
    setup?: (ctx: ConfiguratorContext) => Promise<void>;
  }>;
}

export const createStandardConfigurator = (
  options: StandardConfiguratorOptions
) => {
  return async (ctx: ConfiguratorContext): Promise<void> => {
    const selectionValue = ctx.selections[options.selectionKey as keyof typeof ctx.selections] as string;

    if (selectionValue === 'none') return;

    const config = options.configs[selectionValue];
    if (!config) return;

    // Add dependencies
    if (config.dependencies || config.devDependencies) {
      await addDependencies(ctx, {
        dependencies: config.dependencies,
        devDependencies: config.devDependencies,
      });
    }

    // Create directories
    if (config.directories) {
      await createDirectories(ctx, config.directories);
    }

    // Create files
    if (config.files) {
      const files = config.files(ctx);
      await createFilesFromRecord(ctx, files);
    }

    // Run custom setup
    if (config.setup) {
      await config.setup(ctx);
    }
  };
};

// ============================================
// Conditional Helpers
// ============================================

/**
 * Execute function only if condition is true
 */
export const doIf = async <T>(
  condition: boolean,
  fn: () => Promise<T>
): Promise<T | null> => {
  if (!condition) return null;
  return fn();
};

/**
 * Select value based on condition
 */
export const selectIf = <T>(
  condition: boolean,
  trueValue: T,
  falseValue: T
): T => {
  return condition ? trueValue : falseValue;
};

/**
 * Build array conditionally
 */
export const buildArray = <T>(
  ...items: Array<T | false | null | undefined>
): T[] => {
  return items.filter((item): item is T => item !== false && item !== null && item !== undefined);
};

/**
 * Build object conditionally
 */
export const buildObject = <T extends Record<string, unknown>>(
  ...entries: Array<[string, unknown] | false | null | undefined>
): T => {
  const result: Record<string, unknown> = {};

  for (const entry of entries) {
    if (entry && Array.isArray(entry)) {
      const [key, value] = entry;
      if (value !== undefined && value !== null) {
        result[key] = value;
      }
    }
  }

  return result as T;
};
