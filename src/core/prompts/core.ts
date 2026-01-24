/**
 * Core prompts - Main selections for project setup
 */

import type { PromptConfig } from '../../types/index.js';


export const packageManagerPrompt: PromptConfig = {
  name: 'packageManager',
  message: 'Select a package manager:',
  type: 'list',
  options: [
    {
      value: 'npm',
      name: 'npm',
      comment: 'Default',
      hover_note: 'Standard Node Package Manager (Optimized)',
    },
    {
      value: 'pnpm',
      name: 'pnpm',
      comment: 'Fast, disk efficient',
      hover_note: 'Uses hard links to save space and time',
    },
    {
      value: 'bun',
      name: 'bun',
      comment: 'Super fast runtime',
      hover_note: 'All-in-one toolkit for JavaScript apps',
    },
    {
      value: 'yarn',
      name: 'yarn',
      comment: 'Fast, reliable',
      hover_note: 'Fast, reliable, and secure dependency management',
    },
  ],
};

export const variantPrompt: PromptConfig = {
  name: 'variant',
  message: 'Select a variant:',
  type: 'list',
  options: [
    {
      value: 'ts',
      name: 'TypeScript',
      comment: 'Type-safe JavaScript',
      hover_note: 'Standard TypeScript setup with full type checking',
    },
    {
      value: 'ts-compiler',
      name: 'TypeScript + React Compiler',
      comment: 'Auto-optimization with React 19',
      hover_note: 'Uses React Compiler for automatic memoization - best for React 19+',
    },
    {
      value: 'ts-swc',
      name: 'TypeScript + SWC',
      comment: 'Faster builds with SWC',
      hover_note: 'Rust-based compiler for 20x faster builds than Babel',
    },
    {
      value: 'js',
      name: 'JavaScript',
      comment: 'Standard JavaScript',
      hover_note: 'No type system, simpler setup',
    },
    {
      value: 'js-compiler',
      name: 'JavaScript + React Compiler',
      comment: 'Auto-optimization without types',
      hover_note: 'React Compiler benefits without TypeScript overhead',
    },
    {
      value: 'js-swc',
      name: 'JavaScript + SWC',
      comment: 'Faster builds without types',
      hover_note: 'Fast SWC compilation for JavaScript projects',
    },
  ],
};

export const stylingPrompt: PromptConfig = {
  name: 'styling',
  message: 'Select a styling solution:',
  type: 'list',
  options: [
    {
      value: 'tailwind',
      name: 'Tailwind CSS',
      comment: 'Utility-first CSS framework',
      hover_note: 'Rapidly build modern websites without leaving your HTML - includes dark mode',
    },
    {
      value: 'css-modules',
      name: 'CSS Modules',
      comment: 'Scoped CSS by default',
      hover_note: 'CSS files where class names are scoped locally to avoid conflicts',
    },

    {
      value: 'sass',
      name: 'Sass/SCSS',
      comment: 'CSS with superpowers',
      hover_note: 'Variables, nesting, mixins, and more - industry standard preprocessor',
    },
    {
      value: 'styled-components',
      name: 'Styled Components',
      comment: 'CSS-in-JS solution',
      hover_note: 'Write actual CSS code inside your React components',
    },
  ],
};

