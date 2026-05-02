import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import * as firebaseLib from './lib/firebase';
import { LanguageProvider } from './i18n/LanguageContext';

vi.mock('./lib/firebase', () => ({
  trackPageView: vi.fn(),
  onAuthStateChanged: vi.fn().mockImplementation((cb) => { cb(null); return () => {}; }),
  getAuth: vi.fn().mockReturnValue({}),
  app: {},
  analytics: {},
}));

// Mock components to avoid deep rendering issues and focus on routing
vi.mock('./components/Navbar', () => ({ default: () => <nav data-testid="navbar">Navbar</nav> }));
vi.mock('./components/Footer', () => ({ default: () => <footer data-testid="footer">Footer</footer> }));
vi.mock('./components/AIAssistant', () => ({ default: () => <div data-testid="ai-assistant">AIAssistant</div> }));

vi.mock('./pages/Home', () => ({ default: () => <div data-testid="home-page">Home</div> }));
vi.mock('./pages/Process', () => ({ default: () => <div data-testid="process-page">Process</div> }));
vi.mock('./pages/Guide', () => ({ default: () => <div data-testid="guide-page">Guide</div> }));
vi.mock('./pages/Quiz', () => ({ default: () => <div data-testid="quiz-page">Quiz</div> }));
vi.mock('./pages/ActionCenter', () => ({ default: () => <div data-testid="action-center-page">Action Center</div> }));

describe('App Routing and Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/');
    document.title = 'ElectED | Understand Elections Clearly';
  });

  const renderApp = () => render(
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );

  it('renders common layout components: Navbar, Footer, AIAssistant', async () => {
    renderApp();
    expect(await screen.findByTestId('navbar')).toBeInTheDocument();
    expect(await screen.findByTestId('footer')).toBeInTheDocument();
    expect(await screen.findByTestId('ai-assistant')).toBeInTheDocument();
  });

  it('renders the Home page by default', async () => {
    renderApp();
    expect(await screen.findByTestId('home-page')).toBeInTheDocument();
  });

  it('navigates to the Action Center page', async () => {
    window.history.pushState({}, '', '/action-center');
    renderApp();
    expect(await screen.findByTestId('action-center-page')).toBeInTheDocument();
  });

  it('navigates to the Process page', async () => {
    window.history.pushState({}, '', '/process');
    renderApp();
    expect(await screen.findByTestId('process-page')).toBeInTheDocument();
  });

  it('navigates to the Guide page', async () => {
    window.history.pushState({}, '', '/guide');
    renderApp();
    expect(await screen.findByTestId('guide-page')).toBeInTheDocument();
  });

  it('navigates to the Quiz page', async () => {
    window.history.pushState({}, '', '/quiz');
    renderApp();
    expect(await screen.findByTestId('quiz-page')).toBeInTheDocument();
  });

  it('sets the document title for Home', async () => {
    window.history.pushState({}, '', '/');
    renderApp();
    await waitFor(() => {
      expect(document.title).toBe('ElectED | Understand Elections Clearly');
    });
  });

  it('sets the document title for Action Center', async () => {
    window.history.pushState({}, '', '/action-center');
    renderApp();
    await waitFor(() => {
      expect(document.title).toBe('Action Center | ElectED');
    });
  });

  it('sets the document title for Process', async () => {
    window.history.pushState({}, '', '/process');
    renderApp();
    await waitFor(() => {
      expect(document.title).toBe('Election Process | ElectED');
    });
  });

  it('sets the document title for Guide', async () => {
    window.history.pushState({}, '', '/guide');
    renderApp();
    await waitFor(() => {
      expect(document.title).toBe('Voter Guide | ElectED');
    });
  });

  it('sets the document title for Quiz', async () => {
    window.history.pushState({}, '', '/quiz');
    renderApp();
    await waitFor(() => {
      expect(document.title).toBe('Quiz | ElectED');
    });
  });

  it('tracks page views on navigation', async () => {
    window.history.pushState({}, '', '/process');
    renderApp();
    await waitFor(() => {
      expect(firebaseLib.trackPageView).toHaveBeenCalledWith(
        '/process',
        expect.any(String),
      );
    });
  });

  it('renders a skip link for accessibility', async () => {
    renderApp();
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('scrolls to top on route change', async () => {
    const scrollToMock = vi.fn();
    window.scrollTo = scrollToMock;
    renderApp();
    await waitFor(() => {
      expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
  });
});
