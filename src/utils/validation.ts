import os from 'node:os';
import {
  DATA_FETCHING_OPTIONS,
  FORMS_OPTIONS,
  FRAMEWORK_OPTIONS,
  ICONS_OPTIONS,
  MAX_PATH_COMPONENT,
  ROUTING_OPTIONS,
  STATE_OPTIONS,
  STRUCTURE_OPTIONS,
  STYLING_OPTIONS,
  UI_OPTIONS,
  VARIANT_OPTIONS,
  WINDOWS_MAX_PATH,
} from '../constants/index.js';
import { CompatibilityError, ValidationError } from '../errors/index.js';

// ============================================
// Type Definitions
// ============================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface CompatibilityRule {
  name: string;
  check: (selections: Record<string, string>) => boolean;
  message: string;
  suggestion?: string;
  severity: 'error' | 'warning';
}

// Path limits are now imported from ../constants/index.js
// ============================================
// Valid Options
// ============================================

export const VALID_OPTIONS = {
  framework: Object.values(FRAMEWORK_OPTIONS),
  variant: Object.values(VARIANT_OPTIONS),
  language: ['typescript', 'javascript'] as const,
  styling: Object.values(STYLING_OPTIONS),
  ui: Object.values(UI_OPTIONS),
  forms: Object.values(FORMS_OPTIONS),
  state: Object.values(STATE_OPTIONS),
  routing: Object.values(ROUTING_OPTIONS),
  dataFetching: Object.values(DATA_FETCHING_OPTIONS),
  icons: Object.values(ICONS_OPTIONS),
  structure: Object.values(STRUCTURE_OPTIONS),
  testing: ['vitest', 'jest'] as const,
  linting: ['eslint-prettier', 'biome'] as const,
  api: ['openapi', 'graphql', 'trpc'] as const,
  animation: ['framer-motion', 'react-spring'] as const,
} as const;

// ============================================
// Compatibility Rules
// ============================================

export const compatibilityRules: CompatibilityRule[] = [
  // UI Library requires specific styling
  {
    name: 'shadcn-requires-tailwind',
    check: (s) => s.ui === 'shadcn' && s.styling !== 'tailwind',
    message: 'shadcn/ui requires Tailwind CSS as the styling solution',
    suggestion: 'Change styling to "tailwind" or choose a different UI library',
    severity: 'error',
  },
  {
    name: 'heroui-requires-tailwind',
    check: (s) => s.ui === 'heroui' && s.styling !== 'tailwind',
    message: 'HeroUI requires Tailwind CSS as the styling solution',
    suggestion: 'Change styling to "tailwind" or choose a different UI library',
    severity: 'error',
  },

  // React Compiler requirements
  {
    name: 'react-compiler-react-only',
    check: (s) => s.variant?.includes('compiler') && s.framework !== 'react',
    message: 'React Compiler is only available for React framework',
    suggestion: 'Change framework to "react" or choose a different variant',
    severity: 'error',
  },

  // SWC requirements
  {
    name: 'swc-react-only',
    check: (s) => s.variant?.includes('swc') && s.framework !== 'react',
    message: 'SWC plugin is currently only configured for React',
    suggestion: 'Use default variant for non-React frameworks',
    severity: 'warning',
  },

  // Routing recommendations
  {
    name: 'tanstack-router-typescript',
    check: (s) => s.routing === 'tanstack-router' && !s.variant?.startsWith('ts'),
    message: 'TanStack Router works best with TypeScript for full type safety',
    suggestion: 'Consider using TypeScript variant for better DX',
    severity: 'warning',
  },

  // Forms + Validation combinations
  {
    name: 'formik-yup-legacy-warning',
    check: (s) => s.forms === 'formik-yup',
    message: 'Formik + Yup is considered legacy - React Hook Form offers better performance',
    suggestion: 'Consider using "rhf-zod" for better performance and type safety',
    severity: 'warning',
  },

  // UI Library bundle warnings
  {
    name: 'antd-bundle-warning',
    check: (s) => s.ui === 'antd',
    message: 'Ant Design has a large bundle size (~120KB gzipped)',
    suggestion: 'Consider shadcn/ui for smaller bundle size',
    severity: 'warning',
  },
  {
    name: 'chakra-bundle-warning',
    check: (s) => s.ui === 'chakra',
    message: 'Chakra UI has a moderate bundle size (~80KB gzipped)',
    suggestion: 'Consider shadcn/ui for smaller bundle with similar features',
    severity: 'warning',
  },



  // Structure recommendations
  {
    name: 'fsd-typescript-recommended',
    check: (s) => s.structure === 'fsd' && !s.variant?.startsWith('ts'),
    message: 'Feature-Sliced Design benefits greatly from TypeScript',
    suggestion: 'Consider using TypeScript for better FSD experience',
    severity: 'warning',
  },
];

// ============================================
// Validation Functions
// ============================================

/**
 * Validate project name
 */
