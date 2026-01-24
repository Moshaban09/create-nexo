import * as esbuild from 'esbuild';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src');
const distDir = join(rootDir, 'dist');

// Clean dist directory
console.log('🧹 Cleaning dist directory...');
try {
  if (existsSync(distDir)) {
    rmSync(distDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
  mkdirSync(join(distDir, 'bin'), { recursive: true });
} catch (err) {
  console.error('❌ Failed to clean dist directory. Files might be locked.');
  process.exit(1);
}

console.log('📦 Building single bundle with esbuild...');
const startTime = Date.now();

// External dependencies (bundled in single binary)
const external = [
  // Runtime dependencies are now bundled!
  '@biomejs/wasm-bundler', // Keep wasm external if needed, or bundle?
  '@biomejs/wasm-web',
  'swagger-typescript-api',
];

try {
  // Build single bundle for CLI
  await esbuild.build({
    entryPoints: [join(srcDir, 'bin/nexo.ts')],
    outfile: join(distDir, 'bin/nexo.js'),
    platform: 'node',
    target: 'node20',
    format: 'esm',
    bundle: true, // Bundle everything into single file
    minify: true,
    sourcemap: false, // Set to true for debugging
    treeShaking: true,
    drop: ['debugger'],
    legalComments: 'none',
    external, // Only truly external items (like wasm if any)
    logLevel: 'info',
    banner: {
      js: `#!/usr/bin/env node
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);`,
    },
  });



  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Build completed in ${duration}s`);

  // Report bundle size
  const binFile = join(distDir, 'bin/nexo.js');
  if (existsSync(binFile)) {
    const stats = readFileSync(binFile);
    const sizeKB = (stats.length / 1024).toFixed(1);
    console.log(`📊 Bundle size: ${sizeKB} KB`);
  }

  console.log('\n🎉 Build complete!');

} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
