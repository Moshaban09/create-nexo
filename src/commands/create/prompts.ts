import * as p from '@clack/prompts';
import fs from 'node:fs/promises';
import path from 'node:path';
import pc from 'picocolors';
import { estimateBundleSize, formatSize } from '../../core/insights/bundle-size.js';
import {
  corePrompts,
  optionalFeaturesPrompt,
  optionalSubPrompts
} from '../../core/prompts.js';
import { config } from '../../core/user-config.js';
import { type PromptOption, type UserSelections } from '../../types/index.js';
import {
  detectAvailableManagers,
  detectProjectConfig,
  isDirEmpty
} from '../../utils/index.js';
import { type PackageManagerName } from '../../utils/pm-utils.js';

/**
 * Helper for 'Learn' mode
 */
const explain = (text: string, title: string = '💡 Educational Context') => {
  if (config.isLearningMode) {
    p.note(text, title);
  }
};

/**
 * Handles the interactive flow for project creation
 */
export async function handleInteractiveFlow(
  projectName: string,
  targetDir: string
): Promise<UserSelections | null> {
  const answers: Record<string, string | string[]> = {
    projectName,
    packageManager: 'npm',
  };

  const availableManagers = detectAvailableManagers();
  const projectPath = path.resolve(targetDir, projectName);

  // Check for existing directory
  if (!(await isDirEmpty(projectPath))) {
    const detectedConfig = await detectProjectConfig(projectPath);

    let detectedInfo = '';
    if (detectedConfig) {
      detectedInfo = `
      ${pc.bold('Previous Configuration Found:')}
      ${pc.dim('• Framework:')} ${detectedConfig.framework || 'Unknown'}
      ${pc.dim('• Language:')}  ${detectedConfig.variant === 'ts' ? 'TypeScript' : 'JavaScript'}
      ${pc.dim('• Styling:')}   ${detectedConfig.styling || 'Unknown'}
  `;
    }

    const action = await p.select({
      message: `Folder "${projectName}" already exists and is not empty.${detectedInfo}`,
      options: [
        ...(detectedConfig ? [{
          value: 'continue',
          label: 'Continue with previous setup',
          hint: 'Uses detected configuration'
        }] : []),
        {
          value: 'overwrite',
          label: 'Start fresh',
          hint: '⚠️  Clears directory and starts new setup'
        },
        {
          value: 'cancel',
          label: 'Cancel',
          hint: 'Exit operation'
        },
      ],
    });

    if (p.isCancel(action) || action === 'cancel') return null;

    if (action === 'continue' && detectedConfig) {
      return {
        projectName,
        framework: detectedConfig.framework || 'react',
        variant: detectedConfig.variant || 'ts',
        language: detectedConfig.variant === 'js' ? 'javascript' : 'typescript',
        styling: detectedConfig.styling || 'tailwind',
        ui: detectedConfig.ui || 'none',
        forms: detectedConfig.forms || 'none',
        state: detectedConfig.state || 'none',
        routing: detectedConfig.routing || 'none',
        dataFetching: detectedConfig.dataFetching || 'none',
        structure: detectedConfig.structure || 'feature',
        icons: detectedConfig.icons || 'lucide',
        optionalFeatures: [],
        ...detectedConfig
      } as UserSelections;
    }

    if (action === 'overwrite') {
      const confirm = await p.confirm({
        message: `Are you sure you want to clear "${projectName}"? This action cannot be undone.`,
      });

      if (p.isCancel(confirm) || !confirm) return null;

      await fs.rm(projectPath, { recursive: true, force: true });
      await fs.mkdir(projectPath, { recursive: true });
    }
  }

  // Core prompts
  for (const promptConfig of corePrompts) {
    if (promptConfig.options.length === 0 ||
       (promptConfig.options.length === 1 && promptConfig.options[0].value === 'none')) {
      answers[promptConfig.name] = 'none';
      continue;
    }

    // Educational context
    if (promptConfig.name === 'variant') {
      explain('We recommend TypeScript for better type safety and developer experience.\nThe "React Compiler" variant uses the new experimental compiler for auto-memoization.');
    } else if (promptConfig.name === 'styling') {
      explain('Tailwind CSS offers a utility-first approach for rapid UI development.\nCSS Modules provide scoped CSS to avoid global conflicts.');
    } else if (promptConfig.name === 'state') {
      explain('Local state (useState) is sufficient for simple apps.\nZustand is a lightweight, scalable global state manager.\nRedux is powerful but has more boilerplate.');
    } else if (promptConfig.name === 'dataFetching') {
      explain('TanStack Query (React Query) handles caching, deduplication, and background updates automatically.');
    } else if (promptConfig.name === 'packageManager') {
      explain('pnpm and Bun are significantly faster than npm.\nWe recommend using them for faster installation times.');
    }

    const options = promptConfig.options.map((opt: PromptOption) => ({
      value: opt.value,
      label: promptConfig.name === 'packageManager' && availableManagers.includes(opt.value as PackageManagerName) && opt.value !== 'npm'
        ? `${opt.name} ${pc.green('(Recommended)')}`
        : opt.name,
      hint: opt.hover_note,
    }));

    const answer = await p.select({
      message: promptConfig.message,
      options,
    });

    if (p.isCancel(answer)) return null;

    answers[promptConfig.name] = answer as string;

    const selectedOption = promptConfig.options.find((o: PromptOption) => o.value === answer);
    if (selectedOption?.folder_info) {
      p.note(selectedOption.folder_info.join('\n'), '📁 Folders');
    }
  }

  // Optional features
  const optionalFeatures = await p.multiselect({
    message: 'Select optional features (Space to select):',
    options: optionalFeaturesPrompt.options.map((opt: PromptOption) => ({
      value: opt.value,
      label: opt.name,
      hint: opt.hover_note,
    })),
    required: false,
  });

  if (p.isCancel(optionalFeatures)) return null;
  answers.optionalFeatures = optionalFeatures as string[];

  // Sub-prompts
  for (const feature of optionalFeatures as string[]) {
    const subPrompt = optionalSubPrompts[feature];
    if (subPrompt) {
      const promptOptions = subPrompt.options.map((opt: PromptOption) => ({
        value: opt.value,
        label: opt.name,
        hint: opt.hover_note,
      }));

      const subAnswer = subPrompt.type === 'checkbox'
        ? await p.multiselect({ message: subPrompt.message, options: promptOptions, required: false })
        : await p.select({ message: subPrompt.message, options: promptOptions });

      if (p.isCancel(subAnswer)) return null;
      answers[feature] = subAnswer as string | string[];
    }
  }

  // Summary Preview
  const currentSelections: Partial<UserSelections> = {
    framework: 'react',
    variant: answers.variant as string,
    styling: answers.styling as string,
    ui: answers.ui as string,
    forms: answers.forms as string,
    state: answers.state as string,
    routing: answers.routing as string,
    dataFetching: answers.dataFetching as string,
    icons: answers.icons as string,
  };

  const sizeKb = estimateBundleSize(currentSelections as UserSelections);
  const summaryItems = [
    `Project:        ${pc.cyan(answers.projectName as string)}`,
    `Framework:      ${pc.cyan('react')}`,
    `Variant:        ${pc.cyan(answers.variant as string)}`,
    `Styling:        ${pc.cyan(answers.styling as string)}`,
    `UI Library:     ${pc.cyan(answers.ui as string)}`,
    `Forms:          ${pc.cyan(answers.forms as string)}`,
    `State:          ${pc.cyan(answers.state as string)}`,
    `Routing:        ${pc.cyan(answers.routing as string)}`,
    `Bundle Est.:    ${pc.green(formatSize(sizeKb))} ${pc.dim('(Initial JS)')}`,
  ];

  p.note(summaryItems.join('\n'), '📋 Summary');

  const confirmed = await p.confirm({
    message: 'Create project with these settings?',
  });

  if (p.isCancel(confirmed) || !confirmed) return null;

  // Final Selections construction
  const variant = answers.variant as string;
  return {
    projectName: answers.projectName as string,
    framework: 'react',
    variant,
    language: variant.startsWith('ts') ? 'typescript' : 'javascript',
    styling: answers.styling as string,
    ui: answers.ui as string,
    forms: answers.forms as string,
    state: answers.state as string,
    routing: answers.routing as string,
    dataFetching: answers.dataFetching as string,
    icons: answers.icons as string,
    structure: answers.structure as string,
    aiInstructions: (answers.optionalFeatures as string[]).includes('ai-instructions') ? (answers['ai-instructions'] as string[]) : undefined,
    hasCompiler: variant.includes('compiler'),
    hasSWC: variant.includes('swc'),
    packageManager: answers.packageManager as string || 'npm',
  } as UserSelections;
}
