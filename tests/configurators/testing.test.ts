/**
 * Testing Configurator Integration Tests
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

import { testingConfigurator } from '../../src/configurators/project/testing.js';

describe('Testing Configurator', () => {
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

  it('should do nothing when testing is not selected', async () => {
    ctx.selections.testing = undefined;
    await testingConfigurator(ctx);
    expect(mockPkg.add).not.toHaveBeenCalled();
  });

  it('should do nothing when testing is "none"', async () => {
    ctx.selections.testing = 'none';
    await testingConfigurator(ctx);
    expect(mockPkg.add).not.toHaveBeenCalled();
  });

  it('should add Vitest dependencies when vitest is selected', async () => {
    ctx.selections.testing = 'vitest';
    await testingConfigurator(ctx);

    expect(mockPkg.add).toHaveBeenCalledWith(
      'vitest',
      expect.any(String),
      true
    );
    expect(mockPkg.add).toHaveBeenCalledWith(
      '@testing-library/react',
      expect.any(String),
      true
    );
  });

  it('should add Jest dependencies when jest is selected', async () => {
    ctx.selections.testing = 'jest';
    await testingConfigurator(ctx);

    expect(mockPkg.add).toHaveBeenCalledWith(
      'jest',
      expect.any(String),
      true
    );
    expect(mockPkg.add).toHaveBeenCalledWith(
      'ts-jest',
      expect.any(String),
      true
    );
  });
});
