import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { frameworkConfigurator } from '../../src/configurators/core/framework';
import { stylingConfigurator } from '../../src/configurators/styling/styling';
import { createWelcomePage } from '../../src/templates/welcome';
import { ConfiguratorContext } from '../../src/types';
import { PackageManager } from '../../src/utils/package-manager';

describe('RTL & Arabic Support', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `nexo-rtl-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should add dir="rtl" and lang="ar" to index.html when rtl is enabled', async () => {
    const ctx: ConfiguratorContext = {
      projectPath: testDir,
      selections: {
        projectName: 'rtl-project',
        framework: 'react',
        variant: 'ts',
        styling: 'tailwind',
        ui: 'none',
        forms: 'none',
        state: 'none',
        routing: 'none',
        dataFetching: 'none',
        icons: 'none',
        structure: 'simple',
        rtl: true
      },
      pkg: new PackageManager(testDir)
    };

    await frameworkConfigurator(ctx);

    const indexHtml = await fs.readFile(path.join(testDir, 'index.html'), 'utf-8');
    expect(indexHtml).toContain('html lang="ar" dir="rtl"');
    expect(indexHtml).toContain('fonts.googleapis.com/css2?family=Cairo');
  });

  it('should add RTL theme and text-align to Tailwind index.css', async () => {
    const ctx: ConfiguratorContext = {
      projectPath: testDir,
      selections: {
        projectName: 'rtl-project',
        framework: 'react',
        variant: 'ts',
        styling: 'tailwind',
        ui: 'none',
        forms: 'none',
        state: 'none',
        routing: 'none',
        dataFetching: 'none',
        icons: 'none',
        structure: 'simple',
        rtl: true
      },
      pkg: new PackageManager(testDir)
    };

    await stylingConfigurator(ctx);

    const indexCss = await fs.readFile(path.join(testDir, 'src', 'index.css'), 'utf-8');
    expect(indexCss).toContain('--font-sans: "Cairo"');
    expect(indexCss).toContain('text-align: right');
  });

  it('should use Arabic translations in welcome page when rtl is enabled', () => {
    const ctx: ConfiguratorContext = {
      projectPath: testDir,
      selections: {
        projectName: 'rtl-project',
        framework: 'react',
        variant: 'ts',
        styling: 'tailwind',
        ui: 'none',
        forms: 'none',
        state: 'none',
        routing: 'none',
        dataFetching: 'none',
        icons: 'none',
        structure: 'simple',
        rtl: true
      }
    };

    const welcomePage = createWelcomePage(ctx);
    expect(welcomePage).toContain('تطبيق React عالي الأداء جاهز للإطلاق');
    expect(welcomePage).toContain('التقنيات المستخدمة');
    expect(welcomePage).toContain('ابدأ الآن');
  });
});
