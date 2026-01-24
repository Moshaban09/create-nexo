
import * as execaModule from 'execa';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkCommand } from '../../src/commands/check.js';
import { updateCommand } from '../../src/commands/update.js';

// Mocks
vi.mock('execa', () => ({
  execa: vi.fn(),
}));

vi.mock('../../src/utils/logger.js', () => ({
  log: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    cyan: vi.fn(),
    dim: vi.fn(),
    newline: vi.fn(),
  }
}));

vi.mock('../../src/utils/fs.js', () => ({
  pathExists: vi.fn().mockResolvedValue(true),
  getPackageJson: vi.fn().mockResolvedValue({
    name: 'test-project',
    version: '1.0.0',
    scripts: { test: 'vitest' },
    dependencies: {},
    devDependencies: {},
  }),
}));

vi.mock('@clack/prompts', () => ({
    confirm: vi.fn().mockResolvedValue(true),
    isCancel: vi.fn().mockReturnValue(false)
}));



describe('Maintenance Commands', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Check (System)', () => {
    it('should run system checks', async () => {
       // Mock successful execution
       (execaModule.execa as any).mockResolvedValue({ stdout: 'v1.0.0' });

       await checkCommand.action({ system: true });

       expect(execaModule.execa).toHaveBeenCalledWith('npm', ['--version']);
       expect(execaModule.execa).toHaveBeenCalledWith('git', ['--version']);
    });
  });

  describe('Update', () => {
      it('should check for updates and install', async () => {
          (execaModule.execa as any).mockResolvedValue({ stdout: '2.0.0' });

          await updateCommand.action({});

          expect(execaModule.execa).toHaveBeenCalledWith('npm', ['view', 'create-nexo', 'version']);
          expect(execaModule.execa).toHaveBeenCalledWith('npm', ['install', '-g', 'create-nexo@latest'], expect.anything());
      });

      it('should show dry run without installing', async () => {
          (execaModule.execa as any).mockResolvedValue({ stdout: '2.0.0' });

          await updateCommand.action({ dryRun: true });

          expect(execaModule.execa).toHaveBeenCalledWith('npm', ['view', 'create-nexo', 'version']);
          expect(execaModule.execa).toHaveBeenCalledTimes(1); // Only view, not install
      });
  });


});
