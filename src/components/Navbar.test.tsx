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

  it('toggles the theme when the button is clicked', () => {
    renderNavbar();
    const themeButtons = screen.getAllByRole('button', { name: /switch to dark/i });
    fireEvent.click(themeButtons[0]);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('opens and closes the mobile menu', () => {
    renderNavbar();
    const menuButton = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(menuButton);
    expect(screen.getByRole('button', { name: /close menu/i })).toBeInTheDocument();
    
    const homeLinks = screen.getAllByRole('link', { name: /home/i });
    expect(homeLinks.length).toBeGreaterThan(1);
    
    fireEvent.click(screen.getByRole('button', { name: /close menu/i }));
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
  });

  it('changes language via the switchers', () => {
    renderNavbar();
    const switchers = screen.getAllByRole('combobox');
    expect(switchers.length).toBe(2);
    fireEvent.change(switchers[1], { target: { value: 'es' } });
    expect((switchers[1] as HTMLSelectElement).value).toBe('es');
  });
});
