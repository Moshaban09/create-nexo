/**
 * Optional feature prompts - Additional features selection
 */
import type { PromptConfig } from '../../types/index.js';

export const optionalFeaturesPrompt: PromptConfig = {
  name: 'optionalFeatures',
  message: 'Select optional features (Space to select, Enter to continue):',
  type: 'checkbox',
  options: [
    {
      value: 'testing',
      name: 'Testing',
      comment: 'Unit & integration tests',
      hover_note: 'Vitest or Jest configuration with React Testing Library',
    },
    {
      value: 'linting',
      name: 'Linting & Formatting',
      comment: 'Code quality tools',
      hover_note: 'ESLint + Prettier or Biome for consistent code style',
    },

    {
      value: 'animation',
      name: 'Animation Library',
      comment: 'Motion & transitions',
      hover_note: 'Framer Motion, GSAP, or React Spring for smooth animations',
    },



    {
      value: 'ai-instructions',
      name: 'AI Instructions',
      comment: 'AI IDE/CLI guidance files',
      hover_note: 'Generate instruction files for AI tools (Cursor, Windsurf, Claude, etc.)',
    },
  ],
};





export const testingPrompt: PromptConfig = {
  name: 'testing',
  message: 'Select testing framework:',
  type: 'list',
  options: [
    {
      value: 'vitest',
      name: 'Vitest',
      comment: 'Vite-native testing',
      hover_note: 'Blazing fast with Vite - compatible with Jest API',
    },
    {
      value: 'jest',
      name: 'Jest',
      comment: 'Industry standard',
      hover_note: 'Mature ecosystem with extensive documentation',
    },
  ],
};

export const lintingPrompt: PromptConfig = {
  name: 'linting',
  message: 'Select linting setup:',
  type: 'list',
  options: [
    {
      value: 'eslint-prettier',
      name: 'ESLint + Prettier',
      comment: 'Standard combo',
      hover_note: 'ESLint for linting, Prettier for formatting - widely adopted',
    },
    {
      value: 'biome',
      name: 'Biome',
      comment: 'All-in-one tool',
      hover_note: 'Fast Rust-based linter and formatter in one - simpler config',
    },
  ],
};



export const animationPrompt: PromptConfig = {
  name: 'animation',
  message: 'Select animation library:',
  type: 'list',
  options: [
    {
      value: 'framer-motion',
      name: 'Framer Motion',
      comment: 'Production-ready',
      hover_note: 'Declarative animations with gestures, layout animations, and SVG support',
    },
    {
      value: 'gsap',
      name: 'GSAP',
      comment: 'Professional-grade',
      hover_note: 'Industry-standard animation library with timeline control and ScrollTrigger',
    },
    {
      value: 'react-spring',
      name: 'React Spring',
      comment: 'Physics-based',
      hover_note: 'Spring-physics animations for natural motion feel',
    },
  ],
};



export const aiInstructionsPrompt: PromptConfig = {
  name: 'aiInstructions',
  message: 'Select AI tools to generate instructions for:',
  type: 'checkbox',
  options: [
    {
      value: 'cursor',
      name: 'Cursor',
      comment: 'AI-first code editor',
      hover_note: 'Generate .cursorrules for Cursor IDE',
    },
    {
      value: 'windsurf',
      name: 'Windsurf',
      comment: 'AI-powered IDE',
      hover_note: 'Generate .windsurfrules for Windsurf',
    },
    {
      value: 'cline',
      name: 'Cline',
      comment: 'VS Code AI extension',
      hover_note: 'Generate .clinerules for Cline (formerly Claude Dev)',
    },
    {
      value: 'roo-cline',
      name: 'Roo Cline',
      comment: 'Enhanced Cline fork',
      hover_note: 'Generate .roo-clinerules for Roo Cline',
    },
    {
      value: 'aider',
      name: 'Aider',
      comment: 'AI pair programming in terminal',
      hover_note: 'Generate .aider.conf.yml for Aider CLI',
    },
    {
      value: 'claude',
      name: 'Claude',
      comment: 'Anthropic Claude AI',
      hover_note: 'Generate CLAUDE_INSTRUCTIONS.md for Claude CLI/API',
    },
    {
      value: 'gemini',
      name: 'Google Gemini',
      comment: 'Google Gemini AI',
      hover_note: 'Generate GEMINI_INSTRUCTIONS.md for Gemini',
    },
    {
      value: 'codex',
      name: 'OpenAI Codex',
      comment: 'OpenAI Codex/ChatGPT',
      hover_note: 'Generate CODEX_INSTRUCTIONS.md for Codex/ChatGPT',
    },
    {
      value: 'universal',
      name: 'Universal (All AI Tools)',
      comment: 'Generic AI instructions',
      hover_note: 'Generate AI_INSTRUCTIONS.md for any AI assistant',
    },
  ],
};





/** Sub-prompts for optional features */
export const optionalSubPrompts: Record<string, PromptConfig> = {

  'ai-instructions': aiInstructionsPrompt,
  testing: testingPrompt,
  linting: lintingPrompt,
  animation: animationPrompt,
};
