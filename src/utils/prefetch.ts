
import { execa } from 'execa';
import { detectPackageManagerUsed, getPrefetchCommand } from './pm-utils.js';

/**
 * Prefetch a list of packages into the local cache in the background
 */
export const prefetchPackages = (packages: string[]) => {
  if (packages.length === 0) return;

  const pm = detectPackageManagerUsed();
  const prefetchCmd = getPrefetchCommand(pm);

  if (!prefetchCmd) return;

  // Debug logging mechanism (only visible if DEBUG=true or similar, but for now we keep it silent or minimal)
  // Consolidating all packages into one command for efficiency if supported
  const { command, args } = prefetchCmd;
  const fullArgs = [...args, ...packages];

  execa(command, fullArgs, {
    stdio: 'ignore', // Keep it silent to not disrupt UI
    detached: false
  }).then(() => {
    prefetchedStats.successCount += packages.length;
  }).catch((_err) => {
    // Silent fail is intended as this is an optimization only
    // Ideally we would log to a debug file if available
    prefetchedStats.failCount += 1;
  });
};

export const prefetchedStats = {
  successCount: 0,
  failCount: 0
};

/**
 * Prefetch latest versions of common packages in the background
 */
export const prefetchCommonPackages = (): void => {
  // Core packages that are almost always used
  const common = [
    'react@latest', 'react-dom@latest', 'vite@latest', 'typescript@latest',
    '@vitejs/plugin-react@latest', 'tailwindcss@latest', 'postcss@latest', 'autoprefixer@latest'
  ];

  prefetchPackages(common);
};
