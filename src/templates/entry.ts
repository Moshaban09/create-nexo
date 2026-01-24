/**
 * Entry files generator - Coordinates main.tsx and App.tsx creation
 */
import path from 'node:path';
import type { ConfiguratorContext } from '../types/index.js';
import { ensureDir } from '../utils/index.js';
import { createMainFile } from './main.js';
import { createAppFile } from './welcome.js';

/**
 * Create all entry files (main.tsx, App.tsx, vite-env.d.ts)

 */
export const createEntryFiles = async (ctx: ConfiguratorContext): Promise<void> => {
  // Skip for non-React frameworks - they have their own entry files
  // Always create entry files for React



  const { variant } = ctx.selections;
  const isTypeScript = variant.startsWith('ts');
  const ext = isTypeScript ? 'tsx' : 'jsx';
  const srcDir = path.join(ctx.projectPath, 'src');

  await ensureDir(srcDir);
  await createMainFile(ctx, ext);
  await createAppFile(ctx, ext);
};

// Re-export for backward compatibility
export { createMainFile } from './main.js';
export { createAppCss } from './styles.js';
export { createAppFile, createWelcomePage } from './welcome.js';

