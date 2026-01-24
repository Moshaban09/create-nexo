
import { execSync } from 'node:child_process';

export type PackageManagerName = 'npm' | 'pnpm' | 'yarn' | 'bun';

export interface PackageManagerInfo {
  name: PackageManagerName;
  version: string;
}

/**
 * Detect available package managers on the system
 */
export const detectAvailableManagers = (): PackageManagerName[] => {
  const managers: PackageManagerName[] = ['npm']; // npm is always assumed available in Node env

  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    managers.push('pnpm');
  } catch {
    // pnpm not found
  }

  try {
    execSync('yarn --version', { stdio: 'ignore' });
    managers.push('yarn');
  } catch {
    // yarn not found
  }

  try {
    execSync('bun --version', { stdio: 'ignore' });
    managers.push('bun');
  } catch {
    // bun not found
  }

  return managers;
};

/**
 * Get install command with performance flags
 */
export const getInstallCommand = (pm: PackageManagerName, options: { audit?: boolean; strict?: boolean } = {}): string => {
  const { audit = false, strict = false } = options;

  switch (pm) {
    case 'npm':
      const auditFlag = audit ? '' : '--no-audit';
      const strictFlag = strict ? '' : '--legacy-peer-deps';
      return `npm install --prefer-offline ${auditFlag} --no-fund --progress=false ${strictFlag}`.replace(/\s+/g, ' ').trim();
    case 'pnpm':
      return 'pnpm install';
    case 'bun':
      return 'bun install';
    case 'yarn':
      return 'yarn install';
    default:
      return 'npm install';
  }
};

/**
 * Get run command prefix
 */
export const getRunCommand = (pm: PackageManagerName, script: string): string => {
  switch (pm) {
    case 'npm':
      return `npm run ${script}`;
    case 'pnpm':
      return `pnpm run ${script}`;
    case 'bun':
      return `bun run ${script}`;
    case 'yarn':
      return `yarn ${script}`;
    default:
      return `npm run ${script}`;
  }
};
