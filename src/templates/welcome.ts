/**
 * Welcome page generator (App.tsx/App.jsx + App.css)
 */
import path from 'node:path';
import type { ConfiguratorContext } from '../types/index.js';
import { writeFile } from '../utils/index.js';

// Tech icons mapping
const TECH_ICONS: Record<string, string> = {
  'React 19': '⚛️',
  Vite: '⚡',
  TypeScript: '🔷',
  JavaScript: '🟨',
  'React Compiler': '🚀',
  SWC: '🦀',
  'Tailwind CSS': '🌊',
  'Sass/SCSS': '💅',
  'CSS Modules': '📦',
  'shadcn/ui': '🎨',
  'Radix UI': '🔘',

  HeroUI: '🦸',
  'Ant Design': '🐜',
  'Chakra UI': '⚡',
  Zustand: '🐻',
  'Redux Toolkit': '🔄',
  Jotai: '👻',
  'React Router': '🧭',
  'TanStack Router': '🛤️',
  'TanStack Query': '🔄',
  Axios: '📡',
  'Fetch API': '🌐',
  'React Hook Form + Zod': '📝',
  'React Hook Form + Yup': '📝',
  'Formik + Zod': '📋',
  'Formik + Yup': '📋',
  Vitest: '🧪',
  Jest: '🃏',
  'ESLint + Prettier': '✨',
  Biome: '🌿',
  'Framer Motion': '🎬',
  'React Spring': '🌸',
};

interface TechItem {
  name: string;
  icon: string;
}

/**
 * Build tech stack array from selections
 */
const buildTechStack = (ctx: ConfiguratorContext): TechItem[] => {
  const { variant, styling, ui, forms, state, routing, dataFetching, testing, linting, animation } =
    ctx.selections;

  const stack: TechItem[] = [
    { name: 'React 19', icon: TECH_ICONS['React 19'] ?? '⚛️' },
    { name: 'Vite', icon: TECH_ICONS['Vite'] ?? '⚡' },
  ];

  // Variant
  if (variant.includes('ts')) stack.push({ name: 'TypeScript', icon: TECH_ICONS['TypeScript'] ?? '🔷' });
  if (variant.includes('compiler')) stack.push({ name: 'React Compiler', icon: TECH_ICONS['React Compiler'] ?? '🚀' });
  if (variant.includes('swc')) stack.push({ name: 'SWC', icon: TECH_ICONS['SWC'] ?? '🦀' });

  // Styling
  const stylingNames: Record<string, string> = {
    tailwind: 'Tailwind CSS',
    sass: 'Sass/SCSS',
    'css-modules': 'CSS Modules',
  };
  if (stylingNames[styling]) {
    const name = stylingNames[styling];
    stack.push({ name, icon: TECH_ICONS[name] ?? '🎨' });
  }

  // UI
  const uiNames: Record<string, string> = {
    shadcn: 'shadcn/ui',
    radix: 'Radix UI',

    heroui: 'HeroUI',
    antd: 'Ant Design',
    chakra: 'Chakra UI',
  };
  if (ui && ui !== 'none' && uiNames[ui]) {
    const name = uiNames[ui];
    stack.push({ name, icon: TECH_ICONS[name] ?? '📦' });
  }

  // State
  const stateNames: Record<string, string> = {
    zustand: 'Zustand',
    redux: 'Redux Toolkit',
    jotai: 'Jotai',
  };
  if (state && state !== 'none' && stateNames[state]) {
    const name = stateNames[state];
    stack.push({ name, icon: TECH_ICONS[name] ?? '📦' });
  }

  // Routing
  const routingNames: Record<string, string> = {
    'react-router': 'React Router',
    'tanstack-router': 'TanStack Router',
  };
  if (routing && routing !== 'none' && routingNames[routing]) {
    const name = routingNames[routing];
    stack.push({ name, icon: TECH_ICONS[name] ?? '📦' });
  }

  // Data Fetching
  const dataNames: Record<string, string> = {
    'tanstack-query': 'TanStack Query',
    axios: 'Axios',
    fetch: 'Fetch API',
  };
  if (dataFetching && dataFetching !== 'none' && dataNames[dataFetching]) {
    const name = dataNames[dataFetching];
    stack.push({ name, icon: TECH_ICONS[name] ?? '📦' });
  }

  // Forms
  const formNames: Record<string, string> = {
    'rhf-zod': 'React Hook Form + Zod',
    'rhf-yup': 'React Hook Form + Yup',
    'formik-zod': 'Formik + Zod',
    'formik-yup': 'Formik + Yup',
  };
  if (forms && forms !== 'none' && formNames[forms]) {
    const name = formNames[forms];
    stack.push({ name, icon: TECH_ICONS[name] ?? '📝' });
  }

  // Testing
  if (testing) {
    const name = testing === 'vitest' ? 'Vitest' : 'Jest';
    stack.push({ name, icon: TECH_ICONS[name] ?? '🧪' });
  }

  // Linting
  if (linting) {
    const name = linting === 'biome' ? 'Biome' : 'ESLint + Prettier';
    stack.push({ name, icon: TECH_ICONS[name] ?? '✨' });
  }

  // Animation
  if (animation) {
    const name = animation === 'framer-motion' ? 'Framer Motion' : 'React Spring';
    stack.push({ name, icon: TECH_ICONS[name] ?? '🎬' });
  }

  return stack;
};

