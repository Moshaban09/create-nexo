import path from 'node:path';
import { ConfiguratorContext } from '../../types/index.js';
import { ensureDir, writeFile } from '../../utils/index.js';

export const stylingConfigurator = async (ctx: ConfiguratorContext): Promise<void> => {
  const { variant } = ctx.selections;
  const isTypeScript = variant.startsWith('ts');
  const configExt = isTypeScript ? 'ts' : 'js';
  const isRtl = ctx.selections.rtl === true;

  switch (ctx.selections.styling) {
    case 'tailwind':
      // React with Vite uses @tailwindcss/vite plugin
      if (ctx.pkg) {
        ctx.pkg.add('tailwindcss', '^4.1.0', true);
        ctx.pkg.add('@tailwindcss/vite', '^4.1.0', true);
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

      const cssContent = `@import "tailwindcss";
${isRtl ? `
@theme {
  --font-sans: "Cairo", ui-sans-serif, system-ui, sans-serif;
}

:root {
  font-family: var(--font-sans);
}

body {
  text-align: right;
}` : ''}`;
      await ensureDir(path.join(ctx.projectPath, 'src'));
      await writeFile(path.join(ctx.projectPath, 'src', 'index.css'), cssContent);
      break;

    case 'css-modules':
      await ensureDir(path.join(ctx.projectPath, 'src'));
      await writeFile(
        path.join(ctx.projectPath, 'src', 'index.css'),
        `/* CSS Modules - import styles from './Component.module.css' */\n:root {\n  font-family: ${isRtl ? "'Cairo', " : ''}system-ui, sans-serif;\n}\n${isRtl ? 'body { text-align: right; }\n' : ''}`
      );
      break;



    default:
      // No additional setup needed for default/none styling
      break;
  }
};
