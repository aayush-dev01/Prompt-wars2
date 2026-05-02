// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement, type ReactNode } from 'react';
import { LanguageProvider } from '../i18n/LanguageContext';
import ActionCenter from './ActionCenter';

const { geminiMock, sessionStoreMock, shareMock, firebaseMock, authStateMock } = vi.hoisted(() => ({
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
  shareMock: {
    copyText: vi.fn().mockResolvedValue(undefined),
    shareText: vi.fn().mockResolvedValue(undefined),
    downloadTextFile: vi.fn(),
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
vi.mock('../lib/share', () => shareMock);
vi.mock('../lib/firebase', () => firebaseMock);
vi.mock('../hooks/useGoogleAuthState', () => authStateMock);
vi.mock('framer-motion', () => {
  const motionProps = ['initial', 'animate', 'exit', 'transition', 'variants', 'whileHover', 'whileTap', 'whileDrag', 'whileFocus', 'whileInView', 'layoutId'];
  const motionProxy = new Proxy(
    {},
    {
      get: (_, tag: string) => ({ children, ...props }: Record<string, unknown>) => {
        const validProps = { ...props };
        motionProps.forEach(prop => delete validProps[prop]);
        return createElement(tag, validProps, children as ReactNode);
      },
    },
  );

  return {
    AnimatePresence: ({ children }: { children: unknown }) => children,
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
    geminiMock.fileToInlineData.mockResolvedValue({
      mimeType: 'text/plain',
      data: 'ZGVtby1maWxl',
    });
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
    expect(screen.getAllByText(/Gemini 2.5/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Grounded Google Search/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /connect google account/i }));

    await waitFor(() => {
      expect(firebaseMock.signInWithGoogle).toHaveBeenCalledTimes(1);
    });
  });

  it('runs a grounded search and saves the result', async () => {
    geminiMock.getGeminiApiKeys.mockReturnValue(['demo-key']);
    geminiMock.generateGeminiText.mockResolvedValue({
      text: 'Check your official election office for deadlines.',
      modelName: 'gemini-2.5-flash',
      citations: [{ title: 'Election office', uri: 'https://example.com/office' }],
    });

    renderActionCenter();

    fireEvent.change(screen.getByRole('textbox', { name: /question/i }), {
      target: { value: 'What should I verify before election day?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /ask with sources/i }));

    expect(await screen.findByText(/Check your official election office for deadlines\./i)).toBeInTheDocument();
    expect(geminiMock.generateGeminiText).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('link', { name: /Election office/i })).toHaveAttribute('href', 'https://example.com/office');

    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(sessionStoreMock.saveSession).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'grounded_answer',
          title: 'Grounded answer',
          summary: 'What should I verify before election day?',
        }),
      );
    });
  });

  it('rejects unsupported uploaded documents before calling Gemini', async () => {
    geminiMock.getGeminiApiKeys.mockReturnValue(['demo-key']);

    renderActionCenter();

    const input = screen.getByLabelText(/election document/i);
    const badFile = new File(['binary'], 'payload.exe', { type: 'application/octet-stream' });

    fireEvent.change(input, {
      target: { files: [badFile] },
    });

    expect(await screen.findByRole('alert')).toHaveTextContent('Please choose a PDF, TXT, PNG, JPG, JPEG, or WEBP file.');
    expect(geminiMock.generateGeminiText).not.toHaveBeenCalled();
  });

  it('runs a scenario simulation and stores a readable summary', async () => {
    geminiMock.getGeminiApiKeys.mockReturnValue(['demo-key']);
    geminiMock.generateGeminiText.mockResolvedValue({
      text: 'Likely Situation\nYour name mismatch may require local verification.',
      modelName: 'gemini-2.5-flash-lite',
      citations: [],
    });

    renderActionCenter();

    fireEvent.change(screen.getByRole('textbox', { name: /local details/i }), {
      target: { value: 'My ID spelling is slightly different from the register.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /simulate scenario/i }));

    expect(await screen.findByText(/Your name mismatch may require local verification\./i)).toBeInTheDocument();

    const saveButtons = screen.getAllByRole('button', { name: /^save$/i });
    fireEvent.click(saveButtons[0]);

    await waitFor(() => {
      expect(sessionStoreMock.saveSession).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'scenario_simulation',
          title: 'Scenario simulation',
          summary: expect.stringContaining('My ID spelling is slightly different'),
        }),
      );
    });
  });

  it('builds a personalized voting plan and saves a clean summary', async () => {
    geminiMock.getGeminiApiKeys.mockReturnValue(['demo-key']);
    geminiMock.generateGeminiText.mockResolvedValue({
      text: 'Overview\nBring your ID and verify your polling place.',
      modelName: 'gemini-2.5-flash',
      citations: [],
    });

    renderActionCenter();

    fireEvent.change(screen.getByRole('textbox', { name: /country/i }), {
      target: { value: 'India' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: /election type/i }), {
      target: { value: 'State election' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: /special concerns or constraints/i }), {
      target: { value: 'First-time voter with travel constraints' },
    });
    fireEvent.click(screen.getByRole('button', { name: /build my plan/i }));

    expect(await screen.findByText(/Bring your ID and verify your polling place\./i)).toBeInTheDocument();
    expect(geminiMock.generateGeminiText).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining('Country: India'),
      }),
    );

    fireEvent.click(screen.getAllByRole('button', { name: /^save$/i })[0]);

    await waitFor(() => {
      expect(sessionStoreMock.saveSession).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'voting_plan',
          summary: 'India | State election',
        }),
      );
    });
  });

  it('explains an uploaded document and creates a Google Cloud backup for signed-in users', async () => {
    geminiMock.getGeminiApiKeys.mockReturnValue(['demo-key']);
    geminiMock.generateGeminiText.mockResolvedValue({
      text: 'What This Is\nA polling notice for your district.',
      modelName: 'gemini-2.5-flash',
      citations: [],
    });
    firebaseMock.hasGoogleAuth = true;
    firebaseMock.hasFirebaseStorage = true;
    firebaseMock.uploadFileToCloudStorage.mockResolvedValue({
      path: 'action-center-documents/user-1/notice.txt',
      downloadUrl: 'https://example.com/notice.txt',
    });
    authStateMock.useGoogleAuthState.mockReturnValue({
      user: { uid: 'user-1', displayName: 'Ada', email: 'ada@example.com', photoURL: null },
      loading: false,
      isSignedIn: true,
    });

    renderActionCenter();

    fireEvent.change(screen.getByLabelText(/election document/i), {
      target: { files: [new File(['notice'], 'notice.txt', { type: 'text/plain' })] },
    });
    fireEvent.click(screen.getByRole('button', { name: /explain document/i }));

    expect(await screen.findByText(/A polling notice for your district\./i)).toBeInTheDocument();
    expect(firebaseMock.uploadFileToCloudStorage).toHaveBeenCalledTimes(1);
    expect(geminiMock.fileToInlineData).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('link', { name: /open cloud file/i })).toHaveAttribute('href', 'https://example.com/notice.txt');
  });

  it('runs a claim check and syncs the result to Google Cloud Storage', async () => {
    geminiMock.getGeminiApiKeys.mockReturnValue(['demo-key']);
    geminiMock.generateGeminiText.mockResolvedValue({
      text: 'Verdict: Likely misleading\nOfficial offices do not accept votes by text.',
      modelName: 'gemini-2.5-flash',
      citations: [{ title: 'Election commission', uri: 'https://example.com/commission' }],
    });
    firebaseMock.hasGoogleAuth = true;
    firebaseMock.hasFirebaseStorage = true;
    firebaseMock.uploadTextToCloudStorage.mockResolvedValue({
      path: 'claim-checks/user-1/claim-check.txt',
      downloadUrl: 'https://example.com/claim-check.txt',
    });
    authStateMock.useGoogleAuthState.mockReturnValue({
      user: { uid: 'user-1', displayName: 'Ada', email: 'ada@example.com', photoURL: null },
      loading: false,
      isSignedIn: true,
    });

    renderActionCenter();

    fireEvent.change(screen.getByRole('textbox', { name: /claim to check/i }), {
      target: { value: 'You can vote by text message in national elections.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /check claim/i }));

    expect(await screen.findByText(/Official offices do not accept votes by text\./i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /sync to google cloud/i }));

    await waitFor(() => {
      expect(firebaseMock.uploadTextToCloudStorage).toHaveBeenCalledWith(
        expect.objectContaining({
          folder: 'claim-checks',
          userId: 'user-1',
        }),
      );
    });

    expect(await screen.findByRole('status')).toHaveTextContent('Synced to Google Cloud Storage: claim-checks/user-1/claim-check.txt');
  });

  it('explains ballot text', async () => {
    geminiMock.getGeminiApiKeys.mockReturnValue(['demo-key']);
    geminiMock.generateGeminiText.mockResolvedValue({
      text: 'This measure increases property taxes.',
      modelName: 'gemini-2.5-flash',
      citations: [],
    });

    renderActionCenter();

    fireEvent.change(screen.getByRole('textbox', { name: /text to explain/i }), {
      target: { value: 'Proposition A' },
    });
    fireEvent.click(screen.getByRole('button', { name: /explain text/i }));

    expect(await screen.findByText(/This measure increases property taxes\./i)).toBeInTheDocument();
  });

  it('manages saved sessions: delete, copy, share, export', async () => {
    sessionStoreMock.loadSavedSessions.mockResolvedValueOnce([{
      id: 'session-2',
      kind: 'document_explainer',
      title: 'Document explainer',
      summary: 'Test summary',
      content: 'Test content',
      citations: [],
      language: 'en',
      modelName: 'gemini-2.5-flash',
      createdAt: 1710000000000,
    }]);

    renderActionCenter();

    expect(await screen.findByText('Test summary')).toBeInTheDocument();
    
    // Copy
    fireEvent.click(screen.getAllByRole('button', { name: /copy/i })[0]);
    expect(shareMock.copyText).toHaveBeenCalledWith('Document explainer\n\nTest content');

    // Share
    fireEvent.click(screen.getAllByRole('button', { name: /share/i })[0]);
    expect(shareMock.shareText).toHaveBeenCalledWith('Document explainer', 'Document explainer\n\nTest content');

    // Export
    fireEvent.click(screen.getAllByRole('button', { name: /export/i })[0]);
    expect(shareMock.downloadTextFile).toHaveBeenCalled();

    // Delete
    fireEvent.click(screen.getByRole('button', { name: /delete saved session/i }));
    expect(sessionStoreMock.removeSession).toHaveBeenCalledWith('session-2');
    
    await waitFor(() => {
      expect(screen.queryByText('Test summary')).not.toBeInTheDocument();
    });
  });
});
