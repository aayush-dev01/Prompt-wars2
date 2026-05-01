// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement, type ReactNode } from 'react';
import { LanguageProvider } from '../i18n/LanguageContext';
import ActionCenter from './ActionCenter';

const { geminiMock, sessionStoreMock, firebaseMock, authStateMock } = vi.hoisted(() => ({
  geminiMock: {
    getGeminiApiKeys: vi.fn(),
    generateGeminiText: vi.fn(),
    formatGeminiError: vi.fn((error: unknown) => (error instanceof Error ? error.message : 'Unknown error')),
    fileToInlineData: vi.fn(),
    GEMINI_MODELS: ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'],
  },
  sessionStoreMock: {
    getSaveOriginLabel: vi.fn(() => 'Local browser save'),
    loadSavedSessions: vi.fn().mockResolvedValue([]),
    removeSession: vi.fn().mockResolvedValue(undefined),
    saveSession: vi.fn().mockResolvedValue({
      id: 'session-1',
      kind: 'grounded_answer',
      title: 'Grounded answer',
      summary: 'Summary',
      content: 'Saved content',
      citations: [],
      language: 'English',
      modelName: 'gemini-2.5-flash',
      createdAt: 1710000000000,
    }),
  },
  firebaseMock: {
    hasFirebaseAnalytics: false,
    hasFirebaseStorage: false,
    hasGoogleAuth: false,
    signInWithGoogle: vi.fn().mockResolvedValue(undefined),
    trackFeatureEvent: vi.fn().mockResolvedValue(undefined),
    uploadFileToCloudStorage: vi.fn(),
    uploadTextToCloudStorage: vi.fn(),
  },
  authStateMock: {
    useGoogleAuthState: vi.fn(),
  },
}));

vi.mock('../lib/gemini', () => geminiMock);
vi.mock('../lib/sessionStore', () => sessionStoreMock);
vi.mock('../lib/firebase', () => firebaseMock);
vi.mock('../hooks/useGoogleAuthState', () => authStateMock);
vi.mock('framer-motion', () => {
  const motionProxy = new Proxy(
    {},
    {
      get: (_, tag: string) => (props: Record<string, unknown>) => createElement(tag, props, props.children as ReactNode),
    },
  );

  return {
    motion: motionProxy,
  };
});

const renderActionCenter = () =>
  render(
    <LanguageProvider>
      <ActionCenter />
    </LanguageProvider>,
  );

describe('ActionCenter', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  beforeEach(() => {
    vi.clearAllMocks();
    geminiMock.getGeminiApiKeys.mockReturnValue([]);
    authStateMock.useGoogleAuthState.mockReturnValue({
      user: null,
      loading: false,
      isSignedIn: false,
    });
  });

  it('shows the missing-key banner and local fallback states by default', async () => {
    renderActionCenter();

    expect(screen.getByText('Seven practical tools in one place')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/VITE_GEMINI_API_KEY|VITE_GEMINI_API_KEYS/);
    expect(screen.getByText('Google services')).toBeInTheDocument();
    expect(screen.getAllByText('Setup needed').length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(sessionStoreMock.loadSavedSessions).toHaveBeenCalled();
    });

    expect(screen.getByText('Grounded Q&A')).toBeInTheDocument();
    expect(screen.getByText('Save any result and it will appear here.')).toBeInTheDocument();
  });

  it('shows Google readiness and connect action when auth is available', async () => {
    geminiMock.getGeminiApiKeys.mockReturnValue(['demo-key']);
    firebaseMock.hasGoogleAuth = true;
    firebaseMock.hasFirebaseStorage = true;
    firebaseMock.hasFirebaseAnalytics = true;

    renderActionCenter();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Connect Google account')).toBeInTheDocument();
    expect(screen.getAllByText('Ready').length).toBeGreaterThan(0);
    expect(screen.getByText('Tracking routes')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /connect google account/i }));

    await waitFor(() => {
      expect(firebaseMock.signInWithGoogle).toHaveBeenCalledTimes(1);
    });
  });
});
