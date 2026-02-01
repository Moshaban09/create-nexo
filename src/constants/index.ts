/**
 * NEXO Constants
 * Centralized configuration values to avoid magic strings throughout the codebase.
 */

// ============================================
// UI Library Options
// ============================================

export const UI_OPTIONS = {
  SHADCN: 'shadcn',
  RADIX: 'radix',

  HEROUI: 'heroui',
  ANTD: 'antd',
  CHAKRA: 'chakra',
  NONE: 'none',
} as const;

export type UIOption = (typeof UI_OPTIONS)[keyof typeof UI_OPTIONS];

// ============================================
// Styling Options
// ============================================

export const STYLING_OPTIONS = {
  TAILWIND: 'tailwind',
  CSS_MODULES: 'css-modules',

} as const;

export type StylingOption = (typeof STYLING_OPTIONS)[keyof typeof STYLING_OPTIONS];

// ============================================
// Framework Options
// ============================================

export const FRAMEWORK_OPTIONS = {
  REACT: 'react',
} as const;

export type FrameworkOption = (typeof FRAMEWORK_OPTIONS)[keyof typeof FRAMEWORK_OPTIONS];

// ============================================
// Variant Options
// ============================================

export const VARIANT_OPTIONS = {
  TS: 'ts',
  TS_COMPILER: 'ts-compiler',
  TS_SWC: 'ts-swc',
  JS: 'js',
  JS_COMPILER: 'js-compiler',
  JS_SWC: 'js-swc',
} as const;

export type VariantOption = (typeof VARIANT_OPTIONS)[keyof typeof VARIANT_OPTIONS];

// ============================================
// State Management Options
// ============================================

export const STATE_OPTIONS = {
  ZUSTAND: 'zustand',
  REDUX: 'redux',
  JOTAI: 'jotai',
  NONE: 'none',
} as const;

export type StateOption = (typeof STATE_OPTIONS)[keyof typeof STATE_OPTIONS];

// ============================================
// Forms Options
// ============================================

export const FORMS_OPTIONS = {
  RHF_ZOD: 'rhf-zod',
  RHF_YUP: 'rhf-yup',
  TANSTACK_FORM: 'tanstack-form',
  NONE: 'none',
} as const;

export type FormsOption = (typeof FORMS_OPTIONS)[keyof typeof FORMS_OPTIONS];

// ============================================
// Routing Options
// ============================================

export const ROUTING_OPTIONS = {
  REACT_ROUTER: 'react-router',
  TANSTACK_ROUTER: 'tanstack-router',
  NONE: 'none',
} as const;

export type RoutingOption = (typeof ROUTING_OPTIONS)[keyof typeof ROUTING_OPTIONS];

// ============================================
// Data Fetching Options
// ============================================

export const DATA_FETCHING_OPTIONS = {
  TANSTACK_QUERY: 'tanstack-query',
  AXIOS: 'axios',
  FETCH: 'fetch',
  NONE: 'none',
} as const;

export type DataFetchingOption = (typeof DATA_FETCHING_OPTIONS)[keyof typeof DATA_FETCHING_OPTIONS];

// ============================================
// Icons Options
// ============================================

export const ICONS_OPTIONS = {
  LUCIDE: 'lucide',
  HEROICONS: 'heroicons',
  NONE: 'none',
} as const;

export type IconsOption = (typeof ICONS_OPTIONS)[keyof typeof ICONS_OPTIONS];

// ============================================
// Structure Options
// ============================================

export const STRUCTURE_OPTIONS = {
  FEATURE_BASED: 'feature-based',
  SIMPLE: 'simple',
} as const;

export type StructureOption = (typeof STRUCTURE_OPTIONS)[keyof typeof STRUCTURE_OPTIONS];

// ============================================
// File Extensions
// ============================================

export const FILE_EXTENSIONS = {
  TS: 'ts',
  TSX: 'tsx',
  JS: 'js',
  JSX: 'jsx',
} as const;

// ============================================
// Filesystem & Path Constants
// ============================================

/** Windows MAX_PATH limit (260 characters) */
export const WINDOWS_MAX_PATH = 260;

/** Maximum length for a single path component (typical for most OSes) */
export const MAX_PATH_COMPONENT = 255;

/** Minimum required disk space in bytes (100MB) */
export const MIN_DISK_SPACE_BYTES = 100 * 1024 * 1024;

/** Default project name used if none is provided */
export const DEFAULT_PROJECT_NAME = 'my-nexo-app';

// ============================================
// Network & Retry Constants
// ============================================

export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries: number;
  /** Initial delay in ms before first retry (default: 1000) */
  initialDelayMs: number;
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier: number;
  /** Maximum delay between retries in ms (default: 10000) */
  maxDelayMs: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 10000,
};

// ============================================
// Package Versions
// ============================================

export const PACKAGE_VERSIONS = {
  REACT: '^19.0.0',
  REACT_DOM: '^19.0.0',
  VITE: '^6.0.0',
  TAILWINDCSS: '^4.0.0',
  ZUSTAND: '^5.0.0',
  TANSTACK_QUERY: '^5.0.0',
} as const;
