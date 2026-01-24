import { ConfiguratorContext } from '../../types/index.js';

export const variantConfigurator = async (ctx: ConfiguratorContext): Promise<void> => {
  const { variant, framework } = ctx.selections;

  if (framework !== 'react') return;

  const hasCompiler = variant.includes('compiler');
  const hasSWC = variant.includes('swc');

  if (ctx.pkg) {
    if (hasCompiler) {
      // React Compiler dependencies
      ctx.pkg.add('babel-plugin-react-compiler', '^19.0.0-beta-e552027-20250112', true);
      ctx.pkg.add('eslint-plugin-react-compiler', '^19.0.0-beta-e552027-20250112', true);
      ctx.pkg.add('@babel/core', '^7.26.0', true);
      ctx.pkg.add('@babel/preset-react', '^7.26.0', true);
    }

    if (hasSWC) {
      // SWC dependencies - Vite uses @vitejs/plugin-react-swc
      ctx.pkg.add('@vitejs/plugin-react-swc', '^3.7.0', true);
    }
  }
};
