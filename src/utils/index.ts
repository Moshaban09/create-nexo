export * from './cache.js';
export * from './detection.js';
export { generateFileTree } from './fileTree.js';
export * from './fs-checks.js';
export * from './fs.js';
export * from './github.js';
export * from './helpers.js';
export * from './package-manager.js';
export * from './pm-utils.js';
export * from './prefetch.js';
export * from './progress.js';
export { createSpinner, spinner } from './spinner.js';
// Named exports from validation to avoid conflicts with fs-checks.js
export { DEFAULT_PROJECT_NAME, MAX_PATH_COMPONENT, MIN_DISK_SPACE_BYTES, WINDOWS_MAX_PATH } from '../constants/index.js';
export {
  checkCompatibilityOrThrow, compatibilityRules, getCompatibilityWarnings, sanitizeProjectName, VALID_OPTIONS, validateOption, validateOrThrow, validateProjectName, validateProjectPath, validateSelections
} from './validation.js';
export type { CompatibilityRule, ValidationResult } from './validation.js';

export * from './logger.js';

