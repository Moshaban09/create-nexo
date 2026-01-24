/**
 * Performance Benchmarks
 *
 * Run with: npm run bench
 * Requires adding "bench" script to package.json
 */

import { bench, describe } from 'vitest';
import type { UserSelections } from '../../src/types/index.js';
import { createBatchWriter } from '../../src/utils/batch-writer.js';
import { generateFileTree } from '../../src/utils/fileTree.js';
import { validateProjectName, validateSelections } from '../../src/utils/validation.js';

// ============================================
// Test Data
// ============================================

const minimalSelections: UserSelections = {
  projectName: 'test-project',
  framework: 'react',
  variant: 'ts',
  language: 'typescript',
  styling: 'tailwind',
  ui: 'none',
  forms: 'none',
  state: 'none',
  routing: 'none',
  dataFetching: 'none',
  icons: 'none',
  structure: 'simple',
  i18n: 'none',
  auth: 'none',
};

const fullSelections: UserSelections = {
  projectName: 'full-featured-app',
  framework: 'react',
  variant: 'ts',
  language: 'typescript',
  styling: 'tailwind',
  ui: 'shadcn',
  forms: 'rhf-zod',
  state: 'zustand',
  routing: 'react-router',
  dataFetching: 'tanstack-query',
  icons: 'lucide',
  structure: 'fsd',
  i18n: 'i18next',
  auth: 'jwt',
};

// ============================================
// Validation Benchmarks
// ============================================

describe('Validation Benchmarks', () => {
  bench('validateProjectName - valid name', () => {
    validateProjectName('my-awesome-project');
  });

  bench('validateProjectName - invalid name', () => {
    validateProjectName('My Project With Spaces!');
  });

  bench('validateSelections - minimal', () => {
    validateSelections(minimalSelections);
  });

  bench('validateSelections - full', () => {
    validateSelections(fullSelections);
  });
});

// ============================================
// File Tree Benchmarks
// ============================================

describe('File Tree Generation Benchmarks', () => {
  bench('generateFileTree - minimal', () => {
    generateFileTree(minimalSelections);
  });

  bench('generateFileTree - full', () => {
    generateFileTree(fullSelections);
  });

  bench('generateFileTree - FSD structure', () => {
    generateFileTree({ ...minimalSelections, structure: 'fsd' });
  });

  bench('generateFileTree - Clean Architecture', () => {
    generateFileTree({ ...minimalSelections, structure: 'clean' });
  });
});

// ============================================
// Batch Writer Benchmarks
// ============================================

describe('Batch Writer Benchmarks', () => {
  const smallContent = 'export const test = true;';
  const largeContent = smallContent.repeat(1000);

  bench('createBatchWriter + add 10 files', () => {
    const writer = createBatchWriter();
    for (let i = 0; i < 10; i++) {
      writer.add(`file${i}.ts`, smallContent);
    }
  });

  bench('createBatchWriter + add 100 files', () => {
    const writer = createBatchWriter();
    for (let i = 0; i < 100; i++) {
      writer.add(`file${i}.ts`, smallContent);
    }
  });

  bench('createBatchWriter + add large files', () => {
    const writer = createBatchWriter();
    for (let i = 0; i < 10; i++) {
      writer.add(`file${i}.ts`, largeContent);
    }
  });

  bench('createBatchWriter + addMany', () => {
    const writer = createBatchWriter();
    const files: Record<string, string> = {};
    for (let i = 0; i < 50; i++) {
      files[`file${i}.ts`] = smallContent;
    }
    writer.addMany(files);
  });
});

// ============================================
// Memory Benchmarks
// ============================================

describe('Memory Usage Benchmarks', () => {
  bench('create 1000 selections objects', () => {
    const selections: UserSelections[] = [];
    for (let i = 0; i < 1000; i++) {
      selections.push({
        ...minimalSelections,
        projectName: `project-${i}`,
      });
    }
  });

  bench('validate 100 selections', () => {
    for (let i = 0; i < 100; i++) {
      validateSelections({
        ...minimalSelections,
        projectName: `project-${i}`,
      });
    }
  });
});
