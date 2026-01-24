/**
 * Prompt utility functions
 */
import type { PromptConfig, PromptOption } from '../../types/index.js';

/**
 * Get choices formatted for Inquirer.js
 */
export const getInquirerChoices = (prompt: PromptConfig) => {
  return prompt.options.map((opt: PromptOption) => ({
    name: opt.name,
    value: opt.value,
    short: opt.name,
  }));
};

/**
 * Get choice name for display
 */
export const getChoiceName = (opt: PromptOption) => {
  return opt.name;
};

/**
 * Get option by value
 */
export const getOptionByValue = (
  options: PromptOption[],
  value: string
): PromptOption | undefined => {
  return options.find((opt) => opt.value === value);
};
