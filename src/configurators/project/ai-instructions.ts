/**
 * AI Instructions Configurator
 * Generates instruction files for AI IDEs and CLIs
 */

import path from 'path';
import type { ConfiguratorContext } from '../../types/index.js';
import { ensureDir, writeFile } from '../../utils/fs.js';


interface AIInstructionTemplateData {
  projectName: string;
  framework: string;
  variant: string;
  styling: string;
  ui: string;
  forms: string;
  state: string;
  routing: string;
  dataFetching: string;
  structure: string;
  icons: string;

  hasTesting: boolean;
  language?: 'en';
}

// Helper function for comprehensive templates
const generateComprehensiveTemplate = (data: AIInstructionTemplateData, title: string): string => `# ${title} - ${data.projectName}

## Project Overview
This is a **${data.framework}** application built with modern best practices and tools.

## Tech Stack

### Core
- **Framework**: ${data.framework}
- **Language**: ${data.variant.includes('ts') ? 'TypeScript' : 'JavaScript'}${data.variant.includes('compiler') ? ' + React Compiler' : ''}${data.variant.includes('swc') ? ' + SWC' : ''}
- **Build Tool**: Vite

### Styling & UI
- **Styling**: ${data.styling}
${data.ui !== 'none' ? `- **UI Library**: ${data.ui}` : ''}
${data.icons !== 'none' ? `- **Icons**: ${data.icons}` : ''}

### State & Data
${data.state !== 'none' ? `- **State**: ${data.state}` : ''}
${data.routing !== 'none' ? `- **Routing**: ${data.routing}` : ''}
${data.dataFetching !== 'none' ? `- **Data Fetching**: ${data.dataFetching}` : ''}
${data.forms !== 'none' ? `- **Forms**: ${data.forms}` : ''}

### Additional Features

${data.hasTesting ? '- **Testing**: Configured' : ''}

## Project Structure

This project follows the **${data.structure}** architecture pattern.

${data.structure === 'feature-based' ? `
### Feature-Based Structure
\`\`\`
src/
├── features/        # Feature modules
│   └── [feature]/
│       ├── components/
│       ├── hooks/
│       └── utils/
├── shared/          # Shared utilities
└── app/             # App-level config
\`\`\`

**Architecture**: ${data.structure}
**Organization**: Group related files by feature/domain
` : ''}

${data.structure === 'fsd' ? `
### FSD (Feature-Sliced Design)
\`\`\`
src/
├── app/             # App initialization
├── pages/           # Page components
├── widgets/         # Complex components
├── features/        # Business features
├── entities/        # Business entities
└── shared/          # Shared code
\`\`\`

**Architecture**: ${data.structure}
**Organization**: Group related files by feature/domain
` : ''}

${data.structure === 'simple' ? `
### Simple Structure
\`\`\`
src/
├── components/      # React components
├── hooks/           # Custom hooks
├── utils/           # Utilities
└── assets/          # Static assets
\`\`\`

**Architecture**: ${data.structure}
**Organization**: Group related files by feature/domain
` : ''}

## Code Style Guidelines

### General Principles
1. **Type Safety First**: Always use proper TypeScript types (no \`any\` unless absolutely necessary)
2. **Component Composition**: Prefer small, focused components over large monoliths
3. **Custom Hooks**: Extract reusable logic into custom hooks
4. **Consistent Naming**: Use PascalCase for components, camelCase for functions/variables

### React Best Practices
- Use functional components with hooks
- Keep components pure when possible
- Use React.memo() for expensive renders
- Prefer composition over prop drilling
${data.variant.includes('compiler') ? '- React Compiler handles memoization automatically' : '- Use useMemo/useCallback strategically'}

### Styling Conventions
${data.styling === 'tailwind' ? `
- Use Tailwind utility classes
- Create reusable component variants
- Keep class names semantic and organized
- Use \`cn()\` utility for conditional classes
` : ''}

${data.styling === 'css-modules' ? `
- One CSS module per component
- Use BEM naming within modules
- Keep styles scoped to components
` : ''}

${data.ui === 'shadcn' ? `
### shadcn/ui Guidelines
- Components are in \`src/components/ui/\`
- Customize via Tailwind config
- Use the CLI to add new components: \`npx shadcn@latest add [component]\`
` : ''}

