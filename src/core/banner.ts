import { createRequire } from 'node:module';
import pc from 'picocolors';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json');

export const BANNER = `
${pc.cyan('   _   _  _____ __  __  ___  ')}
${pc.cyan('  | \\ | || ____|\\ \\/ / / _ \\ ')}
${pc.cyan('  |  \\| ||  _|   \\  / | | | |')}
${pc.cyan('  | |\\  || |___  /  \\ | |_| |')}
${pc.cyan('  |_| \\_||_____|/_/\\_\\ \\___/ ')}
${pc.dim('  v' + pkg.version)}
`;
