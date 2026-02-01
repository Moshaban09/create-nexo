import path from 'node:path';
import { ConfiguratorContext } from '../../types/index.js';
import { ensureDir } from '../../utils/index.js';

export const structureConfigurator = async (ctx: ConfiguratorContext): Promise<void> => {
  const dirs: string[] = [];

  switch (ctx.selections.structure) {
    case 'feature-based':
      dirs.push(
        'src/app',
        'src/features',
        'src/shared/components',
        'src/shared/hooks',
        'src/shared/utils',
        'src/shared/types',
      );
      break;

    case 'simple':
    default:
      dirs.push(
        'src/components',
        'src/hooks',
        'src/utils',
        'src/assets',
      );
      break;
  }

  for (const dir of dirs) {
    const fullPath = path.join(ctx.projectPath, dir);
    await ensureDir(fullPath);
  }
};
