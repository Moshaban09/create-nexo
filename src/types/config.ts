import type { PackageManager } from '../utils/package-manager.js';

export interface UserSelections {
  projectName: string;
  framework: 'react';
  variant: string;
  styling: string;
  ui: string;
  forms: string;
  state: string;
  routing: string;
  dataFetching: string;
  icons: string;
  structure: string;
  language?: string;

  // New optional features
  testing?: string;
  linting?: string;
  animation?: string;
  backend?: string;



  // AI Instructions
  aiInstructions?: string[];
  optionalFeatures?: string[];
  // Variant flags
  hasCompiler?: boolean;
  hasSWC?: boolean;
  installDependencies?: boolean;
  packageManager?: string;
  rtl?: boolean;
  importAlias?: boolean;
}

export interface ConfiguratorContext {
  projectPath: string;
  projectName?: string;
  selections: UserSelections;
  pkg?: PackageManager;
}

export type Configurator = (ctx: ConfiguratorContext) => Promise<void>;
