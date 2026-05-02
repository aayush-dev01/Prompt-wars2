// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createModelMock } = vi.hoisted(() => ({
  createModelMock: vi.fn(),
}));

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    apiKey: string;

    constructor(apiKey: string) {
      this.apiKey = apiKey;
    }

    getGenerativeModel(config: unknown, options: unknown) {
      return createModelMock(this.apiKey, config, options);
    }
  },
}));

import { fileToInlineData, generateGeminiText, getGeminiApiKeys } from './gemini';

describe('gemini runtime integration', () => {
  const originalFileReader = globalThis.FileReader;
  const originalSingleKey = import.meta.env.VITE_GEMINI_API_KEY;
  const originalMultiKey = import.meta.env.VITE_GEMINI_API_KEYS;

  beforeEach(() => {
    vi.clearAllMocks();
    import.meta.env.VITE_GEMINI_API_KEY = '';
    import.meta.env.VITE_GEMINI_API_KEYS = '';
  });

  afterEach(() => {
    globalThis.FileReader = originalFileReader;
    import.meta.env.VITE_GEMINI_API_KEY = originalSingleKey;
    import.meta.env.VITE_GEMINI_API_KEYS = originalMultiKey;
    vi.useRealTimers();
  });

  it('deduplicates Gemini API keys from single and multi-key env vars', () => {
    import.meta.env.VITE_GEMINI_API_KEY = 'key-two';
    import.meta.env.VITE_GEMINI_API_KEYS = ' key-one, key-two , key-one ';

    expect(getGeminiApiKeys()).toEqual(['key-one', 'key-two']);
  });

  it('converts an uploaded file into inline Gemini data', async () => {
    class MockFileReader {
      result: string | null = null;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      readAsDataURL() {
        this.result = 'data:text/plain;base64,aGVsbG8=';
        this.onload?.();
      }
    }

    globalThis.FileReader = MockFileReader as unknown as typeof FileReader;

    await expect(fileToInlineData(new File(['hello'], 'notes.txt', { type: 'text/plain' }))).resolves.toEqual({
      mimeType: 'text/plain',
      data: 'aGVsbG8=',
    });
  });

  it('uses search grounding and removes duplicate citations from Gemini responses', async () => {
    createModelMock.mockImplementation((_apiKey, config) => {
      const typedConfig = config as { model: string; tools?: unknown[] };

      return {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => 'Grounded answer',
            candidates: [
              {
                groundingMetadata: {
                  groundingChunks: [
                    { web: { title: 'Official source', uri: 'https://example.com/guide' } },
                    { web: { title: 'Official source', uri: 'https://example.com/guide' } },
                  ],
                },
              },
            ],
          },
        }),
        __config: typedConfig,
      };
    });

    const result = await generateGeminiText({
      apiKey: ['key-one'],
      systemInstruction: 'Be helpful',
      prompt: 'Explain the process',
      useSearchGrounding: true,
    });

    expect(result).toEqual({
      text: 'Grounded answer',
      modelName: 'gemini-2.5-flash',
      citations: [{ title: 'Official source', uri: 'https://example.com/guide' }],
    });
    expect(createModelMock).toHaveBeenCalledWith(
      'key-one',
      expect.objectContaining({
        model: 'gemini-2.5-flash',
        tools: [{ googleSearch: {} }],
      }),
      { apiVersion: 'v1beta' },
    );
  });

  it('falls through to the next model when quota is exhausted', async () => {
    createModelMock.mockImplementation((_apiKey, config) => {
      const typedConfig = config as { model: string };

      return {
        generateContent: vi.fn().mockImplementation(() => {
          if (typedConfig.model === 'gemini-2.5-flash') {
            return Promise.reject(new Error('[429] Quota exceeded for metric'));
          }

          return Promise.resolve({
            response: {
              text: () => 'Recovered on the fallback model',
              candidates: [],
            },
          });
        }),
      };
    });

    await expect(
      generateGeminiText({
        apiKey: 'demo-key',
        systemInstruction: 'Be helpful',
        prompt: 'Retry on another model',
      }),
    ).resolves.toMatchObject({
      text: 'Recovered on the fallback model',
      modelName: 'gemini-2.5-flash-lite',
    });
  });

  it('retries a temporarily unavailable model before succeeding', async () => {
    vi.useFakeTimers();
    let attempts = 0;

    createModelMock.mockReturnValue({
      generateContent: vi.fn().mockImplementation(() => {
        attempts += 1;

        if (attempts === 1) {
          return Promise.reject(new Error('[503] Gemini is temporarily unavailable due to high demand'));
        }

        return Promise.resolve({
          response: {
            text: () => 'Recovered after retry',
            candidates: [],
          },
        });
      }),
    });

    const request = generateGeminiText({
      apiKey: 'demo-key',
      systemInstruction: 'Be helpful',
      prompt: 'Retry this request',
    });

    await vi.runAllTimersAsync();

    await expect(request).resolves.toMatchObject({
      text: 'Recovered after retry',
      modelName: 'gemini-2.5-flash',
    });
    expect(attempts).toBe(2);
  });
});
