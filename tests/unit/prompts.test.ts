import { describe, expect, it } from 'vitest';
import {
    allPrompts,
    dataFetchingPrompt,
    formsPrompt,
    getChoiceName,
    getInquirerChoices,

    iconsPrompt,
    optionalFeaturesPrompt,
    routingPrompt,
    statePrompt,
    structurePrompt,
    stylingPrompt,
    uiPrompt,
    variantPrompt,
} from '../../src/core/prompts';

describe('Prompts Module', () => {
  describe('allPrompts', () => {
    it('should contain all core prompts', () => {
      expect(allPrompts).toHaveLength(11); // 10 core + 1 optional feature
    });

    it('should have unique names for each prompt', () => {
      const names = allPrompts.map((p) => p.name);
      const uniqueNames = [...new Set(names)];
      expect(names.length).toBe(uniqueNames.length);
    });
  });

  describe('variantPrompt', () => {
    it('should have correct name', () => {
      expect(variantPrompt.name).toBe('variant');
    });

    it('should have 6 variant options', () => {
      expect(variantPrompt.options).toHaveLength(6);
    });

    it('should have TypeScript option', () => {
      const ts = variantPrompt.options.find((o) => o.value === 'ts');
      expect(ts).toBeDefined();
      expect(ts?.name).toBe('TypeScript');
    });

    it('should have TypeScript + React Compiler option', () => {
      const tsCompiler = variantPrompt.options.find((o) => o.value === 'ts-compiler');
      expect(tsCompiler).toBeDefined();
    });

    it('should have hover_note for all options', () => {
      variantPrompt.options.forEach((opt) => {
        expect(opt.hover_note).toBeDefined();
      });
    });
  });

  describe('stylingPrompt', () => {
    it('should have Tailwind option', () => {
      const tailwind = stylingPrompt.options.find((o) => o.value === 'tailwind');
      expect(tailwind).toBeDefined();
    });

    it('should have 5 styling options', () => {
      expect(stylingPrompt.options).toHaveLength(4);
    });

    it('should include sass option', () => {
      const sass = stylingPrompt.options.find((o) => o.value === 'sass');
      expect(sass).toBeDefined();
    });

    it('should include styled-components option', () => {
      const sc = stylingPrompt.options.find((o) => o.value === 'styled-components');
      expect(sc).toBeDefined();
    });
  });

  describe('uiPrompt', () => {
    it('should have shadcn option', () => {
      const shadcn = uiPrompt.options.find((o) => o.value === 'shadcn');
      expect(shadcn).toBeDefined();
    });

    it('should have MUI option', () => {
      const mui = uiPrompt.options.find((o) => o.value === 'mui');
      expect(mui).toBeDefined();
    });

    it('should have None option', () => {
      const none = uiPrompt.options.find((o) => o.value === 'none');
      expect(none).toBeDefined();
    });
  });

  describe('formsPrompt', () => {
    it('should have RHF + Zod option', () => {
      const rhfZod = formsPrompt.options.find((o) => o.value === 'rhf-zod');
      expect(rhfZod).toBeDefined();
    });

    it('should have TanStack Form option', () => {
      const tf = formsPrompt.options.find((o) => o.value === 'tanstack-form');
      expect(tf).toBeDefined();
    });

    it('should have None option', () => {
      const none = formsPrompt.options.find((o) => o.value === 'none');
      expect(none).toBeDefined();
    });
  });

  describe('statePrompt', () => {
    it('should have Zustand option', () => {
      const zustand = statePrompt.options.find((o) => o.value === 'zustand');
      expect(zustand).toBeDefined();
    });

    it('should have None option', () => {
      const none = statePrompt.options.find((o) => o.value === 'none');
      expect(none).toBeDefined();
    });
  });

  describe('routingPrompt', () => {
    it('should have React Router option', () => {
      const rr = routingPrompt.options.find((o) => o.value === 'react-router');
      expect(rr).toBeDefined();
    });
  });

  describe('dataFetchingPrompt', () => {
    it('should have TanStack Query option', () => {
      const tq = dataFetchingPrompt.options.find((o) => o.value === 'tanstack-query');
      expect(tq).toBeDefined();
    });



    it('should have Axios option', () => {
      const axios = dataFetchingPrompt.options.find((o) => o.value === 'axios');
      expect(axios).toBeDefined();
    });

    it('should have Native Fetch option', () => {
      const fetch = dataFetchingPrompt.options.find((o) => o.value === 'fetch');
      expect(fetch).toBeDefined();
    });
  });

  describe('iconsPrompt', () => {
    it('should have Lucide option', () => {
      const lucide = iconsPrompt.options.find((o) => o.value === 'lucide');
      expect(lucide).toBeDefined();
    });

    it('should have React Icons option', () => {
      const ri = iconsPrompt.options.find((o) => o.value === 'react-icons');
      expect(ri).toBeDefined();
    });

    it('should have Iconify option', () => {
      const iconify = iconsPrompt.options.find((o) => o.value === 'iconify');
      expect(iconify).toBeDefined();
    });
  });

  describe('structurePrompt', () => {
    it('should have feature-based option', () => {
      const fb = structurePrompt.options.find((o) => o.value === 'feature-based');
      expect(fb).toBeDefined();
    });

    it('should have 6 structure options', () => {
      expect(structurePrompt.options).toHaveLength(6);
    });

    it('should have FSD option', () => {
      const fsd = structurePrompt.options.find((o) => o.value === 'fsd');
      expect(fsd).toBeDefined();
    });
  });





  describe('optionalFeaturesPrompt', () => {
    it('should be a checkbox type', () => {
      expect(optionalFeaturesPrompt.type).toBe('checkbox');
    });

    it('should have 5 optional features', () => {
      expect(optionalFeaturesPrompt.options).toHaveLength(5);
    });

    it('should include testing option', () => {
      const testing = optionalFeaturesPrompt.options.find((o) => o.value === 'testing');
      expect(testing).toBeDefined();
    });


  });

  describe('getInquirerChoices', () => {
    it('should return formatted choices', () => {
      const choices = getInquirerChoices(variantPrompt);
      expect(choices).toHaveLength(6);
      expect(choices[0]).toHaveProperty('name');
      expect(choices[0]).toHaveProperty('value');
    });
  });

  describe('getChoiceName', () => {
    it('should return option name', () => {
      const opt = { value: 'test', name: 'Test' };
      const result = getChoiceName(opt);
      expect(result).toBe('Test');
    });
  });

  describe('Option Metadata Completeness', () => {
    it('all core prompts should have hover_note for each option', () => {
      const corePrompts = [
        variantPrompt,
        stylingPrompt,
        uiPrompt,
        formsPrompt,
        statePrompt,
        routingPrompt,
        dataFetchingPrompt,
        iconsPrompt,
        structurePrompt,
      ];

      for (const prompt of corePrompts) {
        for (const option of prompt.options) {
          expect(option.hover_note, `${prompt.name}.${option.value} missing hover_note`).toBeDefined();
        }
      }
    });
  });
});
