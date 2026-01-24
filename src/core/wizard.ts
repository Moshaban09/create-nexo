/**
 * NEXO CLI - Wizard Mode
 *
 * A simplified, guided mode for beginners that automatically
 * recommends configurations based on project type.
 */

import * as p from '@clack/prompts';
import pc from 'picocolors';
import type { UserSelections } from '../types/index.js';
import { log } from '../utils/logger.js';

// ============================================
// Types
// ============================================

export type ProjectType =
  | 'webapp'
  | 'dashboard'
  | 'landing'
  | 'api-client'
  | 'portfolio'
  | 'ecommerce';

export interface WizardResult {
  projectName: string;
  projectType: ProjectType;
  selections: UserSelections;
  useRecommended: boolean;
}

export interface ProjectTypeConfig {
  name: string;
  description: string;
  icon: string;
  recommendations: Partial<UserSelections>;
  features: string[];
}

// ============================================
// Project Type Configurations
// ============================================

export const projectTypes: Record<ProjectType, ProjectTypeConfig> = {
  webapp: {
    name: 'Web Application',
    description: 'Interactive web application with forms and state',
    icon: '🌐',
    recommendations: {
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
    features: [
      'TypeScript for type safety',
      'Tailwind CSS + shadcn/ui',
      'Form handling with validation',
      'State management',
      'Client-side routing',
      'TanStack Query for data fetching',
    ],
  },
  dashboard: {
    name: 'Admin Dashboard',
    description: 'Data-rich admin panel with charts and tables',
    icon: '📊',
    recommendations: {
      variant: 'ts',
      styling: 'tailwind',
      ui: 'shadcn',
      forms: 'rhf-zod',
      state: 'redux',
      routing: 'react-router',
      dataFetching: 'tanstack-query',
      icons: 'lucide',
      structure: 'fsd',
    },
    features: [
      'TypeScript for type safety',
      'Tailwind CSS + shadcn/ui',
      'Redux for complex state',
      'FSD architecture',
      'TanStack Query for data fetching',
    ],
  },
  landing: {
    name: 'Landing Page',
    description: 'Fast, SEO-optimized marketing page',
    icon: '🚀',
    recommendations: {
      variant: 'ts',
      styling: 'tailwind',
      ui: 'none',
      forms: 'none',
      state: 'none',
      routing: 'none',
      dataFetching: 'none',
      icons: 'lucide',
      structure: 'simple',
    },
    features: [
      'TypeScript for type safety',
      'Tailwind CSS for styling',
      'Minimal dependencies',
      'Fast load times',
      'Simple structure',
      'Easy to customize',
    ],
  },
  'api-client': {
    name: 'API Client',
    description: 'Application consuming external APIs',
    icon: '🔌',
    recommendations: {
      variant: 'ts',
      styling: 'tailwind',
      ui: 'none',
      forms: 'rhf-zod',
      state: 'zustand',
      routing: 'react-router',
      dataFetching: 'tanstack-query',
      icons: 'lucide',
      structure: 'feature-based',
    },
    features: [
      'TypeScript for type safety',
      'TanStack Query for API calls',
      'Zustand for client state',

      'Form handling',
      'Feature-based structure',
    ],
  },
  portfolio: {
    name: 'Portfolio Website',
    description: 'Personal portfolio or showcase site',
    icon: '👤',
    recommendations: {
      variant: 'ts',
      styling: 'tailwind',
      ui: 'none',
      forms: 'none',
      state: 'none',
      routing: 'react-router',
      dataFetching: 'none',
      icons: 'lucide',
      structure: 'simple',
    },
    features: [
      'TypeScript for type safety',
      'Tailwind CSS for styling',
      'Client-side routing',
      'Lucide icons',
      'Simple structure',
      'Easy to personalize',
    ],
  },
  ecommerce: {
    name: 'E-Commerce',
    description: 'Online store with cart and checkout',
    icon: '🛒',
    recommendations: {
      variant: 'ts',
      styling: 'tailwind',
      ui: 'shadcn',
      forms: 'rhf-zod',
      state: 'zustand',
      routing: 'tanstack-router',
      dataFetching: 'tanstack-query',
      icons: 'lucide',
      structure: 'fsd',

    },
    features: [
      'TypeScript for type safety',
      'Tailwind CSS + shadcn/ui',
      'Zustand for cart state',
      'TanStack Router (type-safe)',
      'TanStack Query for data fetching',
    ],
  },
};

// ============================================
// Wizard Functions
// ============================================

/**
 * Format features list for display
 */
const formatFeatures = (features: string[]): string => {
  return features.map(f => `  ${pc.green('✓')} ${f}`).join('\n');
};

/**
 * Run the wizard mode
 */
export const runWizard = async (): Promise<WizardResult | null> => {
  log.print(pc.cyan('\n🧙 Welcome to NEXO Wizard!\n'));
  log.dim('Let me help you set up your project.\n');

  // Step 1: Project name
  const projectName = await p.text({
    message: 'What is your project name?',
    placeholder: 'my-awesome-app',
    defaultValue: 'my-app',
    validate: (value) => {
      const v = value || 'my-app';
      if (!/^[a-z0-9-_]+$/i.test(v)) {
        return 'Project name can only contain letters, numbers, hyphens, and underscores';
      }
      return undefined;
    },
  });

  if (p.isCancel(projectName)) {
    p.cancel('Wizard cancelled.');
    return null;
  }

  // Step 2: Project type
  const projectType = await p.select({
    message: 'What are you building?',
    options: Object.entries(projectTypes).map(([value, config]) => ({
      value: value as ProjectType,
      label: `${config.icon} ${config.name}`,
      hint: config.description,
    })),
  });

  if (p.isCancel(projectType)) {
    p.cancel('Wizard cancelled.');
    return null;
  }

  const selectedType = projectTypes[projectType as ProjectType];

  // Step 3: Show recommendations
  console.log();
  p.note(
    `${pc.bold('Recommended stack for ' + selectedType.name + ':')}\n\n${formatFeatures(selectedType.features)}`,
    '📦 Configuration'
  );

  // Step 4: Confirm or customize
  const useRecommended = await p.confirm({
    message: 'Use these recommended settings?',
    initialValue: true,
  });

  if (p.isCancel(useRecommended)) {
    p.cancel('Wizard cancelled.');
    return null;
  }

  // Build selections
  const recommendations = selectedType.recommendations;
  const selections: UserSelections = {
    projectName: projectName as string,
    framework: 'react',
    variant: recommendations.variant || 'ts',
    language: (recommendations.variant || 'ts').startsWith('ts') ? 'typescript' : 'javascript',
    styling: recommendations.styling || 'tailwind',
    ui: recommendations.ui || 'none',
    forms: recommendations.forms || 'none',
    state: recommendations.state || 'none',
    routing: recommendations.routing || 'none',
    dataFetching: recommendations.dataFetching || 'none',
    icons: recommendations.icons || 'none',
    structure: recommendations.structure || 'simple',

  };

  return {
    projectName: projectName as string,
    projectType: projectType as ProjectType,
    selections,
    useRecommended: useRecommended as boolean,
  };
};

/**
 * Get recommendations for a project type
 */
export const getRecommendationsFor = (type: ProjectType): ProjectTypeConfig => {
  return projectTypes[type];
};

/**
 * Get all project types
 */
export const getProjectTypes = (): Array<{ value: ProjectType; config: ProjectTypeConfig }> => {
  return Object.entries(projectTypes).map(([value, config]) => ({
    value: value as ProjectType,
    config,
  }));
};

export default runWizard;
