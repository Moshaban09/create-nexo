import * as p from '@clack/prompts';
import pc from 'picocolors';
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
    // We might need to handle the banner display globally or inside here
    const banner = `
${pc.cyan('╔═══════════════════════════════════════════════════════════════╗')}
${pc.cyan('║')}                                                               ${pc.cyan('║')}
${pc.cyan('║')}   ${pc.bold('███╗   ██╗███████╗██╗  ██╗ ██████╗ ')}                        ${pc.cyan('║')}
${pc.cyan('║')}   ${pc.bold('████╗  ██║██╔════╝╚██╗██╔╝██╔═══██╗')}                        ${pc.cyan('║')}
${pc.cyan('║')}   ${pc.bold('██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║')}                        ${pc.cyan('║')}
${pc.cyan('║')}   ${pc.bold('██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║')}                        ${pc.cyan('║')}
${pc.cyan('║')}   ${pc.bold('██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝')}                        ${pc.cyan('║')}
${pc.cyan('║')}   ${pc.bold('╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ')}                        ${pc.cyan('║')}
${pc.cyan('║')}                                                               ${pc.cyan('║')}
${pc.cyan('║')}   ${pc.dim('N - Next-generation')}                                           ${pc.cyan('║')}
${pc.cyan('║')}   ${pc.dim('E - Extensible')}                                                ${pc.cyan('║')}
${pc.cyan('║')}   ${pc.dim('X - X-framework')}                                               ${pc.cyan('║')}
${pc.cyan('║')}   ${pc.dim('O - Orchestrator')}                                              ${pc.cyan('║')}
${pc.cyan('║')}                                                               ${pc.cyan('║')}
${pc.cyan('╚═══════════════════════════════════════════════════════════════╝')}
`;
    log.print(banner);

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

    log.newline();
    log.dim('Next steps:');
    log.dim(`  cd ${result.projectName}`);
    if (selectedPM === 'npm') {
      log.newline();
      if (isAudited) {
        log.success('  🛡️  Install with security audit enabled:');
      } else {
        log.success('  ⚡ Install with speed optimizations:');
      }
    }
    log.dim(`  ${installCmd}`);
    log.newline();
    log.dim(`  ${selectedPM} run dev`);
    if (selectedPM === 'npm' && availableManagers.includes('pnpm')) {
      log.newline();
      log.warn('⚡ Pro tip: Using pnpm can be 3x faster for this project.');
    }

    log.newline();
    if (selectedPM === 'npm') {
      if (!isAudited) {
        log.print(`  ${pc.yellow('(Security: Run "nexo check" after install for a full audit)')}`);
      }
      if (!isStrict) {
        log.print(`  ${pc.magenta('(Stability: Using --legacy-peer-deps for React 19 compatibility)')}`);
      }
    }
    log.cyan('Happy coding! 🚀');
    log.newline();
  }
};
