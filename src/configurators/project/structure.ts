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

    case 'fsd':
      // Feature-Sliced Design
      dirs.push(
        'src/app',
        'src/pages',
        'src/widgets',
        'src/features',
        'src/entities',
        'src/shared/api',
        'src/shared/config',
        'src/shared/lib',
        'src/shared/ui',
      );
      break;

    case 'atomic':
      dirs.push(
        'src/components/atoms',
        'src/components/molecules',
        'src/components/organisms',
        'src/components/templates',
        'src/hooks',
        'src/utils',
      );
      break;

    case 'clean':
      // Clean Architecture
      dirs.push(
        'src/domain/entities',
        'src/domain/usecases',
        'src/application/services',
        'src/infrastructure/api',
        'src/infrastructure/storage',
        'src/presentation/components',
        'src/presentation/pages',
        'src/presentation/hooks',
      );
      break;

    case 'mvc':
      // MVC Pattern
      dirs.push(
        'src/models',
        'src/views/components',
        'src/views/pages',
        'src/controllers',
        'src/services',
        'src/utils',
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
