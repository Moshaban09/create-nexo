/**
 * Check Command Integration Tests
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Use vi.hoisted for mocks
const { mockExeca, mockPathExists, mockGetPackageJson } = vi.hoisted(() => ({
  mockExeca: vi.fn(),
  mockPathExists: vi.fn(() => true),
  mockGetPackageJson: vi.fn(() => ({
    name: 'test-project',
    version: '1.0.0',
    scripts: { test: 'vitest', lint: 'eslint .' },
    dependencies: {},
    devDependencies: {},
  })),
}));

vi.mock('execa', () => ({
  execa: mockExeca,
}));

vi.mock('../../src/utils/fs.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/utils/fs.js')>();
  return {
    ...actual,
    pathExists: mockPathExists,
    getPackageJson: mockGetPackageJson,
  };
});

vi.mock('../../src/utils/logger.js', () => ({
  log: {
    cyan: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    dim: vi.fn(),
    newline: vi.fn(),
  },
}));

import { checkCommand } from '../../src/commands/check.js';

describe('Check Command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    mockExeca.mockImplementation((cmd: string, args: string[]) => {
      if (cmd === 'npm' && args[0] === '--version') {
        return { stdout: '10.0.0' };
      }
      if (cmd === 'git' && args[0] === '--version') {
        return { stdout: 'git version 2.40.0' };
      }
      if (cmd === 'git' && args[0] === 'config' && args[1] === 'user.name') {
        return { stdout: 'Test User' };
      }
      if (cmd === 'git' && args[0] === 'config' && args[1] === 'user.email') {
        return { stdout: 'test@example.com' };
      }
      if (cmd === 'npm' && args[0] === 'audit') {
        return { stdout: JSON.stringify({ metadata: { vulnerabilities: {} } }) };
      }
      return { stdout: '' };
    });
  });

  it('should have correct command properties', () => {
    expect(checkCommand.name).toBe('check');
    expect(checkCommand.options).toHaveLength(2);
  });

  it('should run both system and project checks by default', async () => {
    await checkCommand.action({});

    // Verify system checks were run (npm --version called)
    expect(mockExeca).toHaveBeenCalledWith('npm', ['--version']);
    expect(mockExeca).toHaveBeenCalledWith('git', ['--version']);

    // Verify project checks were run (npm audit called)
    expect(mockExeca).toHaveBeenCalledWith('npm', ['audit', '--json'], expect.anything());
  });

  it('should run only system checks with --system flag', async () => {
    await checkCommand.action({ system: true });

    expect(mockExeca).toHaveBeenCalledWith('npm', ['--version']);
    expect(mockExeca).toHaveBeenCalledWith('git', ['--version']);
    // npm audit should NOT be called
    expect(mockExeca).not.toHaveBeenCalledWith('npm', ['audit', '--json'], expect.anything());
  });

  it('should run only project checks with --project flag', async () => {
    await checkCommand.action({ project: true });

    // npm --version for system check should NOT be called
    expect(mockExeca).not.toHaveBeenCalledWith('npm', ['--version']);
    // npm audit should be called
    expect(mockExeca).toHaveBeenCalledWith('npm', ['audit', '--json'], expect.anything());
  });

  it('should detect missing package.json for project checks', async () => {
    mockPathExists.mockReturnValue(false);
    await checkCommand.action({ project: true });

    // Should not proceed with audit if no package.json
    expect(mockGetPackageJson).not.toHaveBeenCalled();
  });
});
