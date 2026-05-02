import { describe, expect, it, vi, beforeEach } from 'vitest';
import { analyzeSentiment, translateText } from './googleCloud';

describe('Google Cloud Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Cloud Translation', () => {
    it('returns original text if no API key is provided', async () => {
      const result = await translateText('Hello', 'es');
      expect(result).toBe('Hello');
    });

    it('returns original text if text or target language is empty', async () => {
      const result = await translateText('', 'es', 'key');
      expect(result).toBe('');
    });

    it('translates text using the REST API', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            translations: [{ translatedText: 'Hola' }],
          },
        }),
      });

      const result = await translateText('Hello', 'es', 'fake-key');
      expect(result).toBe('Hola');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://translation.googleapis.com/language/translate/v2?key=fake-key',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('falls back to original text on API failure', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
      const result = await translateText('Hello', 'es', 'fake-key');
      expect(result).toBe('Hello');
    });
  });

  describe('Cloud Natural Language (Sentiment)', () => {
    it('uses heuristic fallback if no API key is provided (positive)', async () => {
      const result = await analyzeSentiment('This is great and awesome!');
      expect(result.isPositive).toBe(true);
      expect(result.isNegative).toBe(false);
      expect(result.score).toBeGreaterThan(0.2);
    });

    it('uses heuristic fallback if no API key is provided (negative)', async () => {
      const result = await analyzeSentiment('This is terrible and bad.');
      expect(result.isPositive).toBe(false);
      expect(result.isNegative).toBe(true);
      expect(result.score).toBeLessThan(-0.2);
    });

    it('returns neutral for empty text', async () => {
      const result = await analyzeSentiment('');
      expect(result.isNeutral).toBe(true);
      expect(result.score).toBe(0);
    });

    it('analyzes sentiment using the REST API', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documentSentiment: {
            score: 0.8,
            magnitude: 0.9,
          },
        }),
      });

      const result = await analyzeSentiment('I love voting!', 'fake-key');
      expect(result.isPositive).toBe(true);
      expect(result.isNeutral).toBe(false);
      expect(result.score).toBe(0.8);
      expect(result.magnitude).toBe(0.9);
    });

    it('falls back to heuristic on API failure', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
      const result = await analyzeSentiment('This is awful.', 'fake-key');
      // Should fall back to heuristic and detect "awful" which is mapped to -0.5 in heuristic
      expect(result.isNegative).toBe(true);
    });
  });
});
