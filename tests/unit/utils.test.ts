import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ConfiguratorContext } from '../../src/types';
import {
    addDependency,
    addScript,
    ensureDir,
    getPackageJson,
    pathExists,
    readJson,
    writeJson
} from '../../src/utils/fs';

describe('File System Utilities', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `nexo-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('pathExists', () => {
    it('should return true for existing path', async () => {
      expect(await pathExists(testDir)).toBe(true);
    });

    it('should return false for non-existing path', async () => {
      expect(await pathExists(path.join(testDir, 'nonexistent'))).toBe(false);
    });
  });

  describe('ensureDir', () => {
    it('should create directory if not exists', async () => {
      const newDir = path.join(testDir, 'new', 'nested', 'dir');
      await ensureDir(newDir);
      expect(await pathExists(newDir)).toBe(true);
    });
  });

  describe('writeFile and readJson', () => {
    it('should write and read JSON', async () => {
      const filePath = path.join(testDir, 'test.json');
      const data = { key: 'value' };
      await writeJson(filePath, data);
      const result = await readJson(filePath);
      expect(result).toEqual(data);
    });
  });

  describe('getPackageJson', () => {
    it('should return existing package.json', async () => {
      const ctx: ConfiguratorContext = {
        projectPath: testDir,
        selections: { projectName: 'test', framework: 'react', variant: 'ts', styling: 'tailwind', ui: 'none', forms: 'none', state: 'none', routing: 'none', dataFetching: 'none', icons: 'none', structure: 'simple' },
      };

      await writeJson(path.join(testDir, 'package.json'), { name: 'existing', version: '1.0.0' });
      const pkg = await getPackageJson(ctx);
      expect(pkg.name).toBe('existing');
    });

    it('should create new package.json if not exists', async () => {
      const ctx: ConfiguratorContext = {
        projectPath: path.join(testDir, 'new-project'),
        selections: { projectName: 'new-project', framework: 'react', variant: 'ts', styling: 'tailwind', ui: 'none', forms: 'none', state: 'none', routing: 'none', dataFetching: 'none', icons: 'none', structure: 'simple' },
      };

      const pkg = await getPackageJson(ctx);
      expect(pkg.name).toBe('new-project');
    });
  });

  describe('addDependency', () => {
    it('should add regular dependency', () => {
      const pkg = { name: 'test', version: '1.0.0', dependencies: {}, devDependencies: {} };
      addDependency(pkg, 'react', '^18.0.0');
      expect(pkg.dependencies.react).toBe('^18.0.0');
    });

    it('should add dev dependency', () => {
      const pkg = { name: 'test', version: '1.0.0', dependencies: {}, devDependencies: {} };
      addDependency(pkg, 'typescript', '^5.0.0', true);
      expect(pkg.devDependencies.typescript).toBe('^5.0.0');
    });
  });

  describe('addScript', () => {
    it('should add script', () => {
      const pkg = { name: 'test', version: '1.0.0', scripts: {} };
      addScript(pkg, 'dev', 'vite');
      expect(pkg.scripts.dev).toBe('vite');
    });
  });
});
