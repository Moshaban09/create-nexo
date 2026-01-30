import * as p from '@clack/prompts';
import pc from 'picocolors';
import { BANNER } from '../core/banner.js';
import { Command } from '../core/command.js';
import { setup } from '../core/setup.js';
import { runWizard } from '../core/wizard.js';
import { detectAvailableManagers, generateFileTree, getInstallCommand, log, PackageManagerName, prefetchCommonPackages } from '../utils/index.js';

export const wizardCommand: Command = {
  name: 'wizard',
  alias: 'w',
  description: 'Guided project creation for beginners',
  options: [
    { flags: '-d, --dir <directory>', description: 'Target directory', defaultValue: '.' },
    { flags: '--audit', description: 'Enable security audit during installation' },
    { flags: '--strict', description: 'Enable strict dependency resolution' }
  ],
  action: async (options: { dir: string; audit?: boolean; strict?: boolean }) => {
    // Start background prefetch
    prefetchCommonPackages();

    log.print(BANNER);

    const result = await runWizard();

    if (!result) {
      process.exit(0);
    }

    // Show summary
    const summaryItems = [
      `Project:     ${pc.cyan(result.projectName)}`,
      `Type:        ${pc.cyan(result.projectType)}`,
      `Styling:     ${pc.cyan(result.selections.styling)}`,
      `UI:          ${pc.cyan(result.selections.ui)}`,
      `State:       ${pc.cyan(result.selections.state)}`,
      `Routing:     ${pc.cyan(result.selections.routing)}`,
    ];

    p.note(summaryItems.join('\n'), '📋 Configuration');

    // File tree preview
    const fileTree = generateFileTree(result.selections);
    p.note(fileTree, '📂 Files to be created');

    const confirmed = await p.confirm({
      message: 'Create project with these settings?',
    });

    if (p.isCancel(confirmed) || !confirmed) {
      p.cancel('Project creation cancelled.');
      process.exit(0);
    }

    const startTime = Date.now();
    await setup({
      selections: result.selections,
      targetDir: options.dir,
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    p.outro(pc.green(`✨ Project created successfully in ${duration}s!`));

    const availableManagers = detectAvailableManagers();
    const selectedPM = result.selections.packageManager || 'npm';
    const isAudited = options.audit === true;
    const isStrict = options.strict === true;
    const installCmd = getInstallCommand(selectedPM as PackageManagerName, { audit: isAudited, strict: isStrict });
    const devCmd = `${selectedPM} run dev`;

    log.newline();
    log.print(pc.bold(pc.cyan('  🚀 Next Steps:')));
    log.newline();
    log.print(`  ${pc.dim('1.')} cd ${pc.cyan(result.projectName)}`);
    log.newline();

    if (!result.selections.installDependencies) {
      if (selectedPM === 'npm' && !isAudited && !isStrict) {
        log.print(`    ${pc.yellow('⚡')} ${pc.bold(pc.italic(pc.red('Optimized & fast installation ready')))} ${pc.dim('(Bypass security checks for 2x faster setup)')}`);
      }
      log.print(`  ${pc.dim('2.')} ${pc.white(installCmd)}`);

      if (selectedPM === 'npm' && !isAudited && !isStrict) {
        log.newline();
        log.print(`    ${pc.blue('🛡️')} ${pc.dim('Standard install (Secure & verified)')}`);
        log.print(`    ${pc.white('npm install')}`);
      }

      log.newline();
      log.print(`  ${pc.dim('3.')} ${pc.white(devCmd)}`);
    } else {
      log.newline();
      log.print(`  ${pc.dim('2.')} ${pc.white(devCmd)}`);
    }

    if (selectedPM === 'npm' && availableManagers.includes('pnpm')) {
      log.newline();
      log.warn('  ⚡ Pro tip: Using pnpm can be 3x faster for this project.');
    }

    log.newline();
    log.print(`  ${pc.magenta(pc.bold('Happy coding!'))} ${pc.dim('—')} ${pc.cyan('NEXO CLI')}`);
    log.newline();
  }
};
