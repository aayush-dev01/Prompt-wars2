// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { copyText, downloadTextFile, shareText } from './share';

describe('share helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('copies text to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    await copyText('ElectED');

    expect(writeText).toHaveBeenCalledWith('ElectED');
  });

  it('shares text when the Web Share API is available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: share,
    });

    await shareText('Title', 'Body');

    expect(share).toHaveBeenCalledWith({
      title: 'Title',
      text: 'Body',
    });
  });

  it('throws a helpful error when Web Share is unavailable', async () => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    });

    await expect(shareText('Title', 'Body')).rejects.toThrow('Web Share is not available');
  });

  it('downloads a text file through an object URL', () => {
    const click = vi.fn();
    const createElement = vi.spyOn(document, 'createElement').mockReturnValue({
      click,
      download: '',
      href: '',
    } as unknown as HTMLAnchorElement);
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    downloadTextFile('notes.txt', 'Hello');

    expect(createElement).toHaveBeenCalledWith('a');
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });
});
