// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement, type ReactNode } from 'react';
import { LanguageProvider } from '../i18n/LanguageContext';
import AIAssistant from './AIAssistant';

const { geminiMock } = vi.hoisted(() => ({
  geminiMock: {
    getGeminiApiKeys: vi.fn(),
    generateGeminiText: vi.fn(),
    formatGeminiError: vi.fn((error: unknown) => (error instanceof Error ? error.message : 'Unknown error')),
    GEMINI_MODELS: ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'],
  },
}));

vi.mock('../lib/gemini', () => geminiMock);
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

const renderAssistant = () =>
  render(
    <LanguageProvider>
      <AIAssistant />
    </LanguageProvider>,
  );

describe('AIAssistant', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  beforeEach(() => {
    vi.clearAllMocks();
    geminiMock.getGeminiApiKeys.mockReturnValue([]);
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('surfaces the missing key state and guidance', () => {
    renderAssistant();

    fireEvent.click(screen.getAllByRole('button', { name: /open assistant/i })[0]);

    expect(screen.getByText('Gemini key required')).toBeInTheDocument();
    expect(screen.getByText(/Add `VITE_GEMINI_API_KEY` or `VITE_GEMINI_API_KEYS`/)).toBeInTheDocument();
  });

  it('sends a prompt and renders sanitized citations when keys are available', async () => {
    geminiMock.getGeminiApiKeys.mockReturnValue(['demo-key']);
    geminiMock.generateGeminiText.mockResolvedValue({
      text: 'You can check official details at https://example.com/guide',
      modelName: 'gemini-2.5-flash',
      citations: [
        { title: 'Official guide', uri: 'https://example.com/guide' },
        { title: 'Bad source', uri: 'javascript:alert(1)' },
      ],
    });

    renderAssistant();

    fireEvent.click(screen.getAllByRole('button', { name: /open assistant/i })[0]);
    fireEvent.change(screen.getByRole('textbox', { name: /ask about elections or voting/i }), {
      target: { value: 'How do I verify polling details?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await screen.findByText(/You can check official details/);

    expect(geminiMock.generateGeminiText).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Gemini connected')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Official guide' })).toHaveAttribute('href', 'https://example.com/guide');
    expect(screen.queryByRole('link', { name: 'Bad source' })).not.toBeInTheDocument();
  });

  it('shows a formatted Gemini error when a request fails', async () => {
    geminiMock.getGeminiApiKeys.mockReturnValue(['demo-key']);
    geminiMock.generateGeminiText.mockRejectedValue(new Error('Service temporarily unavailable'));

    renderAssistant();

    fireEvent.click(screen.getAllByRole('button', { name: /open assistant/i })[0]);
    fireEvent.change(screen.getByRole('textbox', { name: /ask about elections or voting/i }), {
      target: { value: 'Can you help me verify this?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Service temporarily unavailable');
    expect(screen.getByText('Gemini request failed')).toBeInTheDocument();
  });

  it('handles voice input', async () => {
    let onresultCallback: any;
    let onendCallback: any;
    
    class MockSpeechRecognition {
      start = vi.fn();
      stop = vi.fn(() => {
        if (onendCallback) onendCallback();
      });
      set onresult(cb: any) { onresultCallback = cb; }
      set onend(cb: any) { onendCallback = cb; }
    }
    
    (window as any).SpeechRecognition = MockSpeechRecognition;

    geminiMock.getGeminiApiKeys.mockReturnValue(['demo-key']);
    renderAssistant();

    fireEvent.click(screen.getAllByRole('button', { name: /open assistant/i })[0]);
    
    const micButton = screen.getByRole('button', { name: /start voice input/i });
    fireEvent.click(micButton);

    if (onresultCallback) {
      import('@testing-library/react').then(({ act }) => {
        act(() => {
          onresultCallback({
            results: [[{ transcript: 'Hello Gemini' }]]
          });
        });
      });
      // await state update
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    expect(screen.getByRole('textbox', { name: /ask about elections or voting/i })).toHaveValue('Hello Gemini');

    delete (window as any).SpeechRecognition;
  });

  it('handles voice output toggle', async () => {
    const cancelMock = vi.fn();
    const speakMock = vi.fn();
    (window as any).speechSynthesis = {
      cancel: cancelMock,
      speak: speakMock
    };

    geminiMock.getGeminiApiKeys.mockReturnValue(['demo-key']);
    renderAssistant();

    fireEvent.click(screen.getAllByRole('button', { name: /open assistant/i })[0]);
    
    const voiceToggleButton = screen.getByRole('button', { name: /enable voice replies/i });
    fireEvent.click(voiceToggleButton);

    expect(screen.getByRole('button', { name: /disable voice replies/i })).toBeInTheDocument();

    delete (window as any).speechSynthesis;
  });

  it('clears chat', async () => {
    geminiMock.getGeminiApiKeys.mockReturnValue(['demo-key']);
    renderAssistant();

    fireEvent.click(screen.getAllByRole('button', { name: /open assistant/i })[0]);
    
    fireEvent.change(screen.getByRole('textbox', { name: /ask about elections or voting/i }), {
      target: { value: 'Can you help me verify this?' },
    });
    
    const clearButton = screen.getByRole('button', { name: /clear conversation/i });
    fireEvent.click(clearButton);

    expect(screen.getByRole('textbox', { name: /ask about elections or voting/i })).toHaveValue('');
  });
});