export const uiPrompt: PromptConfig = {
  name: 'ui',
  message: 'Select a UI library:',
  type: 'list',
  options: [
    {
      value: 'shadcn',
      name: 'shadcn/ui',
      comment: 'Beautifully designed components (~0KB base)',
      hover_note: 'Copy-paste components built with Radix and Tailwind - only import what you use',
    },
    {
      value: 'radix',
      name: 'Radix UI',
      comment: 'Unstyled, accessible (~5KB per component)',
      hover_note: 'Low-level primitives for building custom design systems',
    },

    {
      value: 'heroui',
      name: 'HeroUI',
      comment: 'Beautiful, fast UI (~30KB gzipped)',
      hover_note: 'Modern components built on Tailwind CSS and Radix primitives',
    },
    {
      value: 'mui',
      name: 'Material UI (MUI)',
      comment: 'Google Material Design',
      hover_note: 'Comprehensive component library following Material Design guidelines',
    },
    {
      value: 'antd',
      name: 'Ant Design',
      comment: 'Enterprise-class UI (~120KB gzipped)',
      hover_note: 'Feature-rich for enterprise apps with design system',
    },
    {
      value: 'chakra',
      name: 'Chakra UI',
      comment: 'Simple, modular (~80KB gzipped)',
      hover_note: 'Good developer experience with accessible components',
    },
    {
      value: 'none',
      name: 'None',
      comment: 'No UI library (0KB)',
      hover_note: 'Build your own components from scratch',
    },
  ],
};

export const formsPrompt: PromptConfig = {
  name: 'forms',
  message: 'Select a forms solution:',
  type: 'list',
  options: [
    {
      value: 'rhf-zod',
      name: 'React Hook Form + Zod',
      comment: 'Best performance + type safety',
      hover_note: 'Minimal re-renders with TypeScript-first validation schema',
    },
    {
      value: 'rhf-yup',
      name: 'React Hook Form + Yup',
      comment: 'Performant with Yup validation',
      hover_note: 'Well-established validation library with good ecosystem',
    },
    {
      value: 'formik-zod',
      name: 'Formik + Zod',
      comment: 'Popular form library + Zod',
      hover_note: 'Formik\'s simplicity with Zod\'s type inference',
    },
    {
      value: 'formik-yup',
      name: 'Formik + Yup',
      comment: 'Traditional Formik setup',
      hover_note: 'Classic combination for form handling',
    },
    {
      value: 'tanstack-form',
      name: 'TanStack Form',
      comment: 'Type-safe forms by TanStack',
      hover_note: 'Framework-agnostic with first-class TypeScript support',
    },
    {
      value: 'none',
      name: 'None',
      comment: 'No forms library',
      hover_note: 'Use native form handling or add later',
    },
  ],
};

export const statePrompt: PromptConfig = {
  name: 'state',
  message: 'Select a state management solution:',
  type: 'list',
  options: [
    {
      value: 'zustand',
      name: 'Zustand',
      comment: 'Small, fast, scalable',
      hover_note: 'Minimal API with excellent TypeScript support - no boilerplate',
    },
    {
      value: 'redux',
      name: 'Redux Toolkit',
      comment: 'Industry standard',
      hover_note: 'Best for complex state with devtools, middleware, and persistence',
    },
    {
      value: 'jotai',
      name: 'Jotai',
      comment: 'Primitive atoms approach',
      hover_note: 'Atomic state management - great for derived state',
    },
    {
      value: 'none',
      name: 'None',
      comment: 'React built-in state',
      hover_note: 'Use useState, useReducer, and Context API',
    },

  ],
};

export const routingPrompt: PromptConfig = {
  name: 'routing',
  message: 'Select a routing solution:',
  type: 'list',
  options: [
    {
      value: 'react-router',
      name: 'React Router',
      comment: 'Most popular routing',
      hover_note: 'Declarative routing with data loading and actions support',
    },
    {
      value: 'tanstack-router',
      name: 'TanStack Router',
      comment: 'Fully type-safe routing',
      hover_note: 'Type-safe from route definition to component - great DX',
    },
    {
      value: 'none',
      name: 'None',
      comment: 'No routing',
      hover_note: 'Single page app without navigation',
    },
  ],
};

