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
  log.dim('Next steps:');
  log.dim(`  cd ${selections.projectName}`);

  if (selectedPM === 'npm') {
    log.newline();
    log.success(isAudited ? '  🛡️  Install with security audit enabled:' : '  ⚡ Install with speed optimizations:');
  }

  log.dim(`  ${installCmd}`);
  log.newline();
  log.dim(`  ${devCmd}`);
  log.newline();

  if (selectedPM === 'npm') {
    if (!isAudited) log.print(`  ${pc.yellow('(Security: Run "nexo check" after install for a full audit)')}`);
    if (!isStrict) log.print(`  ${pc.magenta('(Stability: Using --legacy-peer-deps for React 19 compatibility)')}`);
    log.newline();
  }

  log.cyan('Happy coding! 🚀');
  log.newline();
}
