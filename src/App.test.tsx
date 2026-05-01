// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const { trackPageViewMock } = vi.hoisted(() => ({
  trackPageViewMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./lib/firebase', () => ({
  trackPageView: trackPageViewMock,
}));

vi.mock('./components/Navbar', () => ({
  default: () => <div>Navbar</div>,
}));

vi.mock('./components/Footer', () => ({
  default: () => <div>Footer</div>,
}));

vi.mock('./components/AIAssistant', () => ({
  default: () => <div>AI Assistant</div>,
}));

vi.mock('./pages/Home', () => ({
  default: () => <div>Home Page</div>,
}));

vi.mock('./pages/Process', () => ({
  default: () => <div>Process Page</div>,
}));

vi.mock('./pages/Guide', () => ({
  default: () => <div>Guide Page</div>,
}));

vi.mock('./pages/Quiz', () => ({
  default: () => <div>Quiz Page</div>,
}));

vi.mock('./pages/ActionCenter', () => ({
  default: () => <div>Action Center Page</div>,
}));

describe('App', () => {
  beforeEach(() => {
    trackPageViewMock.mockClear();
    window.history.replaceState({}, '', '/');
    document.title = '';
    window.scrollTo = vi.fn();
  });

  it('tracks the current route and updates the page title', async () => {
    render(<App />);

    await screen.findByText('Home Page');

    await waitFor(() => {
      expect(trackPageViewMock).toHaveBeenCalledWith('/', '');
    });

    await waitFor(() => {
      expect(document.title).toBe('ElectED | Understand Elections Clearly');
    });
  });
});
