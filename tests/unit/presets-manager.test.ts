import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type UserSelections } from '../../src/types/config.js';
import { loadPresets, savePreset, type Preset } from '../../src/utils/presets-manager.js';

vi.mock('node:fs/promises');
vi.mock('node:os');
vi.mock('node:path');

describe('PresetsManager', () => {
  const mockHomeDir = '/home/user';
  const mockConfigPath = '/home/user/.nexo/presets.json';

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(os.homedir).mockReturnValue(mockHomeDir);
    vi.mocked(path.join).mockReturnValue(mockConfigPath);
    vi.mocked(path.dirname).mockReturnValue('/home/user/.nexo');
  });

  describe('loadPresets', () => {
    it('should return empty array if file does not exist', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));
      const presets = await loadPresets();
      expect(presets).toEqual([]);
    });

    it('should return parsed presets if file exists', async () => {
      const mockData: Preset[] = [{ name: 'test', selections: {}, createAt: '2023-01-01' }];
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockData));

      const presets = await loadPresets();
      expect(presets).toEqual(mockData);
    });
  });

  describe('savePreset', () => {
    const mockSelections = {
      projectName: 'test-app',
      framework: 'react',
      variant: 'ts',
      installDependencies: true
    } as UserSelections;

    it('should create directory if needed and save new preset', async () => {
      // Mock loadPresets returning empty
      vi.mocked(fs.access).mockRejectedValueOnce(new Error('no dir')) // check dir
                          .mockRejectedValueOnce(new Error('no file')); // loadPresets

      await savePreset('my-preset', mockSelections);

      expect(fs.mkdir).toHaveBeenCalledWith('/home/user/.nexo', { recursive: true });
      expect(fs.writeFile).toHaveBeenCalledWith(
        mockConfigPath,
        expect.stringContaining('"name": "my-preset"'),
      );
    });

    it('should update existing preset', async () => {
      const existing: Preset[] = [{ name: 'my-preset', selections: { framework: 'react' }, createAt: 'old-date' }];

      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(existing));

      await savePreset('my-preset', { ...mockSelections, styling: 'tailwind' });

      // Verify writeFile was called with updated content
      const writeCall = vi.mocked(fs.writeFile).mock.calls[0];
      const writtenContent = JSON.parse(writeCall[1] as string);

      expect(writtenContent).toHaveLength(1);
      expect(writtenContent[0].selections.styling).toBe('tailwind');
      expect(writtenContent[0].createAt).not.toBe('old-date');
    });
  });
});
