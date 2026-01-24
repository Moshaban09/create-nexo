
import * as childProcess from 'node:child_process';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { detectAvailableManagers, getInstallCommand, getRunCommand } from '../../src/utils/pm-utils.js';

vi.mock('node:child_process');

describe('pm-utils', () => {
  describe('detectAvailableManagers', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should always include npm', () => {
      vi.mocked(childProcess.execSync).mockImplementation(() => {
        throw new Error('Command not found');
      });
      const managers = detectAvailableManagers();
      expect(managers).toContain('npm');
    });

    it('should detect pnpm if available', () => {
      vi.mocked(childProcess.execSync).mockImplementation((cmd) => {
        if (cmd.toString().includes('pnpm')) return '8.0.0';
        throw new Error('Current command not found');
      });
      const managers = detectAvailableManagers();
      expect(managers).toContain('pnpm');
    });

    it('should detect bun if available', () => {
      vi.mocked(childProcess.execSync).mockImplementation((cmd) => {
        if (cmd.toString().includes('bun')) return '1.0.0';
        throw new Error('Current command not found');
      });
      const managers = detectAvailableManagers();
      expect(managers).toContain('bun');
    });

    it('should detect all available managers', () => {
      vi.mocked(childProcess.execSync).mockReturnValue('1.0.0');
      const managers = detectAvailableManagers();
      expect(managers).toContain('npm');
      expect(managers).toContain('pnpm');
      expect(managers).toContain('yarn');
      expect(managers).toContain('bun');
    });
  });

  describe('getInstallCommand', () => {
    it('should return optimized npm command for npm', () => {
      expect(getInstallCommand('npm')).toBe('npm install --prefer-offline --no-audit --no-fund --progress=false --legacy-peer-deps');
    });

    it('should respect audit option', () => {
      expect(getInstallCommand('npm', { audit: true })).toBe('npm install --prefer-offline --no-fund --progress=false --legacy-peer-deps');
    });

    it('should respect strict option', () => {
      expect(getInstallCommand('npm', { strict: true })).toBe('npm install --prefer-offline --no-audit --no-fund --progress=false');
    });

    it('should return pnpm install for pnpm', () => {
      expect(getInstallCommand('pnpm')).toBe('pnpm install');
    });

    it('should return bun install for bun', () => {
      expect(getInstallCommand('bun')).toBe('bun install');
    });

    it('should return yarn install for yarn', () => {
      expect(getInstallCommand('yarn')).toBe('yarn install');
    });
  });

  describe('getRunCommand', () => {
    it('should return correct npm run command', () => {
      expect(getRunCommand('npm', 'dev')).toBe('npm run dev');
    });

    it('should return correct pnpm run command', () => {
      expect(getRunCommand('pnpm', 'dev')).toBe('pnpm run dev');
    });

    it('should return correct bun run command', () => {
      expect(getRunCommand('bun', 'dev')).toBe('bun run dev');
    });

    it('should return correct yarn command', () => {
      expect(getRunCommand('yarn', 'dev')).toBe('yarn dev');
    });
  });
});
