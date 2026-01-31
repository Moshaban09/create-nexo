import { Command } from '../../core/command.js';
import { type CreateOptions } from './action.js';

/**
 * Nexo Create Command
 * This command is the main entry point for creating new projects.
 * It is modularized for better maintainability.
 */
export const createCommand: Command = {
  name: 'create',
  description: 'Create a new project',
  isDefault: true,
  args: [
    { name: '[name]', description: 'Project name' }
  ],
  options: [
    { flags: '-d, --dir <directory>', description: 'Target directory', defaultValue: '.' },
    { flags: '--dry-run', description: 'Preview changes without creating files' },
    { flags: '-p, --preset <preset>', description: 'Use a preset configuration (saas, dashboard, landing, ecommerce, etc.)' },
    { flags: '--parallel', description: 'Use parallel execution for faster setup' },
    { flags: '--learn', description: 'Enable educational mode with explanations' },
    { flags: '--template <repo>', description: 'Clone a template from GitHub (e.g., user/repo)' },
    { flags: '--audit', description: 'Enable security audit during installation' },
    { flags: '--strict', description: 'Enable strict dependency resolution (disable --legacy-peer-deps)' },
    { flags: '--rtl', description: 'Enable Arabic & RTL support with Cairo font' }
  ],
  action: async (name: string | undefined, options: CreateOptions) => {
    // Dynamically import the action logic only when executed
    const { createAction } = await import('./action.js');
    return createAction(name, options);
  }
};
