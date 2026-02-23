import path from 'node:path';
import { ConfiguratorContext } from '../../types/index.js';
import { ensureDir, writeJson } from '../../utils/index.js';

export const languageConfigurator = async (ctx: ConfiguratorContext): Promise<void> => {
  const { variant, framework } = ctx.selections;
  const isTypeScript = variant.startsWith('ts');
  if (ctx.pkg) {
    if (isTypeScript) {
      ctx.pkg.add('typescript', '^5.7.0', true);
      // Add framework-specific type definitions
      if (framework === 'react') {
        ctx.pkg.add('@types/react', '^19.0.0', true);
        ctx.pkg.add('@types/react-dom', '^19.0.0', true);
      }

      // Create tsconfig.json
      const jsxOption = framework === 'react' ? 'react-jsx' : 'preserve';
      const tsconfig = {
        compilerOptions: {
          target: 'ES2022',
          useDefineForClassFields: true,
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: jsxOption,
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
          ...(ctx.selections.importAlias
            ? {
                baseUrl: '.',
                paths: {
                  '@/*': ['./src/*'],
                },
              }
            : {}),
        },
        include: ['src'],
        references: [{ path: './tsconfig.node.json' }],
      };
      await writeJson(path.join(ctx.projectPath, 'tsconfig.json'), tsconfig);

      // Create tsconfig.node.json
      const tsconfigNode = {
        compilerOptions: {
          composite: true,
          skipLibCheck: true,
          module: 'ESNext',
          moduleResolution: 'bundler',
          allowSyntheticDefaultImports: true,
          strict: true,
        },
        include: ['vite.config.ts'],
      };
      await writeJson(path.join(ctx.projectPath, 'tsconfig.node.json'), tsconfigNode);
    }

    ctx.pkg.addScript('build', isTypeScript ? 'tsc && vite build' : 'vite build');

    // Create eslint.config.js
    const eslintConfig = `import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'public', '.nexo'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx${isTypeScript ? '' : ',js,jsx'}}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      ${
        isTypeScript
          ? `parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },`
          : ''
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      ${!isTypeScript ? "'@typescript-eslint/no-unused-vars': 'off'," : ''}
    },
  },
);
`;
    const { writeFile } = await import('../../utils/index.js');
    await writeFile(path.join(ctx.projectPath, 'eslint.config.js'), eslintConfig);

    // Add ESLint dependencies
    ctx.pkg.add('eslint', '^9.29.0', true);
    ctx.pkg.add('eslint-plugin-react-hooks', '^5.2.0', true);
    ctx.pkg.add('eslint-plugin-react-refresh', '^0.4.14', true);
    ctx.pkg.add('globals', '^15.12.0', true);
    ctx.pkg.add('typescript-eslint', '^8.15.0', true);
    ctx.pkg.add('@eslint/js', '^9.29.0', true);
    // Fix ReDoS vulnerability in eslint@9.x's bundled minimatch
    ctx.pkg.addOverride('minimatch', '^10.0.0');
  }

  // VS Code Settings to fix schema errors
  await ensureDir(path.join(ctx.projectPath, '.vscode'));
  await writeJson(path.join(ctx.projectPath, '.vscode', 'settings.json'), {
    'json.schemas': [],
    'typescript.tsdk': 'node_modules/typescript/lib',
  });
};
