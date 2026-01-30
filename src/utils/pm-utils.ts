
import { execSync } from 'node:child_process';

export type PackageManagerName = 'npm' | 'pnpm' | 'yarn' | 'bun';

export interface PackageManagerInfo {
  name: PackageManagerName;
  version: string;
}

/**
 * Detect the package manager used to run the CLI
 */
export const detectPackageManagerUsed = (): PackageManagerName => {
  const userAgent = process.env.npm_config_user_agent;

  if (userAgent) {
    if (userAgent.startsWith('pnpm')) return 'pnpm';
    if (userAgent.startsWith('yarn')) return 'yarn';
    if (userAgent.startsWith('bun')) return 'bun';
  }

  return 'npm';
};

/**
 * Get the prefetch command for the generic package manager
 */
export const getPrefetchCommand = (pm: PackageManagerName): { command: string, args: string[] } | null => {
  switch (pm) {
    case 'npm':
      return { command: 'npm', args: ['cache', 'add'] };
    case 'pnpm':
      return { command: 'pnpm', args: ['store', 'add'] };
    case 'yarn':
      return { command: 'yarn', args: ['cache', 'add'] };
    case 'bun':
      // Bun is extremely fast and doesn't have a direct 'cache add' equivalent that is commonly used.
      // Its install speed often negates the need for background prefetching.
      return null;
    default:
      return { command: 'npm', args: ['cache', 'add'] };
  }
};

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
