import { appendFile } from 'node:fs/promises';
import path from 'node:path';
import { ConfiguratorContext } from '../../types/index.js';
import { ensureDir, writeFile } from '../../utils/index.js';

const UI_CONFIGS: Record<string, Record<string, string>> = {
  shadcn: {
    '@radix-ui/react-slot': '^1.1.0',
    'class-variance-authority': '^0.7.1',
    'clsx': '^2.1.1',
    'tailwind-merge': '^3.4.0',
  },
  radix: {
    '@radix-ui/react-dialog': '^1.4.0',
    '@radix-ui/react-dropdown-menu': '^2.1.4',
    '@radix-ui/react-slot': '^1.1.1',
  },

  heroui: {
    '@heroui/react': '^2.8.0',
    'framer-motion': '^12.0.0',
  },
  mui: {
    '@mui/material': '^7.3.7',
    '@emotion/react': '^11.14.0',
    '@emotion/styled': '^11.14.0',
  },
  antd: {
    'antd': '^6.0.0',
    '@ant-design/icons': '^6.0.0',
  },
  chakra: {
    '@chakra-ui/react': '^3.31.0',
    '@emotion/react': '^11.14.0',
  },
  'styled-components': {
    'styled-components': '^6.3.8',
  },

};


export const uiConfigurator = async (ctx: ConfiguratorContext): Promise<void> => {
  if (ctx.selections.ui === 'none') return;

  const config = UI_CONFIGS[ctx.selections.ui];
  if (!config) return;

  // Use PackageManager for atomic dependency updates
  if (ctx.pkg) {
    for (const [name, version] of Object.entries(config)) {
      ctx.pkg.add(name, version);
    }
  }

  // HeroUI Setup
  if (ctx.selections.ui === 'heroui') {
    const isTypeScript = ctx.selections.variant.startsWith('ts');
    const ext = isTypeScript ? 'ts' : 'js';

    // Create hero.ts/hero.js
    const heroContent = `import { heroui } from "@heroui/react";

export default heroui();`;

    await writeFile(path.join(ctx.projectPath, `src/hero.${ext}`), heroContent);
  }

  // Shadcn UI Setup
  if (ctx.selections.ui === 'shadcn') {
    const isTypeScript = ctx.selections.variant.startsWith('ts');
    const ext = isTypeScript ? 'ts' : 'js';

    // 1. Create utils.ts
    await ensureDir(path.join(ctx.projectPath, 'src/lib'));
    const utilsContent = `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`;
    await writeFile(path.join(ctx.projectPath, 'src/lib', `utils.${ext}`), utilsContent);

    // 2. Create components.json
    const componentsJson = {
      "$schema": "https://ui.shadcn.com/schema.json",
      "style": "new-york",
      "rsc": false,
      "tsx": isTypeScript,
      "tailwind": {
        "config": "tailwind.config.js",
        "css": "src/index.css",
        "baseColor": "slate",
        "cssVariables": true,
        "prefix": ""
      },
      "aliases": {
        "components": "@/components",
        "utils": "@/lib/utils"
      }
    };
    await writeFile(path.join(ctx.projectPath, 'components.json'), JSON.stringify(componentsJson, null, 2));

    // 3. Update index.css with CSS Variables
    const cssVariables = `
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    border-color: hsl(var(--border));
  }
  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }
}
`;
    await appendFile(path.join(ctx.projectPath, 'src/index.css'), cssVariables);
  }

  // HeroUI CSS injection (Tailwind v4 CSS-first)
  if (ctx.selections.ui === 'heroui') {
    const isTypeScript = ctx.selections.variant.startsWith('ts');
    const ext = isTypeScript ? 'ts' : 'js';
    const cssContent = `
@import "tailwindcss";
@plugin "./hero.${ext}";
@source "../node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}";
@custom-variant dark (&:is(.dark *));
`;
    await writeFile(path.join(ctx.projectPath, 'src/index.css'), cssContent);
  }
};
