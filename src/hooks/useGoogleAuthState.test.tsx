// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useGoogleAuthState } from './useGoogleAuthState';

const { subscribeToGoogleAuthMock } = vi.hoisted(() => ({
  subscribeToGoogleAuthMock: vi.fn(),
}));

vi.mock('../lib/firebase', () => ({
  subscribeToGoogleAuth: subscribeToGoogleAuthMock,
}));

describe('useGoogleAuthState', () => {
  afterEach(() => {
    subscribeToGoogleAuthMock.mockReset();
  });

  it('starts loading and resolves to a signed-out state', async () => {
    subscribeToGoogleAuthMock.mockImplementation((callback: (user: null) => void) => {
      callback(null);
      return vi.fn();
    });

    const { result } = renderHook(() => useGoogleAuthState());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isSignedIn).toBe(false);
  });

  it('maps a Google profile into a signed-in state', async () => {
    subscribeToGoogleAuthMock.mockImplementation((callback: (user: { uid: string; displayName: string; email: string; photoURL: string }) => void) => {
      callback({
        uid: 'user-123',
        displayName: 'Ada Lovelace',
        email: 'ada@example.com',
        photoURL: 'https://example.com/avatar.png',
      });
      return vi.fn();
    });

    const { result } = renderHook(() => useGoogleAuthState());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toMatchObject({
      uid: 'user-123',
      displayName: 'Ada Lovelace',
      email: 'ada@example.com',
    });
    expect(result.current.isSignedIn).toBe(true);
  });
});
