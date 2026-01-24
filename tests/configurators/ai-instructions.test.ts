/**
 * AI Instructions Configurator Tests
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { aiInstructionsConfigurator } from '../../src/configurators/project/ai-instructions.js';
import type { ConfiguratorContext } from '../../src/types/index.js';
import * as fileWriter from '../../src/utils/fs.js';

// Mock file system utils
vi.mock('../../src/utils/fs.js', () => ({
  writeFile: vi.fn(),
  ensureDir: vi.fn(),
}));

describe('AI Instructions Configurator', () => {
  let ctx: ConfiguratorContext;

  beforeEach(() => {
    vi.clearAllMocks();
    ctx = {
      projectPath: '/test/project',
      projectName: 'TestProject',
      selections: {
        projectName: 'TestProject',
        framework: 'react',
        variant: 'ts',
        styling: 'tailwind',
        ui: 'shadcn',
        forms: 'rhf-zod',
        state: 'zustand',
        routing: 'react-router',
        dataFetching: 'tanstack-query',
        icons: 'lucide',
        structure: 'feature-based',
        optionalFeatures: ['i18n', 'auth', 'testing'],
      },
      pkg: null as any,
    };
  });

  it('should generate ai-context.md even if no AI tools selected', async () => {
    ctx.selections.aiInstructions = [];
    await aiInstructionsConfigurator(ctx);
    expect(fileWriter.writeFile).toHaveBeenCalledTimes(1);
    expect(fileWriter.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('ai-context.md'),
      expect.stringContaining('# Project Context')
    );
  });

  it('should generate .cursorrules for Cursor', async () => {
    ctx.selections.aiInstructions = ['cursor'];
    await aiInstructionsConfigurator(ctx);

    expect(fileWriter.writeFile).toHaveBeenCalledTimes(2);
    expect(fileWriter.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('.cursorrules'),
      expect.stringContaining('# Cursor Rules for TestProject')
    );
  });

  it('should generate .windsurfrules for Windsurf', async () => {
    ctx.selections.aiInstructions = ['windsurf'];
    await aiInstructionsConfigurator(ctx);

    expect(fileWriter.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('.windsurfrules'),
      expect.stringContaining('# Windsurf Rules for TestProject')
    );
  });

  it('should generate Clinerules for Cline', async () => {
    ctx.selections.aiInstructions = ['cline'];
    await aiInstructionsConfigurator(ctx);

    expect(fileWriter.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('.clinerules'),
      expect.stringContaining('# Cline Rules')
    );
  });

  it('should generate AI_INSTRUCTIONS.md for Universal', async () => {
    ctx.selections.aiInstructions = ['universal'];
    await aiInstructionsConfigurator(ctx);

    expect(fileWriter.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('AI_INSTRUCTIONS.md'),
      expect.stringContaining('# AI Development Instructions - TestProject')
    );
  });

  it('should generate multiple files for multiple selections', async () => {
    ctx.selections.aiInstructions = ['cursor', 'windsurf', 'universal'];
    await aiInstructionsConfigurator(ctx);

    expect(fileWriter.writeFile).toHaveBeenCalledTimes(4);
  });

  it('should include project tech stack in instructions', async () => {
    ctx.selections.aiInstructions = ['universal'];
    await aiInstructionsConfigurator(ctx);

    const [, content] = (fileWriter.writeFile as any).mock.calls[0];
    expect(content).toContain('**Framework**: react');
    expect(content).toContain('**Language**: TypeScript');
    expect(content).toContain('**Styling**: tailwind');
    expect(content).toContain('**UI Library**: shadcn');
    expect(content).toContain('**State**: zustand');
  });

  it('should include AI behavior guidelines', async () => {
    ctx.selections.aiInstructions = ['universal'];
    await aiInstructionsConfigurator(ctx);

    const [, content] = (fileWriter.writeFile as any).mock.calls[0];
    expect(content).toContain('## AI Behavior Guidelines');
    expect(content).toContain('Code Generation Rules');
    expect(content).toContain('Response Template');
  });

  it('should generate CLAUDE_INSTRUCTIONS.md for Claude', async () => {
    ctx.selections.aiInstructions = ['claude'];
    await aiInstructionsConfigurator(ctx);

    expect(fileWriter.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('CLAUDE_INSTRUCTIONS.md'),
      expect.stringContaining('# Claude Development Instructions - TestProject')
    );
  });

  it('should generate GEMINI_INSTRUCTIONS.md for Gemini', async () => {
    ctx.selections.aiInstructions = ['gemini'];
    await aiInstructionsConfigurator(ctx);

    expect(fileWriter.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('GEMINI_INSTRUCTIONS.md'),
      expect.stringContaining('# Gemini Development Instructions - TestProject')
    );
  });

  it('should generate CODEX_INSTRUCTIONS.md for Codex', async () => {
    ctx.selections.aiInstructions = ['codex'];
    await aiInstructionsConfigurator(ctx);

    expect(fileWriter.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('CODEX_INSTRUCTIONS.md'),
      expect.stringContaining('# OpenAI Codex Instructions - TestProject')
    );
  });

  it('should include architecture pattern in instructions', async () => {
    ctx.selections.structure = 'fsd';
    ctx.selections.aiInstructions = ['universal'];
    await aiInstructionsConfigurator(ctx);

    const [, content] = (fileWriter.writeFile as any).mock.calls[0];
    expect(content).toContain('**fsd** architecture pattern');
    expect(content).toContain('**Architecture**: fsd');
    expect(content).toContain('Group related files by feature/domain');
  });
});
