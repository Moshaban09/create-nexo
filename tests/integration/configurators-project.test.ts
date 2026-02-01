import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { mandatoryConfigurator } from '../../src/configurators/project/mandatory';
import { structureConfigurator } from '../../src/configurators/project/structure';
import { ConfiguratorContext } from '../../src/types';
import { pathExists, writeJson } from '../../src/utils/fs';

describe('Project Configurators', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `nexo-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    await writeJson(path.join(testDir, 'package.json'), {
      name: 'test-project',
      version: '1.0.0',
      dependencies: {},
      devDependencies: {},
      scripts: {},
    });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('structureConfigurator', () => {
    it('should create feature-based structure', async () => {
      const ctx: ConfiguratorContext = {
        projectPath: testDir,
        selections: {
          projectName: 'test-project', framework: 'react', variant: 'ts', language: 'typescript',
          styling: 'tailwind', ui: 'none', forms: 'none', state: 'none',
          routing: 'none', dataFetching: 'none', icons: 'none',
          structure: 'feature-based',
        },
      };

      await structureConfigurator(ctx);

      expect(await pathExists(path.join(testDir, 'src/features'))).toBe(true);
      expect(await pathExists(path.join(testDir, 'src/shared'))).toBe(true);
    });




  });



  describe('mandatoryConfigurator', () => {
    it('should NOT create LICENSE file', async () => {
      const ctx: ConfiguratorContext = {
        projectPath: testDir,
        selections: {
          projectName: 'test-project', framework: 'react', variant: 'ts', language: 'typescript',
          styling: 'tailwind', ui: 'none', forms: 'none', state: 'none',
          routing: 'none', dataFetching: 'none', icons: 'none',
          structure: 'simple',
        },
      };

      await mandatoryConfigurator(ctx);

      expect(await pathExists(path.join(testDir, 'LICENSE'))).toBe(false);
    });

    it('should create .gitignore file', async () => {
      const ctx: ConfiguratorContext = {
        projectPath: testDir,
        selections: {
          projectName: 'test-project', framework: 'react', variant: 'ts', language: 'typescript',
          styling: 'tailwind', ui: 'none', forms: 'none', state: 'none',
          routing: 'none', dataFetching: 'none', icons: 'none',
          structure: 'simple',
        },
      };

      await mandatoryConfigurator(ctx);

      expect(await pathExists(path.join(testDir, '.gitignore'))).toBe(true);
    });

    it('should NOT create CI workflow', async () => {
      const ctx: ConfiguratorContext = {
        projectPath: testDir,
        selections: {
          projectName: 'test-project', framework: 'react', variant: 'ts', language: 'typescript',
          styling: 'tailwind', ui: 'none', forms: 'none', state: 'none',
          routing: 'none', dataFetching: 'none', icons: 'none',
          structure: 'simple',
        },
      };

      await mandatoryConfigurator(ctx);

      expect(await pathExists(path.join(testDir, '.github/workflows/ci.yml'))).toBe(false);
    });
  });
});