${data.state === 'zustand' ? `
### State Management (Zustand)
- Create focused stores for specific domains
- Use slices pattern for large stores
- Keep actions alongside state
- Use selectors to prevent unnecessary rerenders
` : ''}

${data.state === 'redux' ? `
### State Management (Redux Toolkit)
- Use createSlice for reducers
- Keep slices focused on single domains
- Use RTK Query for API calls
- Leverage TypeScript for state typing
` : ''}

${data.routing === 'react-router' ? `
### Routing (React Router)
- Define routes in a centralized location
- Use loader functions for data fetching
- Implement error boundaries per route
- Use nested routes for layouts
` : ''}

${data.routing === 'tanstack-router' ? `
### Routing (TanStack Router)
- Leverage full type safety in routes
- Use route loaders for data
- Define routes with type-safe params
- Utilize route-based code splitting
` : ''}

${data.forms !== 'none' ? `
### Forms Best Practices
- Validate on submit, not on every keystroke
- Use schema-based validation
- Provide clear error messages
- Handle loading/error states
` : ''}

## Important Patterns

### Error Handling
- Always handle async errors with try/catch
- Provide user-friendly error messages
- Log errors for debugging
- Use error boundaries for component errors

### Performance
- Code-split routes and heavy components
- Lazy load images and assets
- Debounce expensive operations
- Use virtual scrolling for long lists


### Accessibility
- Use semantic HTML elements
- Provide ARIA labels where needed
- Ensure keyboard navigation works
- Maintain proper heading hierarchy

## API Layer & Data Fetching

${data.dataFetching === 'trpc' ? `
### tRPC Architecture
- **Routers**: Defined in \`src/server/api/routers\`
- **Procedures**: Use \`publicProcedure\` or \`protectedProcedure\`
- **Client**: Use \`api.router.procedure.useQuery()\`
- **Types**: Inferred automatically from backend routers
` : ''}

${data.dataFetching === 'tanstack-query' ? `
### TanStack Query
- **Keys**: Use query key factories (e.g. \`userKeys.all\`)
- **Hooks**: Custom hooks for queries/mutations
- **Error Handling**: Global error boundary or per-query
` : ''}

## Localization Context
**Primary Language**: English (en)

## AI Behavior Guidelines

### Code Generation Rules
1. **Always Generate Complete Code**
   - Provide full, working implementations
   - Never use placeholders like "// rest of the code"
   - Include all necessary imports
   - Write complete functions, not stubs

2. **Type Safety**
   - Use explicit TypeScript types
   - No \`any\` types unless absolutely necessary
   - Define interfaces for component props
   - Type all function parameters and return values

3. **Best Practices**
   - Follow the project's architecture pattern
   - Use existing utilities and helpers
   - Match the established coding style
   - Consider performance implications

### Response Template

When generating code, follow this structure:

\`\`\`typescript
// 1. Imports
import React from 'react';
import { type ComponentProps } from './types';

// 2. Types/Interfaces
interface Props {
  // ...
}

// 3. Component/Function
export function Component({ prop }: Props) {
  // Complete implementation
  return (
    // Full JSX
  );
}
\`\`\`

### Code Review Checklist
- [ ] All TypeScript types are defined
- [ ] No \`any\` types used
- [ ] Error handling is implemented
- [ ] Component is accessible
- [ ] Performance is considered
- [ ] Code follows project patterns

## Development Workflow

### Adding New Features
1. Create feature branch from main
2. Follow the project structure pattern
3. Write tests alongside code
4. Ensure type safety
5. Update documentation

## Common Commands

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
${data.hasTesting ? 'npm test            # Run tests' : ''}
npm run lint         # Lint code
\`\`\`

## Notes for AI Assistants

- **Always maintain type safety** - TypeScript is critical to this project
- **Follow the established architecture** - Don't introduce new patterns without discussion
- **Test your changes** - Ensure components work as expected
- **Keep dependencies minimal** - Only add packages when necessary
- **Respect the project structure** - Place files in the correct directories
- **Write self-documenting code** - Clear names over comments when possible
- **Generate complete code** - No placeholders or incomplete implementations
`;

