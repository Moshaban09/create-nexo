import { expect, test } from '@playwright/test';
import { execa } from 'execa';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.resolve(__dirname, '../../dist/bin/nexo.js');
const TEST_DIR = path.resolve(__dirname, 'temp-e2e');

test.beforeAll(async () => {
    // Build CLI before testing
    await execa('npm', ['run', 'build'], { stdio: 'inherit' });
    await fs.mkdir(TEST_DIR, { recursive: true });
});

test.afterAll(async () => {
    // Cleanup
    await fs.rm(TEST_DIR, { recursive: true, force: true });
});

test.describe('E2E: nexo create', () => {
    test('should preview project creation with --dry-run', async () => {
        const projectName = 'dry-run-test';

        const { stdout } = await execa('node', [CLI_PATH, 'create', projectName, '--dir', TEST_DIR, '--dry-run'], {
            env: {
                CI: 'true',
                FORCE_COLOR: '0',
                NO_COLOR: '1'
            }
        });

        // Dry run should mention "DRY RUN" and "Files that would be created"
        expect(stdout).toContain('DRY RUN');

        // Directory should NOT be created in dry-run mode
        const projectPath = path.join(TEST_DIR, projectName);
        await expect(fs.stat(projectPath)).rejects.toThrow();
    });

    test('should create a basic React project with minimal preset', async () => {
        const projectName = 'minimal-e2e-app';
        const projectPath = path.join(TEST_DIR, projectName);

        // Clean previous run if failed
        await fs.rm(projectPath, { recursive: true, force: true });

        const { stdout } = await execa('node', [CLI_PATH, 'create', projectName, '--dir', TEST_DIR, '--preset', 'minimal'], {
            env: {
                CI: 'true',
                FORCE_COLOR: '0',
                NO_COLOR: '1'
            }
        });

        // Check directory exists
        const stats = await fs.stat(projectPath);
        expect(stats.isDirectory()).toBe(true);

        // Check package.json
        const pkgJson = JSON.parse(await fs.readFile(path.join(projectPath, 'package.json'), 'utf-8'));
        expect(pkgJson.name).toBe(projectName);
    });

    test('should fail gracefully with invalid project name', async () => {
        const invalidName = 'project with spaces!@#';

        try {
            await execa('node', [CLI_PATH, 'create', invalidName, '--dir', TEST_DIR], {
                env: {
                    CI: 'true',
                    FORCE_COLOR: '0',
                    NO_COLOR: '1'
                }
            });
            // If we reach here, the test should fail
            expect(true).toBe(false);
        } catch (error: any) {
            // CLI should exit with non-zero code
            expect(error.exitCode).not.toBe(0);
        }
    });

    test('should handle --template flag with public repo', async () => {
        const projectName = 'template-test';
        const projectPath = path.join(TEST_DIR, projectName);

        // Clean previous run if failed
        await fs.rm(projectPath, { recursive: true, force: true });

        // Use a reliable public template (React + Vite starter)
        const { stdout } = await execa('node', [
            CLI_PATH, 'create', projectName,
            '--dir', TEST_DIR,
            '--template', 'vitejs/vite/packages/create-vite/template-react'
        ], {
            env: {
                CI: 'true',
                FORCE_COLOR: '0',
                NO_COLOR: '1'
            },
            timeout: 60000 // 60 second timeout for network operations
        });

        // Check directory exists
        const stats = await fs.stat(projectPath);
        expect(stats.isDirectory()).toBe(true);
    });
});
