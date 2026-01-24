import { Command } from '../core/command.js';
import { log } from '../utils/logger.js';

export const presetsCommand: Command = {
  name: 'presets',
  description: 'List available project presets',
  action: async () => {
    log.cyan('\n📦 Available Presets:\n');
    log.dim('  saas         - Full-stack SaaS with auth and API');
    log.dim('  dashboard    - Admin dashboard with charts');
    log.dim('  landing      - Fast, SEO-optimized marketing page');
    log.dim('  minimal      - Bare-bones React + TypeScript');
    log.newline();
    log.dim('Usage: nexo create my-app --preset=saas\n');
  }
};
