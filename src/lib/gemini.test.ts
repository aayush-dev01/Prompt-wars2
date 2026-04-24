import { describe, expect, it } from 'vitest';
import { formatGeminiError, isQuotaExceededGeminiError, isRetryableGeminiError } from './gemini';

describe('gemini helpers', () => {
  it('detects quota exceeded errors', () => {
    const error = new Error('[429] Quota exceeded for metric');

    expect(isQuotaExceededGeminiError(error)).toBe(true);
    expect(isRetryableGeminiError(error)).toBe(false);
  });

  it('detects retryable high-demand errors', () => {
    const error = new Error('[503] Gemini is temporarily unavailable due to high demand');

    expect(isRetryableGeminiError(error)).toBe(true);
    expect(isQuotaExceededGeminiError(error)).toBe(false);
  });

  it('formats quota errors with retry delay when present', () => {
    const error = new Error('Quota exceeded. Please retry in 41.2s.');

    expect(formatGeminiError(error)).toContain('42 seconds');
  });

  it('falls back to the original message for non-special errors', () => {
    const error = new Error('Something specific broke');

    expect(formatGeminiError(error)).toBe('Something specific broke');
  });
});