/**
 * Create App.tsx with Tailwind styling
 */
const createTailwindApp = (projectName: string, techStack: TechItem[], isRtl: boolean): string => {
  const techStackString = techStack.map((t) => `{ name: '${t.name}', icon: '${t.icon}' }`).join(', ');

  const t = {
    badge: 'NEXO CLI',
    ready: isRtl ? 'تطبيق React عالي الأداء جاهز للإطلاق.' : 'Your high-performance React application is ready for takeoff.',
    techTitle: isRtl ? 'التقنيات المستخدمة' : 'Tech Stack',
    startTitle: isRtl ? 'ابدأ الآن' : 'Get Started',
    step1: isRtl ? 'قم بتعديل src/App.tsx' : 'Edit src/App.tsx',
    step2: isRtl ? 'احفظ الملف وشاهد التغييرات' : 'Save and see changes',
    step3: isRtl ? 'ابدأ في بناء مشروعك المذهل! ✨' : 'Build something amazing! ✨',
    footer: isRtl ? 'تم التطوير بكل ❤️ باستخدام' : 'Made with ❤️ using'
  };

  return `const techStack = [${techStackString}]

function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-cyan-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-screen">

        {/* Header */}
        <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-block px-3 py-1 pb-1.5 mb-4 text-xs font-medium tracking-wider text-cyan-400 uppercase bg-cyan-950/30 border border-cyan-800/50 rounded-full">
            ${t.badge}
          </div>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
              ${projectName}
            </span>
          </h1>
          <p className="text-lg text-neutral-400 max-w-lg mx-auto">
            ${t.ready}
          </p>
        </div>

        {/* Tech Stack Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-12">
          {/* Tech Card */}
          <div className="group relative p-8 rounded-3xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm transition-all hover:border-neutral-700 hover:bg-neutral-900/80">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-2.5 bg-neutral-800 rounded-xl">
                   <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                   </svg>
                 </div>
                 <h2 className="text-xl font-semibold text-white">${t.techTitle}</h2>
               </div>
             <div className="flex flex-wrap gap-2">
                 {techStack.map((tech, i) => (
                   <span key={i} className="px-3 py-1.5 flex items-center gap-1.5 border border-neutral-800 bg-neutral-900/50 rounded-lg text-sm text-neutral-300 hover:text-white hover:border-purple-500/30 hover:bg-purple-500/10 transition-colors cursor-default">
                     <span>{tech.icon}</span>
                     <span>{tech.name}</span>
                   </span>
                 ))}
               </div>
            </div>
          </div>

          {/* Steps Card */}
          <div className="group relative p-8 rounded-3xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm transition-all hover:border-neutral-700 hover:bg-neutral-900/80">
             <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-neutral-800 rounded-xl">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-white">${t.startTitle}</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { text: '${t.step1}', code: true },
                    { text: '${t.step2}', code: false },
                    { text: '${t.step3}', code: false }
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-4 text-sm text-neutral-400">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border border-neutral-800 bg-neutral-900 text-xs font-mono">
                        {i + 1}
                      </div>
                      {step.code ? (
                         <span>${isRtl ? 'قم بتعديل ' : 'Edit '} <code className="px-1.5 py-0.5 rounded bg-cyan-950/30 border border-cyan-800/30 text-cyan-300 font-mono text-xs">src/App.tsx</code></span>
                      ) : (
                         <span>{step.text}</span>
                      )}
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-neutral-500 text-sm animate-in fade-in duration-1000 delay-500">
          ${t.footer} <span className="text-neutral-300 font-medium">NEXO CLI</span>
        </p>
      </div>
    </div>
  )
}

export default App
`;
};

