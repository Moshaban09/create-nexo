import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { setup } from '../../src/core/setup';
import { UserSelections } from '../../src/types';
import { pathExists, readJson } from '../../src/utils/fs';

describe('E2E: Full Project Setup', () => {
  let testDir: string;
  let projectDir: string;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `nexo-e2e-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should create a complete React + TypeScript project', async () => {
    const selections: UserSelections = {
      projectName: 'my-react-app',
      framework: 'react',
      variant: 'ts',
      language: 'typescript',
      styling: 'tailwind',
      ui: 'shadcn',
      forms: 'rhf-zod',
      state: 'zustand',
      routing: 'react-router',
      dataFetching: 'tanstack-query',
      icons: 'lucide',
      structure: 'feature-based',
      i18n: 'i18next',
      auth: 'jwt',
    };

    await setup({ selections, targetDir: testDir });

    projectDir = path.join(testDir, 'my-react-app');

    expect(await pathExists(path.join(projectDir, 'package.json'))).toBe(true);
    expect(await pathExists(path.join(projectDir, 'index.html'))).toBe(true);
    expect(await pathExists(path.join(projectDir, 'vite.config.ts'))).toBe(true);
    expect(await pathExists(path.join(projectDir, 'tsconfig.json'))).toBe(true);

    const pkg = await readJson<{ dependencies: Record<string, string> }>(path.join(projectDir, 'package.json'));
    expect(pkg.dependencies.react).toBeDefined();
    expect(pkg.dependencies.zustand).toBeDefined();

    expect(await pathExists(path.join(projectDir, 'src/features'))).toBe(true);
    const mainContent = await fs.readFile(path.join(projectDir, 'src/main.tsx'), 'utf-8');
    expect(mainContent).toContain('<RouterProvider router={router} />');
    expect(mainContent).toContain('<QueryClientProvider client={queryClient}>');

    expect(await pathExists(path.join(projectDir, 'LICENSE'))).toBe(false);
  }, 60000);

  it('should create a project with SWC variant', async () => {
    const selections: UserSelections = {
      projectName: 'swc-app',
      framework: 'react',
      variant: 'ts-swc',
      language: 'typescript',
      styling: 'sass',
      ui: 'none',
      forms: 'none',
      state: 'none',
      routing: 'none',
      dataFetching: 'none',
      icons: 'none',
      structure: 'simple',
      i18n: 'none',
      auth: 'none',
    };

    await setup({ selections, targetDir: testDir });

    projectDir = path.join(testDir, 'swc-app');

    const pkg = await readJson<{ devDependencies: Record<string, string> }>(path.join(projectDir, 'package.json'));
    expect(pkg.devDependencies['@vitejs/plugin-react-swc']).toBeDefined();
    expect(pkg.devDependencies.sass).toBeDefined();
  }, 60000);

  it('should create a JavaScript project', async () => {
    const selections: UserSelections = {
      projectName: 'my-js-app',
      framework: 'react',
      variant: 'js',
      language: 'javascript',
      styling: 'css-modules',
      ui: 'none',
      forms: 'none',
      state: 'none',
      routing: 'react-router',
      dataFetching: 'axios',
      icons: 'none',
      structure: 'simple',
      i18n: 'none',
      auth: 'none',
    };

    await setup({ selections, targetDir: testDir });

    projectDir = path.join(testDir, 'my-js-app');

    expect(await pathExists(path.join(projectDir, 'vite.config.js'))).toBe(true);
    expect(await pathExists(path.join(projectDir, 'tsconfig.json'))).toBe(false);
    expect(await pathExists(path.join(projectDir, 'eslint.config.js'))).toBe(true);
    expect(await pathExists(path.join(projectDir, 'src/main.jsx'))).toBe(true);
  }, 60000);

  it('should create FSD structure', async () => {
    const selections: UserSelections = {
      projectName: 'fsd-app',
      framework: 'react',
      variant: 'ts',
      language: 'typescript',
      styling: 'tailwind',
      ui: 'none',
      forms: 'none',
      state: 'none',
      routing: 'none',
      dataFetching: 'none',
      icons: 'none',
      structure: 'fsd',
      i18n: 'none',
      auth: 'none',
    };

    await setup({ selections, targetDir: testDir });

    projectDir = path.join(testDir, 'fsd-app');

    expect(await pathExists(path.join(projectDir, 'src/pages'))).toBe(true);
    expect(await pathExists(path.join(projectDir, 'src/widgets'))).toBe(true);
    expect(await pathExists(path.join(projectDir, 'src/entities'))).toBe(true);
  }, 60000);
  it('should create AI instructions', async () => {
    const selections: UserSelections = {
      projectName: 'ai-app',
      framework: 'react',
      variant: 'ts',
      language: 'typescript',
      styling: 'tailwind',
      ui: 'none',
      forms: 'none',
      state: 'none',
      routing: 'none',
      dataFetching: 'none',
      icons: 'none',
      structure: 'simple',
      i18n: 'none',
      auth: 'none',
      aiInstructions: ['universal', 'cursor'],
    };

    await setup({ selections, targetDir: testDir });

    projectDir = path.join(testDir, 'ai-app');

    expect(await pathExists(path.join(projectDir, '.nexo/ai-context.md'))).toBe(true);
    expect(await pathExists(path.join(projectDir, 'AI_INSTRUCTIONS.md'))).toBe(true);
    expect(await pathExists(path.join(projectDir, '.cursorrules'))).toBe(true);
  });
});
