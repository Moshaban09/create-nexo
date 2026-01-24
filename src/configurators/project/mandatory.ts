import { exec } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { ConfiguratorContext } from '../../types/index.js';
import { ensureDir, writeFile } from '../../utils/index.js';

const execAsync = promisify(exec);

export const mandatoryConfigurator = async (ctx: ConfiguratorContext): Promise<void> => {
  const { projectName } = ctx.selections;

  // Note: PWA dependencies removed - should be a user-selected option if needed

  // Create manifest.json
  const manifest = {
    name: projectName,
    short_name: projectName,
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
    start_url: '/',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };

  await ensureDir(path.join(ctx.projectPath, 'public'));
  await writeFile(path.join(ctx.projectPath, 'public', 'manifest.json'), JSON.stringify(manifest, null, 2));





  // .gitignore - Zero-Trust Security Hardened
  const gitignore = `# Dependencies
node_modules
.pnp
.pnp.js

# Build output
dist
dist-ssr
build
out
.next
.nuxt

# Editor directories and files
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment files - SECURITY CRITICAL
.env
.env.*
.env.local
.env.*.local
!.env.example



# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
logs/
*.log

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
Thumbs.db
ehthumbs.db
Desktop.ini

# TypeScript cache
*.tsbuildinfo
tsconfig.tsbuildinfo

# Testing
coverage
.nyc_output

# Debug
*.map

# Temp files
tmp/
temp/
*.tmp
*.temp

# IDE specific
.fleet
*.swp
*~

# Security - prevent accidental exposure
.npmrc
.yarnrc

`;
  await writeFile(path.join(ctx.projectPath, '.gitignore'), gitignore);

  // README.md
  const readme = `# ${projectName}

Built with [NEXO](https://github.com/nexo-cli) — Next-generation scaffolding CLI.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build

## License

MIT
`;
  await writeFile(path.join(ctx.projectPath, 'README.md'), readme);

  // Git init - Atomic operation
  try {
    const gitCommand = 'git init && git add -A && git commit -m "Initial commit from NEXO"';
    await execAsync(gitCommand, { cwd: ctx.projectPath });
  } catch (e) {
    // Git might not be available
  }
};
