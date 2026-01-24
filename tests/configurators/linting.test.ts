/**
 * Linting Configurator Integration Tests
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConfiguratorContext } from '../../src/types/index.js';

// Use vi.hoisted to ensure mocks are available before vi.mock
const { mockGetPackageJson, mockSavePackageJson, mockAddDependency } = vi.hoisted(() => ({
  mockGetPackageJson: vi.fn(() => ({
    name: 'test-project',
    version: '1.0.0',
    scripts: {},
    dependencies: {},
    devDependencies: {},
  })),
  mockSavePackageJson: vi.fn(),
  mockAddDependency: vi.fn(),
}));

vi.mock('../../src/utils/index.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/utils/index.js')>();
  return {
    ...actual,
    getPackageJson: mockGetPackageJson,
    savePackageJson: mockSavePackageJson,
    addDependency: mockAddDependency,
  };
});

import { lintingConfigurator } from '../../src/configurators/project/linting.js';

describe('Linting Configurator', () => {
  let ctx: ConfiguratorContext;
  let mockPkg: { add: any; addScript: any; save: any };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPkg = {
      add: vi.fn(),
      addScript: vi.fn(),
      save: vi.fn(),
    };
    ctx = {
      projectPath: '/test/project',
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
      pkg: mockPkg as any,
    };
  });

  it('should do nothing when linting is not selected', async () => {
    ctx.selections.linting = undefined;
    await lintingConfigurator(ctx);
    expect(mockPkg.add).not.toHaveBeenCalled();
  });

  it('should do nothing when linting is "none"', async () => {
    ctx.selections.linting = 'none';
    await lintingConfigurator(ctx);
    expect(mockPkg.add).not.toHaveBeenCalled();
  });

  it('should add ESLint + Prettier dependencies when eslint-prettier is selected', async () => {
    ctx.selections.linting = 'eslint-prettier';
    await lintingConfigurator(ctx);

    expect(mockPkg.add).toHaveBeenCalledWith(
      'eslint',
      expect.any(String),
      true
    );
    expect(mockPkg.add).toHaveBeenCalledWith(
      'prettier',
      expect.any(String),
      true
    );
  });

  it('should add Biome dependency when biome is selected', async () => {
    ctx.selections.linting = 'biome';
    await lintingConfigurator(ctx);

    expect(mockPkg.add).toHaveBeenCalledWith(
      '@biomejs/biome',
      expect.any(String),
      true
    );
  });
});