const generateCursorRules = (data: AIInstructionTemplateData): string => `# Cursor Rules for ${data.projectName}

You are an expert ${data.framework} developer working on this project.

## Tech Stack
Framework: ${data.framework}
Language: ${data.variant.includes('ts') ? 'TypeScript' : 'JavaScript'}
Styling: ${data.styling}
${data.ui !== 'none' ? `UI Library: ${data.ui}` : ''}
${data.state !== 'none' ? `State: ${data.state}` : ''}

## Code Style
- Use ${data.variant.includes('ts') ? 'TypeScript with strict types' : 'JavaScript with JSDoc'}
- Functional components with hooks only
- Extract logic into custom hooks
${data.styling === 'tailwind' ? '- Use Tailwind utility classes' : ''}
${data.ui === 'shadcn' ? '- shadcn/ui components in src/components/ui/' : ''}

## File Structure
Follow ${data.structure} architecture:
${data.structure === 'feature-based' ? '- Group by features in src/features/' : ''}
${data.structure === 'fsd' ? '- Use FSD layers: app/pages/widgets/features/entities/shared' : ''}
${data.structure === 'simple' ? '- Keep it simple: components/hooks/utils/assets' : ''}

## Best Practices
1. Type everything explicitly
2. Keep components small and focused
3. Use composition over complexity
4. Write self-documenting code
${data.hasTesting ? '5. Write tests alongside features' : ''}

## When Creating Components
- PascalCase for component files
- Co-locate tests and styles
- Export from index files
- Use proper TypeScript types

## When Writing Code
- No \`any\` types
- Handle errors gracefully
- Consider accessibility
- Optimize for performance
`;

const generateWindsurfRules = (data: AIInstructionTemplateData): string => `# Windsurf Rules for ${data.projectName}

Project: ${data.framework} with ${data.variant}
Architecture: ${data.structure}

## Stack
${data.framework} | ${data.styling} | ${data.ui !== 'none' ? data.ui : 'No UI lib'} | ${data.state !== 'none' ? data.state : 'React state'}

## Coding Standards
✓ ${data.variant.includes('ts') ? 'TypeScript strict mode' : 'JavaScript'}
✓ Functional components only
✓ Custom hooks for logic extraction
${data.styling === 'tailwind' ? '✓ Tailwind for styling' : ''}

## Project Structure
${data.structure}

## Key Principles
1. Type safety is non-negotiable
2. Components should be composable
3. Extract reusable logic to hooks
4. Follow established patterns
5. Test critical paths

## Commands
dev: npm run dev
build: npm run build
${data.hasTesting ? 'test: npm test' : ''}
`;

const generateClineRules = (data: AIInstructionTemplateData): string => `# Cline Rules

## Project Details
- Framework: ${data.framework}
- Language: ${data.variant}
- Structure: ${data.structure}

## Tech Stack Overview
Styling: ${data.styling}
${data.ui !== 'none' ? `UI Library: ${data.ui}` : ''}
${data.state !== 'none' ? `State: ${data.state}` : ''}
${data.routing !== 'none' ? `Routing: ${data.routing}` : ''}
${data.dataFetching !== 'none' ? `Data: ${data.dataFetching}` : ''}

## Development Guidelines

### Code Quality
- Strict TypeScript typing
- Functional React patterns
- Component composition
- Custom hooks for shared logic

### File Organization
Follow ${data.structure} pattern:
${data.structure === 'feature-based' ? '- src/features/[feature-name]/' : ''}
${data.structure === 'fsd' ? '- FSD layers: app/pages/widgets/features/entities/shared' : ''}
${data.structure === 'simple' ? '- src/components/, src/hooks/, src/utils/' : ''}

### Best Practices
1. Type all props and return values
2. Use semantic HTML
3. Handle loading/error states
4. Optimize re-renders
${data.hasTesting ? '5. Write unit tests' : ''}

### Common Patterns
- Custom hooks for data fetching
- Error boundaries for resilience
- Code splitting for performance
${data.state === 'zustand' ? '- Zustand stores for state' : ''}
${data.state === 'redux' ? '- Redux slices for state' : ''}

## Quick Reference
\`\`\`bash
npm run dev     # Development
npm run build   # Production build
${data.hasTesting ? 'npm test       # Run tests' : ''}
\`\`\`
`;

