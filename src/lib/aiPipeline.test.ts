import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearCache, getCachedResponse, getHardcodedFallback, runAIPipeline, setCachedResponse } from './aiPipeline';

const geminiMock = vi.hoisted(() => ({
  generateGeminiText: vi.fn(),
}));

vi.mock('./gemini', () => geminiMock);

describe('AI Pipeline - 4 Tier Fallback', () => {
  beforeEach(() => {
    clearCache();
    vi.clearAllMocks();
  });

  describe('Tier 1: Cache', () => {
    it('sets and gets cached responses', () => {
      setCachedResponse('What is voting?', 'Voting is a civic duty.');
      expect(getCachedResponse('what is voting?  ')).toBe('Voting is a civic duty.');
    });

    it('returns null for uncached queries', () => {
      expect(getCachedResponse('unknown')).toBeNull();
    });

    it('uses cache in the pipeline', async () => {
      setCachedResponse('test prompt', 'Cached answer');
      const result = await runAIPipeline({
        prompt: 'test prompt',
        geminiKeys: ['key'],
      });
      expect(result.source).toBe('cache');
      expect(result.text).toBe('Cached answer');
      expect(geminiMock.generateGeminiText).not.toHaveBeenCalled();
    });
  });

  describe('Tier 2: Mistral AI Fallback', () => {
    it('uses Mistral AI when key is provided', async () => {
      const result = await runAIPipeline({
        prompt: 'test mistral prompt',
        geminiKeys: ['gemini-key'],
        mistralKey: 'valid-mistral-key',
      });
      expect(result.source).toBe('mistral');
      expect(result.text).toContain('Mistral AI Response to: test mistral prompt');
      expect(geminiMock.generateGeminiText).not.toHaveBeenCalled();
    });

    it('falls back to Gemini if Mistral fails (invalid key)', async () => {
      geminiMock.generateGeminiText.mockResolvedValue({ text: 'Gemini Answer' });
      const result = await runAIPipeline({
        prompt: 'test prompt',
        geminiKeys: ['gemini-key'],
        mistralKey: 'bad', // less than 5 chars throws error
      });
      expect(result.source).toBe('gemini');
      expect(result.text).toBe('Gemini Answer');
    });
  });

  describe('Tier 3: Gemini AI', () => {
    it('uses Gemini when Mistral is absent and cache misses', async () => {
      geminiMock.generateGeminiText.mockResolvedValue({ text: 'Gemini Answer' });
      const result = await runAIPipeline({
        prompt: 'test prompt',
        geminiKeys: ['gemini-key'],
      });
      expect(result.source).toBe('gemini');
      expect(result.text).toBe('Gemini Answer');
    });

    it('caches the result from Gemini', async () => {
      geminiMock.generateGeminiText.mockResolvedValue({ text: 'Gemini Answer Cache Test' });
      await runAIPipeline({
        prompt: 'cache this',
        geminiKeys: ['gemini-key'],
      });
      expect(getCachedResponse('cache this')).toBe('Gemini Answer Cache Test');
    });
  });

  describe('Tier 4: Hardcoded Fallback', () => {
    it('returns registration fallback', () => {
      expect(getHardcodedFallback('how do I register?')).toContain('Official Registration Fallback');
    });

    it('returns ID fallback', () => {
      expect(getHardcodedFallback('what id do I need?')).toContain('Official ID Fallback');
    });

    it('returns general fallback', () => {
      expect(getHardcodedFallback('who is running?')).toContain('System Alert');
    });

    it('falls all the way to hardcoded when APIs fail', async () => {
      geminiMock.generateGeminiText.mockRejectedValue(new Error('Gemini down'));
      const result = await runAIPipeline({
        prompt: 'register',
        geminiKeys: ['gemini-key'],
        mistralKey: 'bad',
      });
      expect(result.source).toBe('hardcoded');
      expect(result.text).toContain('Official Registration Fallback');
    });

    it('falls to hardcoded when no keys are provided', async () => {
      const result = await runAIPipeline({
        prompt: 'ID requirements',
        geminiKeys: [],
      });
      expect(result.source).toBe('hardcoded');
      expect(result.text).toContain('Official ID Fallback');
    });
  });
});
