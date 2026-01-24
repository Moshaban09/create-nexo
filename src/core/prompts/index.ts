/**
 * Prompts module - All prompt configurations
 */

// Core prompts
export {
  corePrompts,
  dataFetchingPrompt,
  formsPrompt,
  iconsPrompt,
  routingPrompt,
  statePrompt,
  structurePrompt,
  stylingPrompt,
  uiPrompt,
  variantPrompt
} from './core.js';

// Optional feature prompts
export {
  animationPrompt,


  optionalFeaturesPrompt,
  optionalSubPrompts,
  testingPrompt
} from './optional.js';

// Utility functions
export {
  getChoiceName,
  getInquirerChoices,
  getOptionByValue
} from './utils.js';



// Re-export types
export type { PromptConfig, PromptOption } from '../../types/index.js';

// Combined exports
import { corePrompts } from './core.js';
import { optionalFeaturesPrompt } from './optional.js';

export const allPrompts = [...corePrompts, optionalFeaturesPrompt];
