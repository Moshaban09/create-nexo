import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { setup } from '../../src/core/setup';
import { UserSelections } from '../../src/types';
import { pathExists, readJson } from '../../src/utils/fs';

describe('E2E: Full Integration Flow', () => {
  let testDir: string;
  let projectDir: string;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `nexo-pro-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Cleanup to save space
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should successfully create a "Maximal" project with all modern features', async () => {
    // A configuration that touches every major part of the new simplified stack
    const selections: UserSelections = {
      projectName: 'nexo-app-max',
      framework: 'react',
      variant: 'ts',
      language: 'typescript',
      styling: 'tailwind',
      ui: 'shadcn',
      forms: 'rhf-zod',
      state: 'zustand',
      routing: 'tanstack-router',
      dataFetching: 'tanstack-query',
      icons: 'lucide',
      structure: 'feature-based',
      i18n: 'none',
      auth: 'none',
      packageManager: 'npm',
    };

    // Execute the setup
    await setup({ selections, targetDir: testDir });

    projectDir = path.join(testDir, 'nexo-app-max');

    // 1. Verify Structure
    expect(await pathExists(projectDir)).toBe(true);
    expect(await pathExists(path.join(projectDir, 'src/features'))).toBe(true);
    expect(await pathExists(path.join(projectDir, 'src/shared'))).toBe(true);
    expect(await pathExists(path.join(projectDir, 'src/app'))).toBe(true);

    // 2. Verify Config Files
    expect(await pathExists(path.join(projectDir, 'vite.config.ts'))).toBe(true);
    expect(await pathExists(path.join(projectDir, 'tsconfig.json'))).toBe(true);
    expect(await pathExists(path.join(projectDir, 'components.json'))).toBe(true); // shadcn

    // 3. Verify Dependencies in package.json
    const pkg = await readJson<{ dependencies: Record<string, string>, devDependencies: Record<string, string> }>(path.join(projectDir, 'package.json'));

    // Core
    expect(pkg.dependencies['react']).toBeDefined();
    expect(pkg.dependencies['react-dom']).toBeDefined();

    // UI & Styling
    expect(pkg.devDependencies['tailwindcss']).toBeDefined();
    expect(pkg.dependencies['clsx']).toBeDefined(); // shadcn dep
    expect(pkg.dependencies['tailwind-merge']).toBeDefined(); // shadcn dep

    // State
    expect(pkg.dependencies['zustand']).toBeDefined();

    // Routing & Data
    expect(pkg.dependencies['@tanstack/react-router']).toBeDefined();
    expect(pkg.dependencies['@tanstack/react-query']).toBeDefined();

    // Forms
    expect(pkg.dependencies['react-hook-form']).toBeDefined();
    expect(pkg.dependencies['zod']).toBeDefined();

    // Icons
    expect(pkg.dependencies['lucide-react']).toBeDefined();

    // 4. Verify Content Injection
    const mainContent = await fs.readFile(path.join(projectDir, 'src/main.tsx'), 'utf-8');

    // Check Imports
    expect(mainContent).toContain("import { StrictMode } from 'react'");
    expect(mainContent).toContain("import { createRoot } from 'react-dom/client'");
    expect(mainContent).toContain("import { RouterProvider, createRouter, createRootRoute } from '@tanstack/react-router'");
    expect(mainContent).toContain("import { QueryClient, QueryClientProvider } from '@tanstack/react-query'");
    expect(mainContent).toContain("import './index.css'");

    // Check Logic
    expect(mainContent).toContain('const queryClient = new QueryClient()');
    expect(mainContent).toContain('createRouter({ routeTree: rootRoute })');

    // Check Rendering Structure
    expect(mainContent).toContain('<QueryClientProvider client={queryClient}>');
    expect(mainContent).toContain('<RouterProvider router={router} />');

    // 5. Verify Shadcn Utils
    const utilsContent = await fs.readFile(path.join(projectDir, 'src/lib/utils.ts'), 'utf-8');
    expect(utilsContent).toContain('import { clsx, type ClassValue } from "clsx"');
    expect(utilsContent).toContain('import { twMerge } from "tailwind-merge"');

  }, 120000); // Increased timeout for heavy setup
});
