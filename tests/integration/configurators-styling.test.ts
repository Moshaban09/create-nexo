import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { stylingConfigurator } from '../../src/configurators/styling/styling';
import { ConfiguratorContext } from '../../src/types';
import { pathExists, readJson, writeJson } from '../../src/utils/fs';

describe('Styling Configurators', () => {
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
        ui: 'none',
        forms: 'none',
        state: 'none',
        routing: 'none',
        dataFetching: 'none',
        icons: 'none',
        structure: 'simple',
      },
      pkg,
    };

    await pkg.load(ctx);
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('stylingConfigurator', () => {
    it('should add Tailwind dependencies', async () => {
      ctx.selections.styling = 'tailwind';
      await stylingConfigurator(ctx);
      await ctx.pkg.save();

      const pkgFile = await readJson<{ devDependencies: Record<string, string> }>(path.join(testDir, 'package.json'));
      expect(pkgFile.devDependencies.tailwindcss).toBeDefined();
    });

    it('should configure Tailwind v4 correctly', async () => {
      ctx.selections.styling = 'tailwind';
      await stylingConfigurator(ctx);
      await ctx.pkg.save();

      // Check for index.css with tailwind import
      const cssContent = await fs.readFile(path.join(testDir, 'src/index.css'), 'utf-8');
      expect(cssContent).toContain('@import "tailwindcss";');

      // Check for vite config update
      const viteConfig = await fs.readFile(path.join(testDir, 'vite.config.ts'), 'utf-8');
      expect(viteConfig).toContain('tailwindcss()');
    });

    it('should add Sass dependencies for sass styling', async () => {
      ctx.selections.styling = 'sass';
      await stylingConfigurator(ctx);
      await ctx.pkg.save();

      const pkgFile = await readJson<{ devDependencies: Record<string, string> }>(path.join(testDir, 'package.json'));
      expect(pkgFile.devDependencies.sass).toBeDefined();
    });

    it('should create SCSS files for sass styling', async () => {
      ctx.selections.styling = 'sass';
      await stylingConfigurator(ctx);
      await ctx.pkg.save();

      expect(await pathExists(path.join(testDir, 'src/index.scss'))).toBe(true);
      expect(await pathExists(path.join(testDir, 'src/styles/_variables.scss'))).toBe(true);
    });


  });
});
