import path from 'node:path';
import { ConfiguratorContext } from '../../types/index.js';
import { writeFile } from '../../utils/index.js';

interface DocLink {
  name: string;
  url: string;
}

const DOCS_LINKS: Record<string, DocLink> = {
  // Frameworks
  react: { name: 'React', url: 'https://react.dev' },
  vite: { name: 'Vite', url: 'https://vitejs.dev' },
  'next.js': { name: 'Next.js', url: 'https://nextjs.org/docs' },

  // Styling
  tailwind: { name: 'Tailwind CSS', url: 'https://tailwindcss.com/docs' },
  'css-modules': { name: 'CSS Modules', url: 'https://github.com/css-modules/css-modules' },
  sass: { name: 'Sass', url: 'https://sass-lang.com/documentation' },

  // UI Libraries
  shadcn: { name: 'Shadcn/ui', url: 'https://ui.shadcn.com/docs' },
  mui: { name: 'Material UI', url: 'https://mui.com/material-ui/getting-started' },
  antd: { name: 'Ant Design', url: 'https://ant.design/components/overview' },
  chakra: { name: 'Chakra UI', url: 'https://chakra-ui.com/docs/get-started' },
  heroui: { name: 'HeroUI', url: 'https://heroui.com/docs/guide/introduction' },
  radix: { name: 'Radix UI', url: 'https://www.radix-ui.com/primitives/docs/overview/introduction' },
  'styled-components': { name: 'Styled Components', url: 'https://styled-components.com/docs' },

  // State Management
  zustand: { name: 'Zustand', url: 'https://zustand.docs.pmnd.rs' },
  redux: { name: 'Redux Toolkit', url: 'https://redux-toolkit.js.org/introduction/getting-started' },
  jotai: { name: 'Jotai', url: 'https://jotai.org/docs/introduction' },

  // Routing
  'react-router': { name: 'React Router', url: 'https://reactrouter.com/en/main' },
  'tanstack-router': { name: 'TanStack Router', url: 'https://tanstack.com/router/latest/docs/framework/react/overview' },

  // Data Fetching
  'tanstack-query': { name: 'TanStack Query', url: 'https://tanstack.com/query/latest/docs/react/overview' },
  axios: { name: 'Axios', url: 'https://axios-http.com/docs/intro' },

  // Forms
  'rhf-zod': { name: 'React Hook Form + Zod', url: 'https://react-hook-form.com/get-started' },
  'rhf-yup': { name: 'React Hook Form + Yup', url: 'https://react-hook-form.com/get-started' },
  'formik-zod': { name: 'Formik', url: 'https://formik.org/docs/overview' },
  'formik-yup': { name: 'Formik + Yup', url: 'https://formik.org/docs/overview' },
  'tanstack-form': { name: 'TanStack Form', url: 'https://tanstack.com/form/latest/docs/overview' },

  // Icons
  lucide: { name: 'Lucide Icons', url: 'https://lucide.dev/guide' },
  'react-icons': { name: 'React Icons', url: 'https://react-icons.github.io/react-icons' },
  iconify: { name: 'Iconify', url: 'https://iconify.design/docs' },
  heroicons: { name: 'Heroicons', url: 'https://heroicons.com' },
  fontawesome: { name: 'Font Awesome', url: 'https://fontawesome.com/docs' },

  // Animation
  'framer-motion': { name: 'Framer Motion', url: 'https://motion.dev/docs/react-quick-start' },
  gsap: { name: 'GSAP', url: 'https://gsap.com/docs/v3' },
  'react-spring': { name: 'React Spring', url: 'https://www.react-spring.dev/docs/getting-started' },
  'auto-animate': { name: 'AutoAnimate', url: 'https://auto-animate.formkit.com' },

  // Testing
  vitest: { name: 'Vitest', url: 'https://vitest.dev/guide' },
  jest: { name: 'Jest', url: 'https://jestjs.io/docs/getting-started' },

  // Linting
  'eslint-prettier': { name: 'ESLint + Prettier', url: 'https://eslint.org/docs/latest/use/getting-started' },
  biome: { name: 'Biome', url: 'https://biomejs.dev/guides/getting-started' },
};

export const docsConfigurator = async (ctx: ConfiguratorContext): Promise<void> => {
  const {
    framework,
    styling,
    ui,
    state,
    routing,
    dataFetching,
    forms,
    icons,
    animation,
    testing,
    linting
  } = ctx.selections;

  const sections: Record<string, DocLink[]> = {
    'Core': [],
    'Styling': [],
    'UI Components': [],
    'State Management': [],
    'Routing': [],
    'Data Fetching': [],
    'Forms': [],
    'Icons': [],
    'Animation': [],
    'Quality Assurance': [],
  };

  // Populate sections
  if (framework && DOCS_LINKS[framework]) sections['Core'].push(DOCS_LINKS[framework]);
  if (DOCS_LINKS['vite']) sections['Core'].push(DOCS_LINKS['vite']);

  if (styling && DOCS_LINKS[styling]) sections['Styling'].push(DOCS_LINKS[styling]);
  if (ui && DOCS_LINKS[ui]) sections['UI Components'].push(DOCS_LINKS[ui]);

  if (state && DOCS_LINKS[state]) sections['State Management'].push(DOCS_LINKS[state]);
  if (routing && DOCS_LINKS[routing]) sections['Routing'].push(DOCS_LINKS[routing]);

  if (dataFetching && DOCS_LINKS[dataFetching]) sections['Data Fetching'].push(DOCS_LINKS[dataFetching]);
  if (forms && DOCS_LINKS[forms]) sections['Forms'].push(DOCS_LINKS[forms]);

  if (icons && DOCS_LINKS[icons]) sections['Icons'].push(DOCS_LINKS[icons]);
  if (animation && DOCS_LINKS[animation]) sections['Animation'].push(DOCS_LINKS[animation]);

  if (testing && DOCS_LINKS[testing]) sections['Quality Assurance'].push(DOCS_LINKS[testing]);
  if (linting && DOCS_LINKS[linting]) sections['Quality Assurance'].push(DOCS_LINKS[linting]);

  let content = `# 📚 Documentation Links

Quick reference to official documentation for your project stack.

`;

  for (const [section, links] of Object.entries(sections)) {
    if (links.length > 0) {
      content += `## ${getSectionEmoji(section)} ${section}\n`;
      links.forEach(link => {
        content += `- [${link.name}](${link.url})\n`;
      });
      content += '\n';
    }
  }

  content += '---\nGenerated by NEXO CLI\n';

  await writeFile(path.join(ctx.projectPath, 'DOCS.md'), content);
};

function getSectionEmoji(section: string): string {
  switch (section) {
    case 'Core': return '🎯';
    case 'Styling': return '🎨';
    case 'UI Components': return '🧩';
    case 'State Management': return '📊';
    case 'Routing': return '🔀';
    case 'Data Fetching': return '📡';
    case 'Forms': return '📝';
    case 'Icons': return '✨';
    case 'Animation': return '🎭';
    case 'Quality Assurance': return '✅';
    default: return '📄';
  }
}
