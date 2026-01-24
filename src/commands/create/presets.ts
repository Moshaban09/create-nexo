import { PRESETS, type PresetName } from '../../core/presets.js';
import { type UserSelections } from '../../types/index.js';

/**
 * Merges preset configuration with project defaults and user-provided name
 */
export function handlePresetSelections(
  presetName: string,
  projectName: string
): UserSelections | null {
  const name = presetName.toLowerCase();

  if (!Object.keys(PRESETS).includes(name)) {
    return null;
  }

  const presetConfig = PRESETS[name as PresetName];

  const selections: UserSelections = {
    projectName,
    framework: 'react',
    variant: 'ts',
    language: 'typescript',
    styling: 'tailwind',
    ui: 'none',
    forms: 'none',
    state: 'none',
    routing: 'none',
    dataFetching: 'none',
    icons: 'none',
    structure: 'simple',

    hasCompiler: false,
    hasSWC: false,
    packageManager: 'npm',
    optionalFeatures: [],
    ...presetConfig
  };

  // Ensure derived fields are correct
  const variant = selections.variant;
  selections.hasCompiler = variant.includes('compiler');
  selections.hasSWC = variant.includes('swc');
  selections.language = variant.startsWith('ts') ? 'typescript' : 'javascript';

  return selections;
}
