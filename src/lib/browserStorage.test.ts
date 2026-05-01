// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { safeGetLocalStorageItem, safeSetLocalStorageItem } from './browserStorage';

describe('browser storage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('reads and writes local storage successfully when available', () => {
    expect(safeSetLocalStorageItem('theme', 'dark')).toBe(true);
    expect(safeGetLocalStorageItem('theme')).toBe('dark');
  });

  it('fails closed when local storage throws', () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: vi.fn(() => {
          throw new Error('blocked');
        }),
        setItem: vi.fn(() => {
          throw new Error('blocked');
        }),
      },
    });

    expect(safeGetLocalStorageItem('theme')).toBeNull();
    expect(safeSetLocalStorageItem('theme', 'dark')).toBe(false);
  });
});
