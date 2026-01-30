import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { type UserSelections } from '../types/config.js';

export interface Preset {
  name: string;
  selections: Partial<UserSelections>;
  createAt: string;
}

/**
 * Get the path to the global presets file
 */
const getPresetsPath = (): string => {
  const homeDir = os.homedir();
  return path.join(homeDir, '.nexo', 'presets.json');
};

/**
 * Ensure the .nexo directory exists
 */
const ensureConfigDir = async (configPath: string) => {
  const dir = path.dirname(configPath);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

/**
 * Load all presets from the global config
 */
export const loadPresets = async (): Promise<Preset[]> => {
  const configPath = getPresetsPath();
  try {
    await fs.access(configPath);
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content) as Preset[];
  } catch {
    // Return empty if file likely doesn't exist
    return [];
  }
};

/**
 * Save a new preset
 */
export const savePreset = async (name: string, selections: UserSelections): Promise<void> => {
  const configPath = getPresetsPath();
  await ensureConfigDir(configPath);

  const presets = await loadPresets();

  // Clean selections to remove project specific data
  const { projectName: _projectName, installDependencies: _installDependencies, ...cleanSelections } = selections;

  const newPreset: Preset = {
    name,
    selections: cleanSelections,
    createAt: new Date().toISOString()
  };

  // Update or add
  const index = presets.findIndex(p => p.name === name);
  if (index >= 0) {
    presets[index] = newPreset;
  } else {
    presets.push(newPreset);
  }

  await fs.writeFile(configPath, JSON.stringify(presets, null, 2));
};

/**
 * Get a specific preset by name
 */
export const getPreset = async (name: string): Promise<Preset | undefined> => {
  const presets = await loadPresets();
  return presets.find(p => p.name === name);
};

/**
 * Delete a preset
 */
export const deletePreset = async (name: string): Promise<void> => {
  const configPath = getPresetsPath();
  const presets = await loadPresets();
  const newPresets = presets.filter(p => p.name !== name);
  await fs.writeFile(configPath, JSON.stringify(newPresets, null, 2));
};
