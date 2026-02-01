import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { dataFetchingConfigurator } from '../../src/configurators/state/dataFetching';
import { formsConfigurator } from '../../src/configurators/state/forms';
import { routingConfigurator } from '../../src/configurators/state/routing';
import { stateConfigurator } from '../../src/configurators/state/state';
import { ConfiguratorContext } from '../../src/types';
import { readJson, writeJson } from '../../src/utils/fs';

describe('State Configurators', () => {
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

  describe('formsConfigurator', () => {
    it('should add React Hook Form + Zod dependencies', async () => {
      ctx.selections.forms = 'rhf-zod';
      await formsConfigurator(ctx);
      await ctx.pkg.save();

      const pkgFile = await readJson<{ dependencies: Record<string, string> }>(path.join(testDir, 'package.json'));
      expect(pkgFile.dependencies['react-hook-form']).toBeDefined();
      expect(pkgFile.dependencies.zod).toBeDefined();
    });

    it('should do nothing for none', async () => {
      ctx.selections.forms = 'none';
      await formsConfigurator(ctx);
      await ctx.pkg.save();

      const pkgFile = await readJson<{ dependencies: Record<string, string> }>(path.join(testDir, 'package.json'));
      expect(pkgFile.dependencies['react-hook-form']).toBeUndefined();
    });
  });

  describe('stateConfigurator', () => {
    it('should add Zustand dependency', async () => {
      ctx.selections.state = 'zustand';
      await stateConfigurator(ctx);
      await ctx.pkg.save();

      const pkgFile = await readJson<{ dependencies: Record<string, string> }>(path.join(testDir, 'package.json'));
      expect(pkgFile.dependencies.zustand).toBeDefined();
    });
  });

  describe('routingConfigurator', () => {
    it('should add React Router dependency', async () => {
      ctx.selections.routing = 'react-router';
      await routingConfigurator(ctx);
      await ctx.pkg.save();

      const pkgFile = await readJson<{ dependencies: Record<string, string> }>(path.join(testDir, 'package.json'));
      expect(pkgFile.dependencies['react-router-dom']).toBeDefined();
    });
  });

  describe('dataFetchingConfigurator', () => {
    it('should add TanStack Query dependency', async () => {
      ctx.selections.dataFetching = 'tanstack-query';
      await dataFetchingConfigurator(ctx);
      await ctx.pkg.save();

      const pkgFile = await readJson<{ dependencies: Record<string, string> }>(path.join(testDir, 'package.json'));
      expect(pkgFile.dependencies['@tanstack/react-query']).toBeDefined();
    });

    it('should add Axios dependency', async () => {
      ctx.selections.dataFetching = 'axios';
      await dataFetchingConfigurator(ctx);
      await ctx.pkg.save();

      const pkgFile = await readJson<{ dependencies: Record<string, string> }>(path.join(testDir, 'package.json'));
      expect(pkgFile.dependencies.axios).toBeDefined();
    });
  });

  describe('backendConfigurator', () => {
    let backendConfigurator: typeof import('../../src/configurators/state/backend').backendConfigurator;

    beforeEach(async () => {
      const backendModule = await import('../../src/configurators/state/backend');
      backendConfigurator = backendModule.backendConfigurator;
    });

    it('should add Supabase dependency and create client file', async () => {
      ctx.selections.backend = 'supabase';
      await backendConfigurator(ctx);
      await ctx.pkg.save();

      const pkgFile = await readJson<{ dependencies: Record<string, string> }>(path.join(testDir, 'package.json'));
      expect(pkgFile.dependencies['@supabase/supabase-js']).toBeDefined();

      // Check client file was created
      const clientFile = path.join(testDir, 'src/lib/supabase.ts');
      const clientExists = await fs.access(clientFile).then(() => true).catch(() => false);
      expect(clientExists).toBe(true);
    });

    it('should add Firebase dependency and create client file', async () => {
      ctx.selections.backend = 'firebase';
      await backendConfigurator(ctx);
      await ctx.pkg.save();

      const pkgFile = await readJson<{ dependencies: Record<string, string> }>(path.join(testDir, 'package.json'));
      expect(pkgFile.dependencies.firebase).toBeDefined();

      // Check client file was created
      const clientFile = path.join(testDir, 'src/lib/firebase.ts');
      const clientExists = await fs.access(clientFile).then(() => true).catch(() => false);
      expect(clientExists).toBe(true);
    });

    it('should add Clerk dependency and create provider file', async () => {
      ctx.selections.backend = 'clerk';
      await backendConfigurator(ctx);
      await ctx.pkg.save();

      const pkgFile = await readJson<{ dependencies: Record<string, string> }>(path.join(testDir, 'package.json'));
      expect(pkgFile.dependencies['@clerk/clerk-react']).toBeDefined();

      // Check provider file was created
      const providerFile = path.join(testDir, 'src/providers/clerk.tsx');
      const providerExists = await fs.access(providerFile).then(() => true).catch(() => false);
      expect(providerExists).toBe(true);
    });

    it('should add Prisma dependency and create schema file', async () => {
      ctx.selections.backend = 'prisma';
      await backendConfigurator(ctx);
      await ctx.pkg.save();

      const pkgFile = await readJson<{ dependencies: Record<string, string> }>(path.join(testDir, 'package.json'));
      expect(pkgFile.dependencies['@prisma/client']).toBeDefined();

      // Check schema file was created
      const schemaFile = path.join(testDir, 'prisma/schema.prisma');
      const schemaExists = await fs.access(schemaFile).then(() => true).catch(() => false);
      expect(schemaExists).toBe(true);
    });

    it('should do nothing for none backend selection', async () => {
      ctx.selections.backend = 'none';
      await backendConfigurator(ctx);
      await ctx.pkg.save();

      const pkgFile = await readJson<{ dependencies: Record<string, string> }>(path.join(testDir, 'package.json'));
      expect(pkgFile.dependencies['@supabase/supabase-js']).toBeUndefined();
      expect(pkgFile.dependencies.firebase).toBeUndefined();
    });

    it('should create .env.example file', async () => {
      ctx.selections.backend = 'supabase';
      await backendConfigurator(ctx);

      const envFile = path.join(testDir, '.env.example');
      const envExists = await fs.access(envFile).then(() => true).catch(() => false);
      expect(envExists).toBe(true);

      const content = await fs.readFile(envFile, 'utf-8');
      expect(content).toContain('VITE_SUPABASE_URL');
      expect(content).toContain('VITE_SUPABASE_ANON_KEY');
    });
  });
});
