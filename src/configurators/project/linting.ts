import { ConfiguratorContext } from '../../types/index.js';

export const lintingConfigurator = async (ctx: ConfiguratorContext): Promise<void> => {
  const { linting } = ctx.selections;

  if (!linting || linting === 'none') return;

  if (ctx.pkg) {
    if (linting === 'eslint-prettier') {
      ctx.pkg.add('eslint', '^9.39.0', true);
      ctx.pkg.add('prettier', '^3.7.0', true);
      ctx.pkg.add('eslint-plugin-react-hooks', '^5.0.0', true);
      ctx.pkg.add('eslint-plugin-react-refresh', '^0.4.0', true);

      ctx.pkg.addScript('lint', 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0');
      ctx.pkg.addScript('format', 'prettier --write "src/**/*.{ts,tsx,css,json}"');
    } else if (linting === 'biome') {
      ctx.pkg.add('@biomejs/biome', '^2.0.0', true);

      ctx.pkg.addScript('lint', 'biome lint .');
      ctx.pkg.addScript('format', 'biome format . --write');
      ctx.pkg.addScript('check', 'biome check --apply .');
    }
  }
};
