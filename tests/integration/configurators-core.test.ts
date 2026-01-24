import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { frameworkConfigurator } from '../../src/configurators/core/framework';
import { languageConfigurator } from '../../src/configurators/core/language';
import { variantConfigurator } from '../../src/configurators/core/variant';
import { ConfiguratorContext } from '../../src/types';
import { pathExists, readJson, writeJson } from '../../src/utils/fs';

describe('Core Configurators', () => {
  let testDir: string;
  let pkg: any;
  let ctx: ConfiguratorContext;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `nexo-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });

    // Create initial package.json
    await writeJson(path.join(testDir, 'package.json'), {
      name: 'test-project',
      version: '1.0.0',
      dependencies: {},
      devDependencies: {},
      scripts: {},
    });

    // Initialize PackageManager
    const { PackageManager } = await import('../../src/utils/package-manager');
    pkg = new PackageManager(testDir);

    ctx = {
      projectPath: testDir,
      selections: {
        projectName: 'test-project',
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
      },
      pkg,
    };

    await pkg.load(ctx);
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('frameworkConfigurator', () => {
    it('should create package.json with React dependencies', async () => {
      await frameworkConfigurator(ctx);
      await ctx.pkg.save();

      const pkg = await readJson<{ dependencies: Record<string, string> }>(path.join(testDir, 'package.json'));
      expect(pkg.dependencies.react).toBeDefined();
      expect(pkg.dependencies['react-dom']).toBeDefined();
    });

    it('should use SWC plugin when variant includes swc', async () => {
      ctx.selections.variant = 'ts-swc';
      await frameworkConfigurator(ctx);
      await ctx.pkg.save();

      const pkgFile = await readJson<{ devDependencies: Record<string, string> }>(path.join(testDir, 'package.json'));
      expect(pkgFile.devDependencies['@vitejs/plugin-react-swc']).toBeDefined();
    });

    it('should create vite.config.ts for TypeScript', async () => {
      ctx.selections.variant = 'ts';
      await frameworkConfigurator(ctx);
      expect(await pathExists(path.join(testDir, 'vite.config.ts'))).toBe(true);
    });

    it('should create vite.config.js for JavaScript', async () => {
      ctx.selections.variant = 'js';
      await frameworkConfigurator(ctx);
      expect(await pathExists(path.join(testDir, 'vite.config.js'))).toBe(true);
    });
  });

  describe('variantConfigurator', () => {
    it('should add React Compiler dependencies for compiler variant', async () => {
      ctx.selections.variant = 'ts-compiler';
      await variantConfigurator(ctx);
      await ctx.pkg.save();

      const pkgFile = await readJson<{ devDependencies: Record<string, string> }>(path.join(testDir, 'package.json'));
      expect(pkgFile.devDependencies['babel-plugin-react-compiler']).toBeDefined();
    });
  });

  describe('languageConfigurator', () => {
    it('should add TypeScript dependencies for ts variant', async () => {
      ctx.selections.variant = 'ts';
      await languageConfigurator(ctx);
      await ctx.pkg.save();

      const pkgFile = await readJson<{ devDependencies: Record<string, string> }>(path.join(testDir, 'package.json'));
      expect(pkgFile.devDependencies.typescript).toBeDefined();
    });

    it('should create tsconfig.json for TypeScript', async () => {
      ctx.selections.variant = 'ts';
      await languageConfigurator(ctx);
      expect(await pathExists(path.join(testDir, 'tsconfig.json'))).toBe(true);
    });
  });
});