/**
 * Create App.tsx with plain CSS styling
 */
const createPlainApp = (projectName: string, techStack: TechItem[], isRtl: boolean): string => {
  const techStackString = techStack.map((t) => `{ name: '${t.name}', icon: '${t.icon}' }`).join(', ');

  const t = {
    ready: isRtl ? 'تطبيق React عالي الأداء جاهز.' : 'Your high-performance React application is ready.',
    techTitle: isRtl ? 'التقنيات المستخدمة' : 'Tech Stack',
    startTitle: isRtl ? 'ابدأ الآن' : 'Get Started',
    step1: isRtl ? 'قم بتعديل src/App.tsx' : 'Edit src/App.tsx',
    step2: isRtl ? 'احفظ الملف وشاهد التغييرات' : 'Save and see changes',
    step3: isRtl ? 'ابدأ في بناء مشروعك المذهل!' : 'Build something amazing!',
    footer: isRtl ? 'تم التطوير بكل ❤️ باستخدام' : 'Made with ❤️ using'
  };

  return `import './App.css'

const techStack = [${techStackString}]

function App() {
  return (
    <div className="app-container">
      <div className="background-glow"></div>

      <div className="content">
        <div className="header">
           <div className="badge">NEXO CLI</div>
           <h1 className="title">${projectName}</h1>
           <p className="subtitle">${t.ready}</p>
        </div>

        <div className="grid">
          <div className="card tech-card">
            <div className="card-header">
              <span className="icon">🛠️</span>
              <h2>${t.techTitle}</h2>
            </div>
            <div className="tech-tags">
              {techStack.map((tech, i) => <span key={i} className="tag">{tech.icon} {tech.name}</span>)}
            </div>
          </div>

          <div className="card steps-card">
            <div className="card-header">
              <span className="icon">🚀</span>
              <h2>${t.startTitle}</h2>
            </div>
            <div className="steps">
              <div className="step">
                <span className="number">1</span>
                <span>${t.step1}</span>
              </div>
              <div className="step">
                <span className="number">2</span>
                <span>${t.step2}</span>
              </div>
              <div className="step">
                <span className="number">3</span>
                <span>${t.step3}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="footer">${t.footer} NEXO CLI</p>
      </div>
    </div>
  )
}

export default App
`;
};

/**
 * Create welcome page App component
 */
export const createWelcomePage = (ctx: ConfiguratorContext): string => {
  const { projectName, styling, rtl } = ctx.selections;
  const techStack = buildTechStack(ctx);
  const isTailwind = styling === 'tailwind';
  const isRtl = rtl === true;

  return isTailwind
    ? createTailwindApp(projectName, techStack, isRtl)
    : createPlainApp(projectName, techStack, isRtl);
};

/**
 * Create App.tsx file
 */
export const createAppFile = async (ctx: ConfiguratorContext, ext: string): Promise<void> => {
  const srcDir = path.join(ctx.projectPath, 'src');
  const content = createWelcomePage(ctx);
  await writeFile(path.join(srcDir, `App.${ext}`), content);
};