export const dataFetchingPrompt: PromptConfig = {
  name: 'dataFetching',
  message: 'Select a data fetching solution:',
  type: 'list',
  options: [
    {
      value: 'tanstack-query',
      name: 'TanStack Query',
      comment: 'Powerful async state',
      hover_note: 'Caching, background updates, optimistic UI, infinite scroll built-in',
    },

    {
      value: 'axios',
      name: 'Axios',
      comment: 'Promise-based HTTP client',
      hover_note: 'Simple API with interceptors, transforms, and automatic JSON parsing',
    },
    {
      value: 'fetch',
      name: 'Native Fetch',
      comment: 'Built-in browser API',
      hover_note: 'No dependencies - use browser\'s native fetch API',
    },
    {
      value: 'none',
      name: 'None',
      comment: 'No data fetching setup',
      hover_note: 'Add data fetching solution later',
    },
  ],
};

export const iconsPrompt: PromptConfig = {
  name: 'icons',
  message: 'Select an icon library:',
  type: 'list',
  options: [
    {
      value: 'lucide',
      name: 'Lucide',
      comment: 'Beautiful & consistent',
      hover_note: 'Community-driven fork of Feather Icons - tree-shakeable',
    },
    {
      value: 'react-icons',
      name: 'React Icons',
      comment: 'Largest collection (Fa, Md, Ai...)',
      hover_note: 'Includes Font Awesome, Material, Ant Design, Bootstrap icons and more',
    },
    {
      value: 'iconify',
      name: 'Iconify',
      comment: 'Universal icon framework',
      hover_note: 'Access to 100,000+ icons from 100+ icon sets in one library',
    },
    {
      value: 'heroicons',
      name: 'Heroicons',
      comment: 'By Tailwind Labs',
      hover_note: 'Hand-crafted SVG icons designed to pair with Tailwind CSS',
    },
    {
      value: 'fontawesome',
      name: 'Font Awesome',
      comment: 'Extensive icon library',
      hover_note: 'Thousands of icons in multiple styles (solid, regular, brands)',
    },
    {
      value: 'none',
      name: 'None',
      comment: 'No icon library',
      hover_note: 'Use your own SVGs or add icons later',
    },
  ],
};

export const structurePrompt: PromptConfig = {
  name: 'structure',
  message: 'Select a project structure:',
  type: 'list',
  options: [
    {
      value: 'feature-based',
      name: 'Feature-based',
      comment: 'Organize by features',
      hover_note: 'Group files by feature/domain - scales well for large apps',
      folder_info: ['src/features/*', 'src/shared/*', 'src/app/*'],
    },
    {
      value: 'fsd',
      name: 'FSD (Feature-Sliced Design)',
      comment: 'Architectural methodology',
      hover_note: 'Layers → Slices → Segments - highly scalable architecture',
      folder_info: ['src/app', 'src/pages', 'src/widgets', 'src/features', 'src/entities', 'src/shared'],
    },
    {
      value: 'atomic',
      name: 'Atomic Design',
      comment: 'Atoms → Molecules → Organisms',
      hover_note: 'Design system methodology by Brad Frost - great for component libraries',
      folder_info: ['src/components/atoms', 'src/components/molecules', 'src/components/organisms'],
    },
    {
      value: 'clean',
      name: 'Clean Architecture',
      comment: 'Domain-driven layers',
      hover_note: 'Separation of concerns with domain, application, and infrastructure layers',
      folder_info: ['src/domain', 'src/application', 'src/infrastructure', 'src/presentation'],
    },
    {
      value: 'mvc',
      name: 'MVC Pattern',
      comment: 'Model-View-Controller',
      hover_note: 'Classic pattern separating data, UI, and business logic',
      folder_info: ['src/models', 'src/views', 'src/controllers'],
    },
    {
      value: 'simple',
      name: 'Simple',
      comment: 'Minimal structure',
      hover_note: 'Basic folders for small projects - easy to reorganize later',
      folder_info: ['src/components', 'src/hooks', 'src/utils', 'src/assets'],
    },
  ],
};

/** All core prompts */
export const corePrompts: PromptConfig[] = [
  variantPrompt,
  stylingPrompt,
  uiPrompt,
  formsPrompt,
  statePrompt,
  routingPrompt,
  dataFetchingPrompt,
  iconsPrompt,
  structurePrompt,
  packageManagerPrompt,
];

