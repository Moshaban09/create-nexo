
import path from 'node:path';
import { ConfiguratorContext } from '../types/index.js';
import { writeFile } from '../utils/index.js';

export const createReadme = async (ctx: ConfiguratorContext): Promise<void> => {
  const {
    projectName,
    variant,
    styling,
    ui,
    state,
    routing,
    dataFetching,
    testing,
  } = ctx.selections;

  const runCmd = 'npm run';
  const pkgManager = 'npm';

  let content = `# ${projectName}

Built with **NEXO CLI** 🚀

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite 6
- **Language**: ${variant.includes('ts') ? 'TypeScript' : 'JavaScript'}
- **Styling**: ${getStylingName(styling)}
${ui !== 'none' ? `- **UI Library**: ${getUiName(ui)}` : ''}
${state !== 'none' ? `- **State Management**: ${getStateName(state)}` : ''}
${routing !== 'none' ? `- **Routing**: ${getRoutingName(routing)}` : ''}
${dataFetching !== 'none' ? `- **Data Fetching**: ${getDataFetchingName(dataFetching)}` : ''}
${testing ? `- **Testing**: ${testing}` : ''}

## 🚀 Getting Started

1. **Install dependencies**:
   \`\`\`bash
   ${pkgManager} install
   \`\`\`

2. **Start the dev server**:
   \`\`\`bash
   ${runCmd} dev
   \`\`\`

3. **Build for production**:
   \`\`\`bash
   ${runCmd} build
   \`\`\`

`;

  // Feature Specific Docs

  if (styling === 'tailwind') {
    content += `## 🎨 Styling (Tailwind CSS v4)
This project uses Tailwind CSS v4.
- Configuration is handled in \`vite.config.ts\` via \`@tailwindcss/vite\`.
- ${ui === 'shadcn' || ui === 'heroui' ? 'Includes extensions for UI library.' : 'Standard configuration.'}
\n`;
  }

  if (ui === 'shadcn') {
    content += `## 🧩 Shadcn UI
- **Add components**:
  \`\`\`bash
  npx shadcn@latest add button
  \`\`\`
- Configuration: \`components.json\`
- Utils: \`src/lib/utils.ts\`
\n`;
  }

  if (state === 'redux') {
    content += `## 📦 State Management (Redux Toolkit)
- **Store**: \`src/store/store.ts\`
- **Hooks**: Use \`useAppDispatch\` and \`useAppSelector\` from \`src/store/hooks.ts\` instead of raw hooks.
- **Slices**: Add new slices in \`src/store\` and register them in the store.
\n`;
  }



  if (testing) {
    content += `## 🧪 Testing
Run unit tests:
\`\`\`bash
${runCmd} test:run
\`\`\`
\n`;
  }

  content += `## 📄 License

This project is licensed under the MIT License.
`;

  await writeFile(path.join(ctx.projectPath, 'README.md'), content);
};

// Helpers for display names
function getStylingName(s: string) {
  const map: Record<string, string> = { tailwind: 'Tailwind CSS', 'css-modules': 'CSS Modules' };
  return map[s] || s;
}

function getUiName(s: string) {
  const map: Record<string, string> = { shadcn: 'shadcn/ui', heroui: 'HeroUI', chakra: 'Chakra UI', antd: 'Ant Design' };
  return map[s] || s;
}

function getStateName(s: string) {
  const map: Record<string, string> = { redux: 'Redux Toolkit', zustand: 'Zustand', jotai: 'Jotai' };
  return map[s] || s;
}

function getRoutingName(s: string) {
  const map: Record<string, string> = { 'react-router': 'React Router', 'tanstack-router': 'TanStack Router' };
  return map[s] || s;
}

function getDataFetchingName(s: string) {
  const map: Record<string, string> = { 'tanstack-query': 'TanStack Query', axios: 'Axios' };
  return map[s] || s;
}
