// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageContext';
import Navbar from './Navbar';

const { useGoogleAuthStateMock, firebaseMock } = vi.hoisted(() => ({
  useGoogleAuthStateMock: vi.fn(),
  firebaseMock: {
    hasGoogleAuth: true,
    signInWithGoogle: vi.fn().mockResolvedValue(undefined),
    signOutFromGoogle: vi.fn().mockResolvedValue(undefined),
    trackFeatureEvent: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../hooks/useGoogleAuthState', () => ({
  useGoogleAuthState: useGoogleAuthStateMock,
}));

vi.mock('../lib/firebase', () => firebaseMock);

const renderNavbar = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <LanguageProvider>
        <Navbar />
      </LanguageProvider>
    </MemoryRouter>,
  );

describe('Navbar', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });

    useGoogleAuthStateMock.mockReturnValue({
      user: null,
      loading: false,
      isSignedIn: false,
    });
  });

  it('shows sync-ready status for signed-in users', async () => {
    useGoogleAuthStateMock.mockReturnValue({
      user: {
        uid: 'user-123',
        displayName: 'Ada Lovelace',
        email: 'ada@example.com',
        photoURL: '',
      },
      loading: false,
      isSignedIn: true,
    });

    renderNavbar();

    await waitFor(() => {
      expect(screen.getAllByText('Cloud sync ready').length).toBeGreaterThan(0);
    });
  });

  it('starts Google sign-in from the navbar and tracks the event', async () => {
    renderNavbar();

    fireEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }));

    await waitFor(() => {
      expect(firebaseMock.signInWithGoogle).toHaveBeenCalledTimes(1);
    });

    expect(firebaseMock.trackFeatureEvent).toHaveBeenCalledWith('google_sign_in', {
      surface: 'navbar',
    });
  });
});