export const validateProjectName = (name: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push('Project name is required');
  } else {
    // Check length
    if (name.length > 214) {
      errors.push('Project name must be less than 214 characters');
    }

    // Check valid characters (npm naming rules)
    if (!/^[a-z0-9]/.test(name)) {
      errors.push('Project name must start with a lowercase letter or number');
    }

    if (!/^[a-z0-9._-]+$/.test(name)) {
      errors.push('Project name can only contain lowercase letters, numbers, hyphens, underscores, and dots');
      suggestions.push('Use kebab-case: my-project-name');
    }

    // Check for reserved names
    const reserved = ['node_modules', 'favicon.ico', 'package', 'test'];
    if (reserved.includes(name.toLowerCase())) {
      errors.push(`"${name}" is a reserved name`);
    }

    // Warnings for non-ideal names
    if (name.startsWith('.')) {
      warnings.push('Project names starting with "." are hidden on Unix systems');
    }

    if (name.includes('..')) {
      errors.push('Project name cannot contain ".."');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
};

/**
 * Validate a single selection against valid options
 */
export const validateOption = (
  key: string,
  value: string,
  validOptions?: readonly string[]
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (!value || value === '') {
    // Some options allow empty/none
    return { valid: true, errors, warnings, suggestions };
  }

  const options = validOptions || VALID_OPTIONS[key as keyof typeof VALID_OPTIONS];

  if (options && !options.includes(value as never)) {
    errors.push(`Invalid ${key}: "${value}". Valid options: ${options.join(', ')}`);
    suggestions.push(`Choose one of: ${options.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
};

/**
 * Validate all selections
 */
export const validateSelections = (
  selections: Record<string, unknown>
): ValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const allSuggestions: string[] = [];

  // Validate project name
  if (selections.projectName) {
    const nameResult = validateProjectName(selections.projectName as string);
    allErrors.push(...nameResult.errors);
    allWarnings.push(...nameResult.warnings);
    allSuggestions.push(...nameResult.suggestions);
  }

  // Validate each option
  const optionKeys = Object.keys(VALID_OPTIONS) as (keyof typeof VALID_OPTIONS)[];
  for (const key of optionKeys) {
    const value = selections[key];
    if (value !== undefined && value !== null) {
      const result = validateOption(key, value as string);
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
      allSuggestions.push(...result.suggestions);
    }
  }

  // Check compatibility rules
  const stringSelections = Object.fromEntries(
    Object.entries(selections).map(([k, v]) => [k, String(v)])
  );

  for (const rule of compatibilityRules) {
    if (rule.check(stringSelections)) {
      if (rule.severity === 'error') {
        allErrors.push(rule.message);
      } else {
        allWarnings.push(rule.message);
      }
      if (rule.suggestion) {
        allSuggestions.push(rule.suggestion);
      }
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: [...new Set(allErrors)], // Remove duplicates
    warnings: [...new Set(allWarnings)],
    suggestions: [...new Set(allSuggestions)],
  };
};

/**
 * Validate and throw if invalid
 */
export const validateOrThrow = (selections: Record<string, unknown>): void => {
  const result = validateSelections(selections);

  if (!result.valid) {
    throw new ValidationError(
      result.errors.join('; '),
      { errors: result.errors, selections }
    );
  }
};

/**
 * Check compatibility and throw if incompatible
 */
export const checkCompatibilityOrThrow = (selections: Record<string, string>): void => {
  const incompatible = compatibilityRules
    .filter(rule => rule.severity === 'error' && rule.check(selections));

  if (incompatible.length > 0) {
    throw new CompatibilityError(
      incompatible.map(r => r.message).join('; '),
      selections
    );
  }
};

/**
 * Get compatibility warnings (non-blocking)
 */
export const getCompatibilityWarnings = (
  selections: Record<string, string>
): string[] => {
  return compatibilityRules
    .filter(rule => rule.severity === 'warning' && rule.check(selections))
    .map(rule => rule.message);
};

/**
 * Sanitize project name
 */
export const sanitizeProjectName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 214);
};

// ============================================
// Path Validation Functions
// ============================================

/**
 * Validate path length for Windows compatibility
 * @param fullPath - The full absolute path to validate
 * @returns ValidationResult
 */
export const validatePathLength = (fullPath: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const isWindows = os.platform() === 'win32';

  // Check total path length on Windows
  if (isWindows && fullPath.length >= WINDOWS_MAX_PATH) {
    errors.push(
      `Path too long: ${fullPath.length} characters exceeds Windows limit of ${WINDOWS_MAX_PATH}`
    );
    suggestions.push('Use a shorter project name or parent directory');
  } else if (fullPath.length >= WINDOWS_MAX_PATH) {
    // Warning for non-Windows users about portability
    warnings.push(
      `Path length (${fullPath.length}) may cause issues on Windows (limit: ${WINDOWS_MAX_PATH})`
    );
  }

  // Check individual path components
  const separator = isWindows ? /[\\/]/ : /\//;
  const components = fullPath.split(separator).filter(Boolean);

  for (const component of components) {
    if (component.length > MAX_PATH_COMPONENT) {
      errors.push(
        `Path component "${component.slice(0, 30)}..." is too long (${component.length} chars, max: ${MAX_PATH_COMPONENT})`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
};

/**
 * Validate full project path including name and path length
 * @param projectPath - The full project path to validate
 * @param projectName - The project name (optional, extracted from path if not provided)
 * @returns ValidationResult
 */
export const validateProjectPath = (
  projectPath: string,
  projectName?: string
): ValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const allSuggestions: string[] = [];

  // Validate project name if provided
  const name = projectName || projectPath.split(/[\\/]/).pop() || '';
  const nameResult = validateProjectName(name);
  allErrors.push(...nameResult.errors);
  allWarnings.push(...nameResult.warnings);
  allSuggestions.push(...nameResult.suggestions);

  // Validate path length
  const pathResult = validatePathLength(projectPath);
  allErrors.push(...pathResult.errors);
  allWarnings.push(...pathResult.warnings);
  allSuggestions.push(...pathResult.suggestions);

  return {
    valid: allErrors.length === 0,
    errors: [...new Set(allErrors)],
    warnings: [...new Set(allWarnings)],
    suggestions: [...new Set(allSuggestions)],
  };
};
