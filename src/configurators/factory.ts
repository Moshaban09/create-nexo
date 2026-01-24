/**
 * NEXO CLI - Configurator Factory
 *
 * Factory functions to create configurators with less boilerplate.
 * Reduces code duplication across dependency-only configurators.
 */

import type { ConfiguratorContext, UserSelections } from '../types/index.js';

type DependencyConfig = Record<string, string>;
type DependencyConfigs = Record<string, DependencyConfig>;

/**
 * Creates a simple dependency configurator.
 *
 * Use this for configurators that only add dependencies based on user selection.
 *
 * @example
 * ```typescript
 * const FORMS_CONFIGS = {
 *   'rhf-zod': { 'react-hook-form': '^7.54.0', 'zod': '^3.24.0' },
 *   'formik-yup': { 'formik': '^2.4.6', 'yup': '^1.6.0' },
 * };
 *
 * export const formsConfigurator = createDependencyConfigurator('forms', FORMS_CONFIGS);
 * ```
 */
export const createDependencyConfigurator = (
  selectionKey: keyof UserSelections,
  configs: DependencyConfigs,
  options: {
    /** Skip if this condition returns true */
    skipIf?: (ctx: ConfiguratorContext) => boolean;
    /** Post-install hook for additional setup */
    afterInstall?: (ctx: ConfiguratorContext, selection: string) => Promise<void>;
  } = {}
) => {
  return async (ctx: ConfiguratorContext): Promise<void> => {
    const selection = ctx.selections[selectionKey];

    // Skip if no selection or 'none'
    if (!selection || selection === 'none') return;

    // Skip if custom condition
    if (options.skipIf?.(ctx)) return;

    const config = configs[selection as string];
    if (!config) return;

    // Add dependencies
    if (ctx.pkg) {
      for (const [name, version] of Object.entries(config)) {
        ctx.pkg.add(name, version);
      }
    }

    // Run post-install hook
    if (options.afterInstall) {
      await options.afterInstall(ctx, selection as string);
    }
  };
};

/**
 * Creates a configurator with dev dependencies.
 */
export const createDevDependencyConfigurator = (
  selectionKey: keyof UserSelections,
  configs: DependencyConfigs
) => {
  return async (ctx: ConfiguratorContext): Promise<void> => {
    const selection = ctx.selections[selectionKey];
    if (!selection || selection === 'none') return;

    const config = configs[selection as string];
    if (!config) return;

    if (ctx.pkg) {
      for (const [name, version] of Object.entries(config)) {
        ctx.pkg.add(name, version, true); // true = devDependency
      }
    }
  };
};

export type { DependencyConfig, DependencyConfigs };

