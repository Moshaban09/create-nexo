/**
 * Snapshot Tests for Generated Files
 *
 * These tests ensure that generated file contents remain consistent.
 */

import { describe, expect, it } from 'vitest';
import type { UserSelections } from '../../src/types/index.js';
import { generateFileTree } from '../../src/utils/fileTree.js';

// ============================================
// Test Helpers
// ============================================

const createSelections = (overrides: Partial<UserSelections> = {}): UserSelections => ({
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
  ...overrides,
});

// ============================================
// File Tree Snapshots
// ============================================

describe('File Tree Snapshots', () => {
  it('should generate correct file tree for minimal TypeScript project', () => {
    const selections = createSelections();
    const tree = generateFileTree(selections);
    expect(tree).toMatchSnapshot();
  });

  it('should generate correct file tree for minimal JavaScript project', () => {
    const selections = createSelections({ variant: 'js', language: 'javascript' });
    const tree = generateFileTree(selections);
    expect(tree).toMatchSnapshot();
  });

  it('should generate correct file tree for React + Tailwind + shadcn', () => {
    const selections = createSelections({
      styling: 'tailwind',
      ui: 'shadcn',
    });
    const tree = generateFileTree(selections);
    expect(tree).toMatchSnapshot();
  });

  it('should generate correct file tree for React + Redux', () => {
    const selections = createSelections({
      state: 'redux',
    });
    const tree = generateFileTree(selections);
    expect(tree).toMatchSnapshot();
  });

  it('should generate correct file tree for FSD structure', () => {
    const selections = createSelections({
      structure: 'fsd',
    });
    const tree = generateFileTree(selections);
    expect(tree).toMatchSnapshot();
  });

  it('should generate correct file tree for Clean Architecture', () => {
    const selections = createSelections({
      structure: 'clean',
    });
    const tree = generateFileTree(selections);
    expect(tree).toMatchSnapshot();
  });

  it('should generate correct file tree for full-featured project', () => {
    const selections = createSelections({
      styling: 'tailwind',
      ui: 'shadcn',
      forms: 'rhf-zod',
      state: 'zustand',
      routing: 'react-router',
      dataFetching: 'tanstack-query',
      icons: 'lucide',
      structure: 'feature-based',
      i18n: 'i18next',
      auth: 'jwt',
    });
    const tree = generateFileTree(selections);
    expect(tree).toMatchSnapshot();
  });
});

// ============================================
// Selection Combinations Snapshots
// ============================================

describe('Selection Combinations Snapshots', () => {
  const stylingOptions = ['tailwind', 'css-modules', 'sass'] as const;
  const structureOptions = ['simple', 'feature-based', 'fsd', 'clean'] as const;

  for (const styling of stylingOptions) {
    for (const structure of structureOptions) {
      it(`should generate correct tree for ${styling} + ${structure}`, () => {
        const selections = createSelections({ styling, structure });
        const tree = generateFileTree(selections);
        expect(tree).toMatchSnapshot();
      });
    }
  }
});

// ============================================
// Optional Features Snapshots
// ============================================

describe('Optional Features Snapshots', () => {
  const testingOptions = ['vitest', 'jest'] as const;
  const lintingOptions = ['eslint-prettier', 'biome'] as const;

  for (const testing of testingOptions) {
    it(`should generate correct tree with testing: ${testing}`, () => {
      const selections = createSelections({ testing });
      const tree = generateFileTree(selections);
      expect(tree).toMatchSnapshot();
    });
  }

  for (const linting of lintingOptions) {
    it(`should generate correct tree with linting: ${linting}`, () => {
      const selections = createSelections({ linting });
      const tree = generateFileTree(selections);
      expect(tree).toMatchSnapshot();
    });
  }

  it('should generate correct tree with testing + linting', () => {
    const selections = createSelections({ testing: 'vitest', linting: 'biome' });
    const tree = generateFileTree(selections);
    expect(tree).toMatchSnapshot();
  });
});