const generateRooClineRules = (data: AIInstructionTemplateData): string => `# Roo-Cline Instructions for ${data.projectName}

## Project Configuration
- **Framework**: ${data.framework}
- **Language**: ${data.variant.includes('ts') ? 'TypeScript' : 'JavaScript'}
- **Architecture**: ${data.structure}

## Technology Stack
**Styling**: ${data.styling}
${data.ui !== 'none' ? `**UI Library**: ${data.ui}` : ''}
${data.state !== 'none' ? `**State Management**: ${data.state}` : ''}
${data.routing !== 'none' ? `**Routing**: ${data.routing}` : ''}
${data.dataFetching !== 'none' ? `**Data Fetching**: ${data.dataFetching}` : ''}
${data.forms !== 'none' ? `**Forms**: ${data.forms}` : ''}

## Development Standards

### TypeScript Guidelines
- Enable strict mode
- No implicit any
- Explicit return types for functions
- Type all component props

### Component Guidelines
- Functional components only
- Use hooks for state and effects
- Keep components focused and small
- Extract reusable logic to custom hooks

### File Organization
Architecture: **${data.structure}**

${data.structure === 'feature-based' ? `
- Group related files by feature
- Each feature: components, hooks, utils
- Shared code in src/shared/
` : ''}

${data.structure === 'fsd' ? `
- Follow FSD layers strictly
- app → pages → widgets → features → entities → shared
- One-way dependencies only
` : ''}

${data.structure === 'simple' ? `
- src/components/ - All React components
- src/hooks/ - Custom hooks
- src/utils/ - Helper functions
- src/assets/ - Static files
` : ''}

### Styling Approach
${data.styling === 'tailwind' ? `
- Use Tailwind utility classes
- Avoid custom CSS when possible
- Use cn() for conditional classes
` : ''}

${data.styling === 'css-modules' ? `
- One CSS module per component
- Use BEM methodology
- Keep styles scoped
` : ''}

### Best Practices
1. **Type Safety**: Always use proper types
2. **Composition**: Build with small, reusable pieces
3. **Performance**: Lazy load and code split
4. **Accessibility**: Semantic HTML and ARIA labels
${data.hasTesting ? '5. **Testing**: Write tests for features' : ''}

## Common Commands
\`\`\`
npm run dev      → Start dev server
npm run build    → Production build
${data.hasTesting ? 'npm test        → Run tests' : ''}
npm run lint     → Lint code
\`\`\`

## AI Assistant Notes
- Maintain strict TypeScript typing
- Follow the ${data.structure} architecture
- Keep code clean and well-organized
- Write self-documenting code
- Ask before introducing new patterns
`;

const generateAiderConfig = (data: AIInstructionTemplateData): string => `# Aider configuration for ${data.projectName}

## Project Info
framework: ${data.framework}
language: ${data.variant.includes('ts') ? 'typescript' : 'javascript'}
architecture: ${data.structure}

## Key Technologies
styling: ${data.styling}
${data.ui !== 'none' ? `ui_library: ${data.ui}` : ''}
${data.state !== 'none' ? `state_management: ${data.state}` : ''}

## Code Standards
- Use TypeScript strict mode
- Functional components only
- Extract hooks for reusable logic
- Follow project structure pattern

## File Structure
${data.structure}

## Development Commands
dev: "npm run dev"
build: "npm run build"
${data.hasTesting ? 'test: "npm test"' : ''}
`;

const generateClaudeInstructions = (data: AIInstructionTemplateData): string =>
  generateComprehensiveTemplate(data, 'Claude Development Instructions');

const generateGeminiInstructions = (data: AIInstructionTemplateData): string =>
  generateComprehensiveTemplate(data, 'Gemini Development Instructions');

const generateCodexInstructions = (data: AIInstructionTemplateData): string =>
  generateComprehensiveTemplate(data, 'OpenAI Codex Instructions');

const generateUniversalInstructions = (data: AIInstructionTemplateData): string =>
  generateComprehensiveTemplate(data, 'AI Development Instructions');

