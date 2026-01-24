import { Command } from 'commander';
import { createRequire } from 'node:module';

import { commands } from '../commands/index.js';

const require = createRequire(import.meta.url);
const { version: VERSION } = require('../../package.json');

const program = new Command();

program
  .name('nexo')
  .description('NEXO is a next-generation, extensible CLI for scaffolding and orchestrating modern frontend projects')
  .version(VERSION)
  .option('--verbose', 'Enable verbose output for detailed logs')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.verbose) {
      process.env.NEXO_VERBOSE = 'true';
    }
  });

// Register commands
for (const cmd of commands) {
  const command = program.command(cmd.name, { isDefault: cmd.isDefault });

  if (cmd.alias) {
    command.alias(cmd.alias);
  }

  command.description(cmd.description);

  if (cmd.args) {
    for (const arg of cmd.args) {
      command.argument(arg.name, arg.description);
    }
  }

  if (cmd.options) {
    for (const opt of cmd.options) {
      if (opt.defaultValue !== undefined) {
          command.option(opt.flags, opt.description, opt.defaultValue);
      } else {
          command.option(opt.flags, opt.description);
      }
    }
  }

  command.action(cmd.action);
}

program.parse();

