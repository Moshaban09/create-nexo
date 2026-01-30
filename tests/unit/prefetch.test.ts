import { execa } from 'execa';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as pmUtils from '../../src/utils/pm-utils.js';
import { prefetchPackages, prefetchedStats } from '../../src/utils/prefetch.js';

// Mock dependencies
vi.mock('execa');
vi.mock('../../src/utils/pm-utils.js');

describe('prefetch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    prefetchedStats.successCount = 0;
    prefetchedStats.failCount = 0;
  });

  it('should do nothing if empty packages list', () => {
    prefetchPackages([]);
    expect(execa).not.toHaveBeenCalled();
  });

  it('should call npm cache add when npm is detected', () => {
    vi.mocked(pmUtils.detectPackageManagerUsed).mockReturnValue('npm');
    vi.mocked(pmUtils.getPrefetchCommand).mockReturnValue({ command: 'npm', args: ['cache', 'add'] });
    vi.mocked(execa).mockResolvedValue({} as any);

    prefetchPackages(['react', 'vite']);

    expect(execa).toHaveBeenCalledWith(
      'npm',
      ['cache', 'add', 'react', 'vite'],
      expect.objectContaining({ stdio: 'ignore', detached: false })
    );
  });

  it('should call pnpm store add when pnpm is detected', () => {
    vi.mocked(pmUtils.detectPackageManagerUsed).mockReturnValue('pnpm');
    vi.mocked(pmUtils.getPrefetchCommand).mockReturnValue({ command: 'pnpm', args: ['store', 'add'] });
    vi.mocked(execa).mockResolvedValue({} as any);

    prefetchPackages(['react']);

    expect(execa).toHaveBeenCalledWith(
      'pnpm',
      ['store', 'add', 'react'],
      expect.anything()
    );
  });

  it('should skip if bun is detected (returns null command)', () => {
    vi.mocked(pmUtils.detectPackageManagerUsed).mockReturnValue('bun');
    vi.mocked(pmUtils.getPrefetchCommand).mockReturnValue(null);

    prefetchPackages(['react']);

    expect(execa).not.toHaveBeenCalled();
  });

  it('should increment stats on success', async () => {
    vi.mocked(pmUtils.detectPackageManagerUsed).mockReturnValue('npm');
    vi.mocked(pmUtils.getPrefetchCommand).mockReturnValue({ command: 'npm', args: ['cache', 'add'] });
    vi.mocked(execa).mockResolvedValue({} as any);

    prefetchPackages(['react']);

    // Wait for promise resolution since it's unawaited in source but we can wait for ticks
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(prefetchedStats.successCount).toBe(1);
    expect(prefetchedStats.failCount).toBe(0);
  });
});
