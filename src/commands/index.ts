import { Command } from '../core/command.js';

// Registry will be populated as we migrate commands
import { createCommand } from './create/index.js';

import { checkCommand } from './check.js';
import { presetsCommand } from './presets.js';
import { updateCommand } from './update.js';
import { wizardCommand } from './wizard.js';

export const commands: Command[] = [
    checkCommand,

    presetsCommand,
    wizardCommand,
    createCommand,
    updateCommand
];

export function registerCommand(command: Command) {
    commands.push(command);
}

``
