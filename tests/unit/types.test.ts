import { describe, expect, it } from 'vitest';
import { ConfiguratorContext, PromptConfig, PromptOption, UserSelections } from '../../src/types';

describe('Types Module', () => {
  describe('PromptOption', () => {
    it('should accept valid PromptOption', () => {
      const option: PromptOption = {
        value: 'react',
        name: 'React',
        rank: 'recommended',
        comment: 'A JavaScript library',
        hover_note: 'Most popular',
        folder_info: ['src/'],
      };

      expect(option.value).toBe('react');
      expect(option.rank).toBe('recommended');
    });

    it('should accept PromptOption without optional fields', () => {
      const option: PromptOption = {
        value: 'test',
        name: 'Test',
        rank: 'solid',
      };

      expect(option.comment).toBeUndefined();
      expect(option.hover_note).toBeUndefined();
      expect(option.folder_info).toBeUndefined();
    });
  });

  describe('PromptConfig', () => {
    it('should accept valid PromptConfig', () => {
      const config: PromptConfig = {
        name: 'framework',
        message: 'Select a framework:',
        type: 'list',
        options: [
          { value: 'react', name: 'React', rank: 'recommended' },
        ],
      };

      expect(config.name).toBe('framework');
      expect(config.type).toBe('list');
      expect(config.options).toHaveLength(1);
    });
  });

  describe('UserSelections', () => {
    it('should accept valid UserSelections', () => {
      const selections: UserSelections = {
        projectName: 'my-app',
        framework: 'react',
        variant: 'vite-default',
        language: 'typescript',
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
      };

      expect(selections.projectName).toBe('my-app');
      expect(selections.framework).toBe('react');
    });
  });

  describe('ConfiguratorContext', () => {
    it('should accept valid ConfiguratorContext', () => {
      const ctx: ConfiguratorContext = {
        projectPath: '/path/to/project',
        selections: {
          projectName: 'my-app',
          framework: 'react',
          variant: 'vite-default',
          language: 'typescript',
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
        },
      };

      expect(ctx.projectPath).toBe('/path/to/project');
      expect(ctx.selections.framework).toBe('react');
    });
  });
});
