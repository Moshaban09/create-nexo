import fs from 'node:fs/promises';
import path from 'node:path';
import { UserSelections } from '../types/index.js';

export const isDirEmpty = async (dir: string): Promise<boolean> => {
  try {
    const files = await fs.readdir(dir);
    // Ignore .git and other common hidden files if needed, but strict empty check is usually safer
    const visibleFiles = files.filter(f => f !== '.git' && f !== '.DS_Store' && f !== 'Thumbs.db');
    return visibleFiles.length === 0;
  } catch (error) {
    // If directory doesn't exist, it's effectively empty
    return true;
  }
};

export const detectProjectConfig = async (dir: string): Promise<Partial<UserSelections> | null> => {
  try {
    const pkgPath = path.join(dir, 'package.json');
    const pkgContent = await fs.readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(pkgContent);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    const config: Partial<UserSelections> = {
      projectName: pkg.name || path.basename(dir),
    };

    // Detect Framework
    if (deps['react']) config.framework = 'react';

    // Detect Language (rough heuristic)
    if (deps['typescript']) config.variant = 'ts';
    else config.variant = 'js';

    // Detect Styling
    if (deps['tailwindcss']) config.styling = 'tailwind';
    else if (deps['sass']) config.styling = 'sass';
    // CSS modules hard to detect from package.json alone, usually assumes css if nothing else

    return config;
  } catch (error) {
    return null;
  }
};
