import path from 'node:path';
import { ConfiguratorContext } from '../../types/index.js';
import { ensureDir, writeFile } from '../../utils/index.js';

export const stylingConfigurator = async (ctx: ConfiguratorContext): Promise<void> => {
  const { variant } = ctx.selections;
  const isTypeScript = variant.startsWith('ts');
  const configExt = isTypeScript ? 'ts' : 'js';


  switch (ctx.selections.styling) {
    case 'tailwind':
      // React with Vite uses @tailwindcss/vite plugin
      if (ctx.pkg) {
        ctx.pkg.add('tailwindcss', '^4.0.0', true);
        ctx.pkg.add('@tailwindcss/vite', '^4.0.0', true);
      }

      // Update vite.config with @tailwindcss/vite plugin
      const vitePluginImport = variant.includes('swc')
        ? "import react from '@vitejs/plugin-react-swc'"
        : "import react from '@vitejs/plugin-react'";

      const viteConfig = `${vitePluginImport}
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
`;
      await writeFile(path.join(ctx.projectPath, `vite.config.${configExt}`), viteConfig);

      const cssContent = `@import "tailwindcss";`;
      await ensureDir(path.join(ctx.projectPath, 'src'));
      await writeFile(path.join(ctx.projectPath, 'src', 'index.css'), cssContent);
      break;

    case 'css-modules':
      await ensureDir(path.join(ctx.projectPath, 'src'));
      await writeFile(
        path.join(ctx.projectPath, 'src', 'index.css'),
        `/* CSS Modules - import styles from './Component.module.css' */\n:root {\n  font-family: system-ui, sans-serif;\n}\n`
      );
      break;



    case 'sass':
      if (ctx.pkg) {
        ctx.pkg.add('sass', '^1.77.0', true);
      }
      await ensureDir(path.join(ctx.projectPath, 'src'));
      await ensureDir(path.join(ctx.projectPath, 'src', 'styles'));

      // Create main SCSS file
      await writeFile(
        path.join(ctx.projectPath, 'src', 'index.scss'),
        `// Import variables and mixins\n@import './styles/variables';\n@import './styles/mixins';\n\n* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\n:root {\n  font-family: $font-family;\n  line-height: 1.5;\n}\n`
      );

      // Create variables file
      await writeFile(
        path.join(ctx.projectPath, 'src', 'styles', '_variables.scss'),
        `// Colors\n$primary: #646cff;\n$secondary: #535bf2;\n$background: #ffffff;\n$text: #213547;\n\n// Typography\n$font-family: system-ui, -apple-system, sans-serif;\n$font-size-base: 16px;\n\n// Spacing\n$spacing-unit: 8px;\n`
      );

      // Create mixins file
      await writeFile(
        path.join(ctx.projectPath, 'src', 'styles', '_mixins.scss'),
        `// Responsive breakpoints\n@mixin mobile {\n  @media (max-width: 768px) {\n    @content;\n  }\n}\n\n@mixin tablet {\n  @media (max-width: 1024px) {\n    @content;\n  }\n}\n\n// Flexbox helpers\n@mixin flex-center {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n`
      );
      break;

    default:
      // No additional setup needed for default/none styling
      break;
  }
};