// Modular Cursor Rules
const generateReactRule = (data: AIInstructionTemplateData): string => `---
description: React & UI Best Practices
globs: ["**/*.tsx", "**/*.jsx"]
---
# React Best Practices

- Use functional components with hooks
- Prefer composition over prop drilling
- Usage of ${data.styling} for styling
${data.ui !== 'none' ? `- Use ${data.ui} components` : ''}
- Implement error boundaries
- Use React.memo/useMemo/useCallback appropriately
`;

const generateTSRule = (_data: AIInstructionTemplateData): string => `---
description: TypeScript & Code Quality
globs: ["**/*.ts", "**/*.tsx"]
---
# TypeScript Guidelines

- No \`any\` types - use \`unknown\` if needed
- Explicit return types for exported functions
- Use interfaces for object definitions
- Strict null checks enabled
`;

const generateGeneralRule = (data: AIInstructionTemplateData): string => `---
description: General Project Context & Architecture
globs: ["*"]
---
# Project Context

## Stack
- Framework: ${data.framework}
- Language: ${data.variant}
- Structure: ${data.structure}

## Architecture
${data.structure === 'feature-based' ? 'Feature-based: src/features/[feature]' : ''}
${data.structure === 'fsd' ? 'FSD Layers: app/pages/widgets/features/entities/shared' : ''}
${data.structure === 'simple' ? 'Simple: components/hooks/utils' : ''}
`;

export const aiInstructionsConfigurator = async ({ projectPath, selections }: ConfiguratorContext) => {
  const aiInstructions = (selections.aiInstructions as string[]) || [];

  const data: AIInstructionTemplateData = {
    projectName: selections.projectName || path.basename(projectPath),
    framework: selections.framework,
    variant: selections.variant,
    styling: selections.styling,
    ui: selections.ui || 'none',
    forms: selections.forms || 'none',
    state: selections.state || 'none',
    routing: selections.routing || 'none',
    dataFetching: selections.dataFetching || 'none',
    structure: selections.structure || 'feature-based',
    icons: selections.icons || 'none',

    hasTesting: selections.testing !== undefined && selections.testing !== 'none',
    language: 'en', // Default to English for now
  };

  // Always generate .nexo/ai-context.md as the single source of truth
  const nexoDir = path.join(projectPath, '.nexo');
  await ensureDir(nexoDir);
  await writeFile(
    path.join(nexoDir, 'ai-context.md'),
    generateComprehensiveTemplate(data, 'Project Context')
  );

  if (aiInstructions.length === 0) return;

  const writers: Record<string, {
    file?: string;
    generate?: (d: AIInstructionTemplateData) => string;
    isModular?: boolean;
    generators?: Record<string, (d: AIInstructionTemplateData) => string>;
  }> = {
    cursor: { file: '.cursorrules', generate: generateCursorRules },
    'cursor-modular': {
      isModular: true,
      generators: {
        '.cursor/rules/react.mdc': generateReactRule,
        '.cursor/rules/typescript.mdc': generateTSRule,
        '.cursor/rules/general.mdc': generateGeneralRule,
      }
    },
    windsurf: { file: '.windsurfrules', generate: generateWindsurfRules },
    cline: { file: '.clinerules', generate: generateClineRules },
    'roo-cline': { file: '.roo-clinerules', generate: generateRooClineRules },
    aider: { file: '.aider.conf.yml', generate: generateAiderConfig },
    claude: { file: 'CLAUDE_INSTRUCTIONS.md', generate: generateClaudeInstructions },
    gemini: { file: 'GEMINI_INSTRUCTIONS.md', generate: generateGeminiInstructions },
    codex: { file: 'CODEX_INSTRUCTIONS.md', generate: generateCodexInstructions },
    universal: { file: 'AI_INSTRUCTIONS.md', generate: generateUniversalInstructions },
  };

  for (const tool of aiInstructions) {
    const writer = writers[tool];
    if (writer) {
      if (writer.isModular && writer.generators) {
        for (const [filePath, generator] of Object.entries(writer.generators)) {
          await ensureDir(path.dirname(path.join(projectPath, filePath)));
          await writeFile(
            path.join(projectPath, filePath),
            generator(data)
          );
        }
      } else if (writer.file && writer.generate) {
        await writeFile(
          path.join(projectPath, writer.file),
          writer.generate(data)
        );
      }
    }
  }
};
