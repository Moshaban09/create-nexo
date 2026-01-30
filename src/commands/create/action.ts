import * as p from '@clack/prompts';
import path from 'node:path';
import pc from 'picocolors';
import { DEFAULT_PROJECT_NAME } from '../../constants/index.js';
import { BANNER } from '../../core/banner.js';
import { PRESETS } from '../../core/presets.js';
import { setup } from '../../core/setup.js';
import { config } from '../../core/user-config.js';
import { formatError } from '../../errors/index.js';
import { type UserSelections } from '../../types/index.js';
import { cache } from '../../utils/cache.js';
import {
  cloneTemplate,
  generateFileTree,
  getInstallCommand,
  getPresetTemplate,
  prefetchCommonPackages
} from '../../utils/index.js';
import { log } from '../../utils/logger.js';
import { type PackageManagerName } from '../../utils/pm-utils.js';
import { handlePresetSelections } from './presets.js';
import { handleInteractiveFlow } from './prompts.js';

export interface CreateOptions {
  dir: string;
  dryRun?: boolean;
  preset?: string;
  parallel?: boolean;
  learn?: boolean;
  silent?: boolean;
  template?: string;
  audit?: boolean;
  strict?: boolean;
  rtl?: boolean;
}

export async function createAction(name: string | undefined, options: CreateOptions) {
  // Start background prefetch immediately
  prefetchCommonPackages();

  // Set global config
  if (options.learn) config.isLearningMode = true;

  if (options.silent) {
    console.log = () => {};
    console.error = () => {};
    console.warn = () => {};
  }

  log.dim('  NEXO is a next-generation, extensible CLI for scaffolding and orchestrating modern frontend projects\n');
  log.print(BANNER);
  p.intro(pc.bgCyan(pc.black(' NEXO ')));

  await cache.load();

  try {
    // 1. Resolve Project Name
    const projectName = name || await p.text({
      message: 'Project name:',
      placeholder: DEFAULT_PROJECT_NAME,
      defaultValue: DEFAULT_PROJECT_NAME,
      validate: (value) => {
        const v = value || DEFAULT_PROJECT_NAME;
        if (!/^[a-z0-9-_]+$/i.test(v)) {
          return 'Project name can only contain letters, numbers, hyphens, and underscores';
        }
        return undefined;
      },
    });

    if (p.isCancel(projectName)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }

    let selections: UserSelections | null;

    // 2. Resolve Selections (Preset vs Interactive)
    if (options.preset) {
      selections = handlePresetSelections(options.preset, projectName as string);
      if (!selections) {
        log.error(`Invalid preset: "${options.preset}". Available items: ${Object.keys(PRESETS).join(', ')}`);
        process.exit(1);
      }
      log.info(`Using preset: ${pc.cyan(options.preset.toLowerCase())}`);
    } else {
      selections = await handleInteractiveFlow(projectName as string, options.dir);
    }

    // Inject CLI flags into selections
    if (selections && options.rtl !== undefined) {
      selections.rtl = options.rtl;
    }

    if (!selections) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }

    // 3. Dry Run Handling
    if (options.dryRun) {
      handleDryRun(selections, options.dir);
      return;
    }

    // 4. Execution Plan
    const startTime = Date.now();
    const projectPath = path.resolve(options.dir, selections.projectName);
    const templateRepo = options.template || getPresetTemplate(options.preset || '');

    if (templateRepo) {
      await handleTemplateCloning(templateRepo, projectPath, selections);
    } else {
      await setup({
        selections,
        targetDir: options.dir,
        parallel: options.parallel,
      });
    }

    // 5. Auto Install Dependencies
    if (selections.installDependencies) {
      const installSpinner = p.spinner();
      const startInstall = performance.now();
      installSpinner.start('Installing dependencies...');

      try {
        const pm = (selections.packageManager || 'npm') as PackageManagerName;
        const installCmd = getInstallCommand(pm, { audit: options.audit, strict: options.strict });
        const [cmd, ...args] = installCmd.split(' ');

        const { execa } = await import('execa');
        await execa(cmd, args, {
          cwd: projectPath,
          stdio: 'ignore'
        });

        const installTime = ((performance.now() - startInstall) / 1000).toFixed(2);
        installSpinner.stop(pc.green(`✔ Dependencies installed successfully in ${installTime}s!`));

        // Prefetch Stats Summary
        const { prefetchedStats } = await import('../../utils/prefetch.js');
        if (prefetchedStats.successCount > 0) {
          log.newline();
          log.dim('  📦 Prefetch Summary:');
          log.print(`  ${pc.green('✓')} Cached: ${prefetchedStats.successCount} packages`);
          log.dim(`  ⚡ Speed boost active for next runs`);
        } else if (prefetchedStats.failCount > 0) {
           // Silent or minimal warning if needed, but per plan we keep it clean.
           // Maybe just debug log
        }
      } catch (err) {
        installSpinner.stop(pc.red('✖ Failed to install dependencies.'));
        log.warn('You can try installing manually.');
      }
    }

    // 5. Success Reporting
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    p.outro(pc.green(`✨ Project created successfully in ${duration}s!`));
    reportNextSteps(selections, options);

  } catch (error) {
    p.cancel('Error creating project');
    formatError(error, { projectName: name || 'unknown' });
    process.exit(1);
  } finally {
    await cache.save();
  }
}

/**
 * Handle Dry Run output
 */
function handleDryRun(selections: UserSelections, _targetDir: string) {
  log.newline();
  log.header('DRY RUN MODE', 'warning');
  log.warn('No files will be created.');
  log.newline();

  const fileTree = generateFileTree(selections);
  p.note(fileTree, '📂 Files that would be created');
  p.outro(pc.cyan('Dry run complete. Run without --dry-run to create the project.'));
}

/**
 * Handle template cloning flow
 */
async function handleTemplateCloning(repo: string, projectPath: string, selections: UserSelections) {
  await cloneTemplate(repo, projectPath);

  // Post-clone update package.json
  const { PackageManager } = await import('../../utils/package-manager.js');
  const pkg = new PackageManager(projectPath);
  await pkg.load({ projectPath, selections, pkg });
  pkg.set('name', selections.projectName);
  await pkg.save();
}

/**
 * Report next steps to user
 */
function reportNextSteps(selections: UserSelections, options: CreateOptions) {
  const selectedPM = selections.packageManager || 'npm';
  const isAudited = options.audit === true;
  const isStrict = options.strict === true;
  const installCmd = getInstallCommand(selectedPM as PackageManagerName, { audit: isAudited, strict: isStrict });
  const devCmd = `${selectedPM} run dev`;

  log.newline();
  log.print(pc.bold(pc.cyan('  🚀 Next Steps:')));
  log.newline();
  log.print(`  ${pc.dim('1.')} cd ${pc.cyan(selections.projectName)}`);
  log.newline();

  if (!selections.installDependencies) {
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

  log.newline();
  log.print(`  ${pc.magenta(pc.bold('Happy coding!'))} ${pc.dim('—')} ${pc.cyan('NEXO CLI')}`);
  log.newline();
}
