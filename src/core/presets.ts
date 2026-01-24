import { UserSelections } from '../types/index.js';

export type PresetName = 'minimal' | 'saas' | 'dashboard' | 'landing';


export const PRESETS: Record<PresetName, Partial<UserSelections>> = {
  minimal: {
    framework: 'react',
    variant: 'ts',
    language: 'typescript',
    styling: 'css-modules',
    ui: 'none',
    forms: 'none',
    state: 'none',
    routing: 'none',
    dataFetching: 'none',
    icons: 'none',
    structure: 'simple',

    optionalFeatures: [],
  },
  saas: {
    framework: 'react',
    variant: 'ts',
    language: 'typescript',
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
    framework: 'react',
    variant: 'ts',
    language: 'typescript',
    styling: 'tailwind',
    ui: 'shadcn',
    forms: 'rhf-zod',
    state: 'zustand',
    routing: 'react-router',
    dataFetching: 'tanstack-query',
    icons: 'lucide',
    structure: 'feature-based',

    aiInstructions: ['universal'],
  },
  landing: {
    framework: 'react',
    variant: 'ts',
    language: 'typescript',
    styling: 'tailwind',
    ui: 'shadcn',
    forms: 'none',
    state: 'none',
    routing: 'none',
    dataFetching: 'none',
    icons: 'lucide',
    structure: 'simple',

    optionalFeatures: ['animation', 'aiInstructions'],
    animation: 'framer-motion',
    aiInstructions: ['universal'],
  },

};
