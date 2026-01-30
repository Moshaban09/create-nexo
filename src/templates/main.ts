/**
 * Main entry file generator (main.tsx/main.jsx)
 */
import path from 'node:path';
import type { ConfiguratorContext } from '../types/index.js';
import { writeFile } from '../utils/index.js';

interface Provider {
  start: string;
  end: string;
}

/**
 * Create main.tsx/main.jsx with providers
 */
export const createMainFile = async (
  ctx: ConfiguratorContext,
  ext: string
): Promise<void> => {
  const srcDir = path.join(ctx.projectPath, 'src');
  const { variant, styling, ui, state, routing, dataFetching } = ctx.selections;
  const isTypeScript = variant.startsWith('ts');
  const styleExt = styling === 'sass' ? 'scss' : 'css';

  const imports: string[] = [
    "import { StrictMode } from 'react'",
    "import { createRoot } from 'react-dom/client'",
    `import './index.${styleExt}'`,
    `import App from './App.${ext}'`,
  ];

  const providers: Provider[] = [];

  // 1. State Management
  if (state === 'redux') {
    imports.push("import { Provider } from 'react-redux'");
    imports.push("import { store } from './store/store'");
    providers.push({ start: '<Provider store={store}>', end: '</Provider>' });
  }

  // 2. Data Fetching
  if (dataFetching === 'tanstack-query') {
    imports.push("import { QueryClient, QueryClientProvider } from '@tanstack/react-query'");
    providers.push({ start: '<QueryClientProvider client={queryClient}>', end: '</QueryClientProvider>' });
  }

  // 3. UI Libraries
  if (ui === 'heroui') {
    imports.push("import { HeroUIProvider } from '@heroui/react'");
    providers.push({ start: '<HeroUIProvider>', end: '</HeroUIProvider>' });
  } else if (ui === 'chakra') {
    imports.push("import { ChakraProvider, defaultSystem } from '@chakra-ui/react'");
    providers.push({ start: '<ChakraProvider value={defaultSystem}>', end: '</ChakraProvider>' });

  } else if (ui === 'antd') {
    const isRtl = ctx.selections.rtl === true;
    imports.push("import { ConfigProvider } from 'antd'");
    providers.push({ start: `<ConfigProvider${isRtl ? ' direction="rtl"' : ''}>`, end: '</ConfigProvider>' });
  } else if (ui === 'styled-components') {
    imports.push("import { ThemeProvider } from 'styled-components'");
    // We need a default theme object, usually imported or defined.
    // For simplicity in a generator, we'll inline a basic empty theme or comment
    imports.push("const theme = {}");
    providers.push({ start: '<ThemeProvider theme={theme}>', end: '</ThemeProvider>' });
  }

  // 4. Routing
  // Use createBrowserRouter or TanStack Router
  let routerSetup = '';
  let renderApp = '<App />';

  if (routing === 'react-router') {
    imports.push("import { createBrowserRouter, RouterProvider } from 'react-router'");
    routerSetup = `
const router = createBrowserRouter([
  {
    path: "*",
    element: <App />,
  }
]);`;
    renderApp = '<RouterProvider router={router} />';
  } else if (routing === 'tanstack-router') {
    imports.push("import { RouterProvider, createRouter, createRootRoute } from '@tanstack/react-router'");
    routerSetup = `
const rootRoute = createRootRoute({
  component: App,
});

const router = createRouter({ routeTree: rootRoute });
${isTypeScript ? `
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}` : ''}`;
    renderApp = '<RouterProvider router={router} />';
  }

  // Build content
  let content = imports.join('\n');
  content += '\n\n';

  if (dataFetching === 'tanstack-query') {
    content += 'const queryClient = new QueryClient()\n';
  }

  content += routerSetup + '\n';

  content += `createRoot(document.getElementById('root')${isTypeScript ? '!' : ''}).render(
  <StrictMode>
`;

  providers.forEach((p) => (content += `    ${p.start}\n`));
  content += `      ${renderApp}\n`;
  [...providers].reverse().forEach((p) => (content += `    ${p.end}\n`));

  content += `  </StrictMode>,
)
`;

  await writeFile(path.join(srcDir, `main.${ext}`), content);

  // Create vite-env.d.ts for TypeScript
  if (isTypeScript) {
    await writeFile(
      path.join(srcDir, 'vite-env.d.ts'),
      '/// <reference types="vite/client" />\n'
    );
  }
};
