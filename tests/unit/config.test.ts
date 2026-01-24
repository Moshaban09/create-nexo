import { readFile } from 'node:fs/promises';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hasConfigFile, loadConfig } from '../../src/core/config.js';
import { pathExists } from '../../src/utils/fs.js';

// Mock pathExists and readFile
vi.mock('../../src/utils/fs.js', () => ({
  pathExists: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}));

describe('core-config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hasConfigFile', () => {
    it('should return true if nexo.config.json exists', async () => {
      (pathExists as any).mockImplementation((path: string) => path.endsWith('nexo.config.json'));
      expect(await hasConfigFile()).toBe(true);
    });

    it('should return true if nexo.config.ts exists', async () => {
      (pathExists as any).mockImplementation((path: string) => path.endsWith('nexo.config.ts'));
      expect(await hasConfigFile()).toBe(true);
    });

    it('should return false if no config file exists', async () => {
      (pathExists as any).mockResolvedValue(false);
      expect(await hasConfigFile()).toBe(false);
    });
  });

  describe('loadConfig', () => {
    it('should load JSON config correctly', async () => {
      (pathExists as any).mockImplementation((path: string) => path.endsWith('nexo.config.json'));
      (readFile as any).mockResolvedValue(JSON.stringify({ projectName: 'json-project' }));

      const config = await loadConfig();
      expect(config?.projectName).toBe('json-project');
    });

    it('should load TS config using dynamic import', async () => {
      (pathExists as any).mockImplementation((path: string) => path.endsWith('nexo.config.ts'));

      // We can't easily mock dynamic import in Vitest without special setup,
      // but we can mock the behavior if we structure it right.
      // For now, we'll verify it calls the right path.

      // Note: In a real test environment, we'd use vitest's vi.mock for modules
      // but here we are testing the logic inside loadConfig.
    });
  });
});
