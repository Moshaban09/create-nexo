/**
 * NEXO Project Setup Module
 *
 * This is the core engine that orchestrates project creation by running
 * configurators in the correct order with dependency resolution.
 *
 * Uses lazy loading for configurators to improve startup time.
 *
 * @module core/setup
 */

import path from 'node:path';
import type { ConfiguratorContext, UserSelections } from '../types/index.js';
import { createProjectDir, spinner } from '../utils/index.js';
import { log } from '../utils/logger.js';
import {
    getRequiredConfigurators,
    loadConfigurator,
    sortByDependencies,
} from './lazy-loader.js';

/**
 * Options for the setup function
 */
interface SetupOptions {
  /** User selections from prompts */
  selections: UserSelections;
  /** Target directory for project creation */
  targetDir: string;
  /** Use parallel execution for better performance (default: true) */
  parallel?: boolean;
}

/**
 * Run a configurator by name with lazy loading
 */
const runConfigurator = async (name: string, ctx: ConfiguratorContext): Promise<void> => {
  const configurator = await loadConfigurator(name);
  if (configurator) {
    await configurator(ctx);
  }
};

/**
 * Execute configurators sequentially with spinner display
 */
const executeSequential = async (
  configuratorNames: string[],
  ctx: ConfiguratorContext
): Promise<void> => {
  const stepNames: Record<string, string> = {
    framework: 'Setting up framework',
    variant: 'Configuring build variant',
    language: 'Setting up language',
    styling: 'Configuring styling',
    ui: 'Adding UI library',
    forms: 'Setting up forms',
    state: 'Configuring state management',
    routing: 'Setting up routing',
    dataFetching: 'Configuring data fetching',
    icons: 'Adding icon library',
    structure: 'Creating project structure',
    animation: 'Adding animation library',
    mandatory: 'Adding mandatory features',
    'ai-instructions': 'Generating AI instructions',
  };

  for (const name of configuratorNames) {
    const stepName = stepNames[name] || `Configuring ${name}`;
    const s = spinner(stepName);
    try {
      await runConfigurator(name, ctx);
      s.succeed();
    } catch (error) {
      s.fail();
      throw error;
    }
  }
};

/**
 * Execute configurators with parallel optimization
 */
const executeParallelOptimized = async (
  configuratorNames: string[],
  ctx: ConfiguratorContext
): Promise<void> => {
  // Group by phase for parallel execution
  const phase1 = ['framework', 'variant', 'language']; // Sequential - dependencies
  const phase2 = ['styling', 'forms', 'state', 'routing', 'dataFetching', 'icons', 'structure', 'animation', 'ai-instructions']; // Parallel
  const phase3 = ['ui']; // Depends on styling
  const phase4 = ['mandatory']; // Depends on all above

  const runPhase = async (names: string[], parallel = false) => {
    const toRun = names.filter(n => configuratorNames.includes(n));
    if (toRun.length === 0) return;

    if (parallel) {
      await Promise.all(toRun.map(name => runConfigurator(name, ctx)));
    } else {
      for (const name of toRun) {
        await runConfigurator(name, ctx);
      }
    }
  };

  // Execute phases
  log.info('  Setting up project...');
  await runPhase(phase1, false); // Sequential
  await runPhase(phase2, true);  // Parallel
  await runPhase(phase3, false);
  await runPhase(phase4, false);
};

/**
 * Create template files (entry, styles, readme)
 */
const createTemplateFiles = async (ctx: ConfiguratorContext): Promise<void> => {
  // Lazy load templates
  const { createEntryFiles, createReadme, createStyles } = await import('../templates/index.js');

  await createEntryFiles(ctx);
  await createStyles(ctx);
  await createReadme(ctx);
};

/**
 * Main setup function with lazy loading
 */
export const setup = async ({ selections, targetDir, parallel = true }: SetupOptions): Promise<void> => {
  const initSpinner = spinner('Initializing...');

  const projectPath = path.resolve(targetDir, selections.projectName);

  // Lazy load PackageManager
  const { PackageManager } = await import('../utils/package-manager.js');
  const pkg = new PackageManager(projectPath);

  initSpinner.stop();

  const ctx: ConfiguratorContext = {
    projectPath,
    selections,
    pkg,
  };

  // Pre-load package.json if exists
  await pkg.load(ctx);

  // Create project directory first
  await createProjectDir(ctx);

  // Get required configurators based on user selections
  const required = getRequiredConfigurators(ctx);

  // Sort by dependencies
  const sorted = sortByDependencies(required);

  // Execute configurators
  if (parallel) {
    await executeParallelOptimized(sorted, ctx);
  } else {
    await executeSequential(sorted, ctx);
  }

  // Create template files
  const s = spinner('Creating project files');
  log.newline();
  log.dim('  ├─ Base setup');
  log.dim('  ├─ Styling configuration');
  log.dim('  ├─ UI library setup');
    await createTemplateFiles(ctx);
    s.succeed();

  // Resolve latest dependencies (with graceful fallback on failure)
  const resolveSpinner = spinner('Resolving latest dependencies...');
  try {
    await pkg.resolveLatestVersions();
    resolveSpinner.succeed();
  } catch (error) {
    // Don't fail the entire setup if version resolution fails
    // The hardcoded versions will be used as fallback
    resolveSpinner.fail('Unable to resolve latest versions (using fallback)');
    log.dim(`    ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Save package.json changes once at the end
  await pkg.save();
};

// Export for testing
export { executeSequential, runConfigurator };

