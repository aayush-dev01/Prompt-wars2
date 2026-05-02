// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { LanguageProvider, useLanguage } from './LanguageContext';

const TestConsumer = () => {
  const { language, setLanguage, labels, isRtl } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="rtl">{isRtl ? 'rtl' : 'ltr'}</span>
      <span data-testid="home-badge">{labels.home.badge}</span>
      <button data-testid="switch-hi" onClick={() => setLanguage('hi')}>Hindi</button>
      <button data-testid="switch-ar" onClick={() => setLanguage('ar')}>Arabic</button>
      <button data-testid="switch-en" onClick={() => setLanguage('en')}>English</button>
    </div>
  );
};

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('defaults to English language', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('lang').textContent).toBe('en');
    expect(screen.getByTestId('rtl').textContent).toBe('ltr');
  });

  it('provides translated labels for the home page', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('home-badge').textContent).toBe('Civic learning without the jargon');
  });

  it('switches language and updates direction for RTL (Arabic)', async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );

    await user.click(screen.getByTestId('switch-ar'));
    expect(screen.getByTestId('lang').textContent).toBe('ar');
    expect(screen.getByTestId('rtl').textContent).toBe('rtl');
  });

  it('persists language preference to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );

    await user.click(screen.getByTestId('switch-hi'));
    expect(localStorage.getItem('elected-language')).toBe('hi');
  });
});
