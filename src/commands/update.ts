
import { execa } from 'execa';
import { Command } from '../core/command.js';
import { log } from '../utils/logger.js';

export const updateCommand: Command = {
  name: 'update',
  description: 'Update NEXO CLI to the latest version',
  options: [
    { flags: '--dry-run', description: 'Show what version would be installed without updating' }
  ],
  action: async (options: { dryRun?: boolean }) => {
    log.info('Checking for updates...');

    try {
      // Get latest version from npm
      const { stdout } = await execa('npm', ['view', 'create-nexo', 'version']);
      const latestVersion = stdout.trim();

      log.info(`Latest version: ${latestVersion}`);

      // Dry run mode
      if (options.dryRun) {
        log.cyan(`\n🔍 Dry Run - Would update to: v${latestVersion}`);
        log.dim('  Run without --dry-run to perform the update.');
        log.newline();
        return;
      }

      log.info('Updating NEXO CLI...');
      await execa('npm', ['install', '-g', 'create-nexo@latest'], { stdio: 'inherit' });

      log.success(`\n✨ NEXO CLI updated to v${latestVersion}!`);
    } catch (error) {
      log.error('Failed to update NEXO CLI.');
      if (error instanceof Error) {
        log.dim(error.message);
      }
    }
  }
};
