/**
 * NEXO Configuration File Support
 *
 * Allows users to define project configuration in a `nexo.config.json` file
 * instead of answering interactive prompts.
 *
 * @example
 * ```json
 * {
 *   "preset": "minimal",
 *   "projectName": "my-app",
 *   "styling": "tailwind",
 *   "ui": "shadcn"
 * }
 * ```
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { UserSelections } from '../types/index.js';
import { pathExists } from '../utils/fs.js';

// ============================================
// Configuration Types
// ============================================

export interface NexoConfig {
  /** Preset to use (overrides individual options) */
  preset?: 'minimal' | 'standard' | 'full' | 'saas' | 'dashboard';

  /** Project settings */
  projectName?: string;
  framework?: string;
  variant?: string;

  /** Styling & UI */
  styling?: string;
  ui?: string;
  icons?: string;

  /** Features */
  forms?: string;
  state?: string;
  routing?: string;
  dataFetching?: string;

  /** Structure */
  structure?: string;

  /** Optional features */

  testing?: string;
  linting?: string;
}

// ============================================
// Preset Configurations
// ============================================

export const PRESETS: Record<string, Partial<UserSelections>> = {
  minimal: {
    variant: 'ts',
    styling: 'tailwind',
    ui: 'none',
    forms: 'none',
    state: 'none',
    routing: 'none',
    dataFetching: 'none',
    icons: 'none',
    structure: 'simple',

  },
  standard: {
    variant: 'ts',
    styling: 'tailwind',
    ui: 'shadcn',
    forms: 'rhf-zod',
    state: 'zustand',
    routing: 'react-router',
    dataFetching: 'tanstack-query',
    icons: 'lucide',
    structure: 'feature-based',

  },
  full: {
    variant: 'ts',
    styling: 'tailwind',
    ui: 'shadcn',
    forms: 'rhf-zod',
    state: 'zustand',
    routing: 'react-router',
    dataFetching: 'tanstack-query',
    icons: 'lucide',
    structure: 'feature-based',

  },
  saas: {
    variant: 'ts',
    styling: 'tailwind',
    ui: 'shadcn',
    forms: 'rhf-zod',
    state: 'zustand',
    routing: 'react-router',
    dataFetching: 'tanstack-query',
    icons: 'lucide',
    structure: 'feature-based',

  },
  dashboard: {
    variant: 'ts',
    styling: 'tailwind',
    ui: 'shadcn',
    forms: 'rhf-zod',
    state: 'zustand',
    routing: 'react-router',
    dataFetching: 'tanstack-query',
    icons: 'lucide',
    structure: 'feature-based',

  },
};

// ============================================
// Configuration Loading
// ============================================

const CONFIG_FILES_JSON = ['nexo.config.json', '.nexorc.json', '.nexorc'];
const CONFIG_FILES_JS = ['nexo.config.ts', 'nexo.config.mjs', 'nexo.config.js'];

/**
 * Load configuration from a JSON config file
 */
async function loadJsonConfig(configPath: string): Promise<NexoConfig | null> {
  try {
    const content = await readFile(configPath, 'utf-8');
    return JSON.parse(content) as NexoConfig;
  } catch {
    return null;
  }
}

/**
 * Load configuration from a JS/TS config file using dynamic import
 */
async function loadJsConfig(configPath: string): Promise<NexoConfig | null> {
  try {
    // Convert to file:// URL for Windows compatibility
    const fileUrl = `file://${configPath.replace(/\\/g, '/')}`;
    const module = await import(fileUrl);
    return (module.default || module) as NexoConfig;
  } catch {
    return null;
  }
}

/**
 * Load configuration from a config file
 *
 * Supports:
 * - nexo.config.json, .nexorc.json, .nexorc (JSON)
 * - nexo.config.ts, nexo.config.mjs, nexo.config.js (ES Module)
 *
 * @param directory - Directory to search for config file
 * @returns Loaded configuration or null if not found
 */
export async function loadConfig(directory: string = process.cwd()): Promise<NexoConfig | null> {
  // Try JSON configs first
  for (const filename of CONFIG_FILES_JSON) {
    const configPath = path.join(directory, filename);

    if (await pathExists(configPath)) {
      const config = await loadJsonConfig(configPath);
      if (config) return config;
    }
  }

  // Try JS/TS configs
  for (const filename of CONFIG_FILES_JS) {
    const configPath = path.join(directory, filename);

    if (await pathExists(configPath)) {
      const config = await loadJsConfig(configPath);
      if (config) return config;
    }
  }

  return null;
}

/**
 * Apply preset and config to create user selections
 *
 * @param config - Configuration from file
 * @param defaults - Default values
 * @returns Merged user selections
 */
export function applyConfig(
  config: NexoConfig,
  defaults: Partial<UserSelections> = {}
): Partial<UserSelections> {
  // Start with preset if specified
  const preset = config.preset ? PRESETS[config.preset] || {} : {};

  // Merge: defaults < preset < explicit config
  return {
    ...defaults,
    ...preset,
    ...(config.projectName && { projectName: config.projectName }),
    ...(config.framework && { framework: config.framework as 'react' }),
    ...(config.variant && { variant: config.variant }),
    ...(config.styling && { styling: config.styling }),
    ...(config.ui && { ui: config.ui }),
    ...(config.forms && { forms: config.forms }),
    ...(config.state && { state: config.state }),
    ...(config.routing && { routing: config.routing }),
    ...(config.dataFetching && { dataFetching: config.dataFetching }),
    ...(config.icons && { icons: config.icons }),
    ...(config.structure && { structure: config.structure }),

    ...(config.testing && { testing: config.testing }),
    ...(config.linting && { linting: config.linting }),
  };
}

/**
 * Check if a config file exists in the specified directory
 */
export async function hasConfigFile(directory: string = process.cwd()): Promise<boolean> {
  const allConfigFiles = [...CONFIG_FILES_JSON, ...CONFIG_FILES_JS];
  for (const filename of allConfigFiles) {
    if (await pathExists(path.join(directory, filename))) {
      return true;
    }
  }
  return false;
}
