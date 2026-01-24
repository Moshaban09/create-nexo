/**
 * Unified Check Command
 * Combines system checks (doctor) and project health checks (health)
 */
import { execa } from 'execa';
import path from 'node:path';
import pc from 'picocolors';
import { Command } from '../core/command.js';
import { getPackageJson, pathExists } from '../utils/fs.js';
import { log } from '../utils/logger.js';

interface CheckOptions {
  system?: boolean;
  project?: boolean;
}

/**
 * Run system environment checks (Node, npm, Git)
 */
async function runSystemChecks(): Promise<boolean> {
  log.cyan('\n🖥️  System Environment\n');

  const checks = [
    {
      name: 'Node.js',
      check: async () => process.version
    },
    {
      name: 'npm',
      check: async () => {
        const { stdout } = await execa('npm', ['--version']);
        return stdout.trim();
      }
    },
    {
      name: 'Git',
      check: async () => {
        const { stdout } = await execa('git', ['--version']);
        return stdout.trim().replace('git version ', '');
      }
    },
    {
      name: 'Git User',
      check: async () => {
        try {
          const name = (await execa('git', ['config', 'user.name'])).stdout.trim();
          const email = (await execa('git', ['config', 'user.email'])).stdout.trim();
          return `${name} <${email}>`;
        } catch {
          throw new Error('Git user not configured');
        }
      }
    }
  ];

  let allPassed = true;

  for (const { name, check } of checks) {
    try {
      const result = await check();
      log.success(`  ✓ ${name}: ${result}`);
    } catch {
      allPassed = false;
      log.error(`  ✗ ${name}: Not found or error`);
    }
  }

  return allPassed;
}

/**
 * Run project health checks (security, lockfile, scripts, bundle)
 */
async function runProjectChecks(): Promise<boolean> {
  log.cyan('\n📦 Project Health\n');
  const cwd = process.cwd();

  // Check if Node project
  if (!await pathExists(path.join(cwd, 'package.json'))) {
    log.error('No package.json found. Run this in a project root.');
    return false;
  }

  let allPassed = true;

  try {
    const pkg = await getPackageJson({ projectPath: cwd });
    log.info(`Project: ${pc.bold(pkg.name || 'unnamed')} v${pkg.version || '0.0.0'}`);
    log.newline();

    // Security Audit
    log.dim('Running security audit...');
    try {
      const { stdout } = await execa('npm', ['audit', '--json'], { reject: false });
      const auditResult = JSON.parse(stdout);

      const vulns = auditResult.metadata?.vulnerabilities || {};
      const total = Object.values(vulns).reduce((a, b) => (a as number) + (b as number), 0);

      if (total === 0) {
        log.success('✓ Security: No known vulnerabilities found.');
      } else {
        allPassed = false;
        log.warn(`⚠️  Security: Found ${total} vulnerabilities.`);
        if (vulns.high || vulns.critical) {
          log.error(`   Critical: ${vulns.critical || 0}, High: ${vulns.high || 0}`);
        }
        log.dim('   Run "npm audit fix" to resolve.');
      }
    } catch {
      log.warn('Could not complete security audit.');
    }

    // Best Practices
    log.newline();
    log.dim('Checking best practices...');

    // Check Lockfile
    const hasLock = await pathExists(path.join(cwd, 'package-lock.json')) ||
                    await pathExists(path.join(cwd, 'yarn.lock')) ||
                    await pathExists(path.join(cwd, 'pnpm-lock.yaml'));

    if (hasLock) log.success('✓ Lockfile present');
    else {
      allPassed = false;
      log.warn('⚠️  No lockfile found (package-lock.json, yarn.lock, etc).');
    }

    // Check Scripts
    if (pkg.scripts) {
      if (pkg.scripts.test) log.success('✓ Test script found');
      else log.warn('○ No test script defined');

      if (pkg.scripts.lint) log.success('✓ Lint script found');
      else log.warn('○ No lint script defined');
    }

    // Bundle Analysis
    log.newline();
    log.dim('Bundle Analysis...');

    const heavyDeps = ['three', 'd3', 'lodash', 'moment', 'framer-motion'];
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    const foundHeavy = heavyDeps.filter(d => allDeps[d]);

    if (foundHeavy.length > 0) {
      log.info(`ℹ️  Detected heavy dependencies: ${foundHeavy.join(', ')}`);
      log.dim('   Consider using light-weight alternatives or tree-shaking.');
    } else {
      log.success('✓ No obviously heavy dependencies detected.');
    }

  } catch (e) {
    allPassed = false;
    log.error('Health check failed: ' + (e instanceof Error ? e.message : String(e)));
  }

  return allPassed;
}

export const checkCommand: Command = {
  name: 'check',
  description: 'Run system and project health checks',
  options: [
    { flags: '-s, --system', description: 'Run system checks only (Node, npm, Git)' },
    { flags: '-p, --project', description: 'Run project checks only (security, lockfile, bundle)' }
  ],
  action: async (options: CheckOptions) => {
    log.cyan('\n🩺 NEXO Health Check\n');

    const runSystem = options.system || (!options.system && !options.project);
    const runProject = options.project || (!options.system && !options.project);

    let systemPassed = true;
    let projectPassed = true;

    if (runSystem) {
      systemPassed = await runSystemChecks();
    }

    if (runProject) {
      projectPassed = await runProjectChecks();
    }

    // Summary
    log.newline();
    if (systemPassed && projectPassed) {
      log.success('✨ All checks passed! System is ready for NEXO.');
    } else {
      log.warn('⚠️  Some checks failed. Review the issues above.');
    }
    log.newline();
  }
};
