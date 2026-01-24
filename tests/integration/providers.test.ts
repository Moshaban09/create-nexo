import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { setup } from '../../src/core/setup';
import { UserSelections } from '../../src/types';

describe('E2E: Providers Integration', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `nexo-e2e-providers-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should wrap app with HeroUI and Redux providers', async () => {
    const selections: UserSelections = {
      projectName: 'provider-app',
      framework: 'react',
      variant: 'ts',
      language: 'typescript',
      styling: 'tailwind',
      ui: 'heroui',
      forms: 'none',
      state: 'redux',
      routing: 'none',
      dataFetching: 'none',
      icons: 'none',
      structure: 'simple',
      i18n: 'none',
      auth: 'none',
    };

    await setup({ selections, targetDir: testDir });
    const projectDir = path.join(testDir, 'provider-app');

    const mainContent = await fs.readFile(path.join(projectDir, 'src/main.tsx'), 'utf-8');

    // Check Imports
    expect(mainContent).toContain("import { HeroUIProvider } from '@heroui/react'");
    expect(mainContent).toContain("import { Provider } from 'react-redux'");
    expect(mainContent).toContain("import { store } from './store/store'");

    // Check Providers Wrapping
    expect(mainContent).toContain('<Provider store={store}>');
    expect(mainContent).toContain('<HeroUIProvider>');

    // Check Nesting Order (Redux outside UI usually, but our logic pushes UI first then Redux, let's verify logic)
    // In our entry.ts:
    // 1. Redux (pushed first) -> start: <Provider>
    // 2. UI (pushed second) -> start: <HeroUIProvider>
    // Loop:
    // content += <Provider>
    // content += <HeroUIProvider>
    // <App />
    // content += </HeroUIProvider>
    // content += </Provider>

    // So Redux wraps HeroUI. This is correct.
    const reduxStart = mainContent.indexOf('<Provider store={store}>');
    const heroStart = mainContent.indexOf('<HeroUIProvider>');
    expect(reduxStart).toBeLessThan(heroStart);
  }, 60000);
});
