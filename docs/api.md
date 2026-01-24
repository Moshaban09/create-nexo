# NEXO CLI - API Documentation

## Programmatic API

NEXO provides a programmatic API for creating projects without the interactive CLI.

### Installation

```bash
npm install nexo-cli
```

### Basic Usage

```typescript
import { nexo } from 'nexo-cli';

// Create a new project
const result = await nexo.create({
  projectName: 'my-app',
  targetDir: './projects',
  selections: {
    variant: 'ts',
    styling: 'tailwind',
    ui: 'shadcn',
    forms: 'rhf-zod',
    state: 'zustand',
    routing: 'react-router',
    dataFetching: 'tanstack-query',
    icons: 'lucide',
    structure: 'feature-based',
    i18n: 'none',
    auth: 'none',
  },
  silent: true, // No console output
});
```

### API Reference

#### `nexo.create(options)`

Creates a new project with the specified configuration.

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `projectName` | `string` | Yes | Name of the project |
| `targetDir` | `string` | No | Target directory (default: current directory) |
| `selections` | `UserSelections` | Yes | Configuration options |
| `silent` | `boolean` | No | Suppress console output |
| `dryRun` | `boolean` | No | Preview only, don't create files |
| `parallel` | `boolean` | No | Use parallel execution |
| `cicd` | `boolean` | No | Include GitHub Actions workflow |

**Returns:** `Promise<CreateResult>`

---

#### `nexo.validate(selections)`

Validates the user selections for compatibility.

```typescript
const validation = nexo.validate({
  ui: 'shadcn',
  styling: 'sass', // Error: shadcn requires tailwind
});

if (!validation.valid) {
  console.log(validation.errors);
}
```

**Returns:** `ValidationResult`

---

#### `nexo.preview(options)`

Preview what files would be created without actually creating them.

```typescript
const preview = await nexo.preview({
  selections: { variant: 'ts', styling: 'tailwind' },
});

console.log(preview.fileTree);
console.log(preview.dependencies);
```

---

### UserSelections Interface

```typescript
interface UserSelections {
  projectName: string;
  framework: string;      // 'react' (default)
  variant: string;        // 'ts' | 'ts-compiler' | 'ts-swc' | 'js'
  language: string;       // 'typescript' | 'javascript'
  styling: string;        // 'tailwind' | 'css-modules' | 'sass'
  ui: string;             // 'shadcn' | 'radix' | 'mantine' | 'heroui' | 'none'
  forms: string;          // 'rhf-zod' | 'rhf-yup' | 'formik-zod' | 'none'
  state: string;          // 'zustand' | 'redux' | 'jotai' | 'none'
  routing: string;        // 'react-router' | 'tanstack-router' | 'none'
  dataFetching: string;   // 'tanstack-query' | 'axios' | 'fetch' | 'none'
  icons: string;          // 'lucide' | 'heroicons' | 'fontawesome' | 'none'
  structure: string;      // 'feature-based' | 'fsd' | 'atomic' | 'clean' | 'simple'
  i18n: string;           // 'i18next' | 'lingui' | 'none'
  auth: string;           // 'jwt' | 'authjs' | 'none'
}
```

---

## Generators

Generate components, hooks, pages and features inside an existing project.

```typescript
import { generateComponent, generateHook, generatePage, generateFeature } from 'nexo-cli';

// Generate a component
await generateComponent({
  name: 'Button',
  directory: './src/components',
  withTests: true,
  withStyles: true,
});

// Generate a hook
await generateHook({
  name: 'useAuth',
  directory: './src/hooks',
});

// Generate a feature (FSD style)
await generateFeature({
  name: 'auth',
  directory: './src/features',
});
```

---

## Plugins

Extend NEXO with custom plugins.

```typescript
import { definePlugin } from 'nexo-cli';

export default definePlugin({
  name: 'nexo-plugin-sentry',
  version: '1.0.0',

  beforeSetup: async (ctx) => {
    console.log('Before setup');
  },

  afterSetup: async (ctx) => {
    // Add Sentry configuration
  },

  configurators: {
    'sentry': async (ctx) => {
      // Custom configurator
    },
  },
});
```

### Configuration File

Create `.nexorc.json` in your project root:

```json
{
  "plugins": [
    "nexo-plugin-sentry",
    "./my-local-plugin.js"
  ],
  "defaults": {
    "styling": "tailwind",
    "ui": "shadcn"
  }
}
```
