/**
 * VotePath AI - 4-Tier AI Fallback Pipeline
 * 1. Cache (Simulated via local/session memory or simple object)
 * 2. Mistral AI (Simulated via REST or mock since we are on the frontend)
 * 3. Gemini AI (Primary integrated LLM)
 * 4. Hardcoded Fallback
 */

import { generateGeminiText } from './gemini';

// 1. Memory Cache
const queryCache = new Map<string, string>();

export const getCachedResponse = (query: string): string | null => {
  return queryCache.get(query.toLowerCase().trim()) || null;
};

export const setCachedResponse = (query: string, response: string): void => {
  queryCache.set(query.toLowerCase().trim(), response);
};

export const clearCache = (): void => {
  queryCache.clear();
};

// 2. Mistral AI Mock/REST Wrapper
export const callMistralAI = async (prompt: string, apiKey?: string): Promise<string> => {
  // If we had a real Mistral endpoint we'd call it here
  if (!apiKey || apiKey.length < 5) {
    throw new Error('Mistral AI Key unavailable or invalid');
  }
  
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 300));
  return `Mistral AI Response to: ${prompt.slice(0, 50)}...`;
};

// 3. Hardcoded Fallbacks
export const getHardcodedFallback = (query: string): string => {
  const normalized = query.toLowerCase();
  if (normalized.includes('register') || normalized.includes('registration')) {
    return 'Official Registration Fallback: Please visit your local election office website or voter portal to register. Registration deadlines vary by state/region.';
  }
  if (normalized.includes('id') || normalized.includes('identification')) {
    return 'Official ID Fallback: Bring a valid government-issued photo ID to the polling station. Check local rules as acceptable IDs vary.';
  }
  return 'System Alert: AI services are currently unreachable. Please consult your official local election authority website for accurate voting information.';
};

// 4-Tier Orchestrator
export const runAIPipeline = async (options: {
  prompt: string;
  geminiKeys: string[];
  mistralKey?: string;
  systemInstruction?: string;
}): Promise<{ text: string; source: 'cache' | 'mistral' | 'gemini' | 'hardcoded'; citations?: any[]; modelName?: string }> => {
  const { prompt, geminiKeys, mistralKey, systemInstruction } = options;

  // Tier 1: Cache
  const cached = getCachedResponse(prompt);
  if (cached) {
    return { text: cached, source: 'cache', modelName: 'cache' };
  }

  // Tier 2: Mistral AI (if configured)
  if (mistralKey) {
    try {
      const mistralResponse = await callMistralAI(prompt, mistralKey);
      setCachedResponse(prompt, mistralResponse);
      return { text: mistralResponse, source: 'mistral', modelName: 'mistral' };
    } catch {
      // Fall through to Gemini
    }
  }

  // Tier 3: Gemini AI
  if (geminiKeys && geminiKeys.length > 0) {
    try {
      const result = await generateGeminiText({
        apiKey: geminiKeys,
        prompt,
        systemInstruction,
      });
      setCachedResponse(prompt, result.text);
      return { text: result.text, source: 'gemini', citations: result.citations, modelName: result.modelName };
    } catch {
      // Fall through to Hardcoded
    }
  }

  // Tier 4: Hardcoded
  const hardcoded = getHardcodedFallback(prompt);
  return { text: hardcoded, source: 'hardcoded', modelName: 'hardcoded' };
};
