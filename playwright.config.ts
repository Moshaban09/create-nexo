import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60 * 1000, // 60 seconds per test
  retries: 0,
  workers: 1, // Sequential execution to avoid file system conflicts
  use: {
    trace: 'on-first-retry',
  },
  outputDir: 'test-results/',
  projects: [
    {
      name: 'cli',
      testMatch: /.*\.test\.ts/,
    },
  ],
});
