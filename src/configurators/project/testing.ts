import { ConfiguratorContext } from '../../types/index.js';

export const testingConfigurator = async (ctx: ConfiguratorContext): Promise<void> => {
  const { testing } = ctx.selections;

  if (!testing || testing === 'none') return;

  if (ctx.pkg) {
    if (testing === 'vitest') {
      ctx.pkg.add('vitest', '^3.0.0', true);
      ctx.pkg.add('@testing-library/react', '^16.0.0', true);
      ctx.pkg.add('@testing-library/dom', '^10.0.0', true);
      ctx.pkg.add('jsdom', '^26.0.0', true);

      ctx.pkg.addScript('test', 'vitest');
      ctx.pkg.addScript('test:ui', 'vitest --ui');
      ctx.pkg.addScript('test:run', 'vitest run');
    } else if (testing === 'jest') {
      ctx.pkg.add('jest', '^29.7.0', true);
      ctx.pkg.add('jest-environment-jsdom', '^29.7.0', true);
      ctx.pkg.add('@testing-library/react', '^16.0.0', true);
      ctx.pkg.add('@testing-library/dom', '^10.0.0', true);
      ctx.pkg.add('@types/jest', '^29.5.0', true);
      ctx.pkg.add('ts-jest', '^29.1.0', true);

      ctx.pkg.addScript('test', 'jest');
      ctx.pkg.addScript('test:watch', 'jest --watch');
    }
  }
};
