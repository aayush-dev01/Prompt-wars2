// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  signInWithGoogle,
  signOutFromGoogle,
  subscribeToGoogleAuth,
  uploadTextToCloudStorage,
  uploadFileToCloudStorage,
  hasGoogleAuth,
  hasFirebaseStorage,
  hasFirebaseAnalytics,
} from './firebase';

vi.mock('./cloudLogging', () => ({
  cloudLog: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Firebase Auth & Storage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('exports boolean flags for feature detection', () => {
    expect(typeof hasGoogleAuth).toBe('boolean');
    expect(typeof hasFirebaseStorage).toBe('boolean');
    expect(typeof hasFirebaseAnalytics).toBe('boolean');
  });

  it('signInWithGoogle rejects gracefully when Firebase is not configured', async () => {
    // In test environment without firebase config, should throw
    if (!hasGoogleAuth) {
      await expect(signInWithGoogle()).rejects.toThrow('Google Sign-In is unavailable');
    }
  });

  it('signOutFromGoogle resolves without error even when Firebase is not configured', async () => {
    // Should not throw even without config
    await expect(signOutFromGoogle()).resolves.toBeUndefined();
  });

  it('subscribeToGoogleAuth returns an unsubscribe function', () => {
    const callback = vi.fn();
    const unsubscribe = subscribeToGoogleAuth(callback);
    expect(typeof unsubscribe).toBe('function');
    unsubscribe(); // should not throw
  });

  it('subscribeToGoogleAuth calls callback with null when Firebase is not configured', async () => {
    if (!hasGoogleAuth) {
      const callback = vi.fn();
      subscribeToGoogleAuth(callback);
      // Give the async callback time to fire
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(callback).toHaveBeenCalledWith(null);
    }
  });

  it('uploadTextToCloudStorage rejects when storage is unavailable', async () => {
    if (!hasFirebaseStorage) {
      await expect(
        uploadTextToCloudStorage({
          filename: 'test.txt',
          content: 'Hello',
          userId: 'user1',
          folder: 'tests',
        })
      ).rejects.toThrow();
    }
  });

  it('uploadFileToCloudStorage rejects when storage is unavailable', async () => {
    if (!hasFirebaseStorage) {
      const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
      await expect(
        uploadFileToCloudStorage({
          file,
          userId: 'user1',
          folder: 'tests',
        })
      ).rejects.toThrow();
    }
  });
});
