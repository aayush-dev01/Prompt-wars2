import { GoogleGenerativeAI } from '@google/generative-ai';

export const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'] as const;
const MAX_RETRY_ATTEMPTS = 3;

export type GeminiModelName = (typeof GEMINI_MODELS)[number];

export type Citation = {
  title: string;
  uri: string;
};

type PromptRequest = {
  apiKey: string | string[];
  systemInstruction: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  useSearchGrounding?: boolean;
  filePart?: {
    mimeType: string;
    data: string;
  };
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getGeminiApiKeys = () => {
  const multiKeyValue = (import.meta.env.VITE_GEMINI_API_KEYS || '').trim();
  const singleKeyValue = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();

  const keys = [
    ...multiKeyValue.split(',').map((key: string) => key.trim()).filter(Boolean),
    singleKeyValue,
  ].filter(Boolean);

  return [...new Set(keys)];
};

const getGeminiErrorMessage = (error: unknown) => (error instanceof Error ? error.message.toLowerCase() : '');

const extractRetryDelaySeconds = (error: unknown) => {
  if (!(error instanceof Error)) {
    return null;
  }

  const match = error.message.match(/retry in\s+([\d.]+)s/i);
  if (!match) {
    return null;
  }

  const seconds = Number.parseFloat(match[1]);
  return Number.isFinite(seconds) ? Math.ceil(seconds) : null;
};

export const isQuotaExceededGeminiError = (error: unknown) => {
  const normalizedMessage = getGeminiErrorMessage(error);

  return (
    normalizedMessage.includes('[429') ||
    normalizedMessage.includes('quota exceeded') ||
    normalizedMessage.includes('rate limit') ||
    normalizedMessage.includes('too many requests')
  );
};

export const isRetryableGeminiError = (error: unknown) => {
  const normalizedMessage = getGeminiErrorMessage(error);

  return (
    normalizedMessage.includes('[503') ||
    normalizedMessage.includes('high demand') ||
    normalizedMessage.includes('temporarily unavailable')
  );
};

const createModel = (apiKey: string, modelName: GeminiModelName, systemInstruction: string, useSearchGrounding = false) => {
  const client = new GoogleGenerativeAI(apiKey);

  return client.getGenerativeModel(
    {
      model: modelName,
      systemInstruction,
      // The Gemini API now expects the googleSearch tool instead of the
      // older googleSearchRetrieval shape for grounded web answers.
      tools: useSearchGrounding ? ([{ googleSearch: {} }] as never) : undefined,
    },
    {
      apiVersion: 'v1beta',
    },
  );
};

const uniqueCitations = (citations: Citation[]) => {
  const seen = new Set<string>();

  return citations.filter((citation) => {
    const key = `${citation.title}|${citation.uri}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const formatGeminiError = (error: unknown) => {
  if (isQuotaExceededGeminiError(error)) {
    const retryDelaySeconds = extractRetryDelaySeconds(error);

    if (retryDelaySeconds) {
      return `Gemini free-tier quota is temporarily exhausted. Please try again in about ${retryDelaySeconds} seconds, switch to another API key, or enable billing.`;
    }

    return 'Gemini free-tier quota is exhausted right now. Please try again shortly, switch to another API key, or enable billing.';
  }

  if (isRetryableGeminiError(error)) {
    return 'Gemini is under heavy demand right now. Please retry in a few moments.';
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'Gemini could not answer right now.';
};

export const fileToInlineData = (file: File) =>
  new Promise<{ mimeType: string; data: string }>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Could not read the selected file.'));
        return;
      }

      const [, base64 = ''] = result.split(',');
      resolve({
        mimeType: file.type || 'application/octet-stream',
        data: base64,
      });
    };

    reader.onerror = () => {
      reject(new Error('Could not read the selected file.'));
    };

    reader.readAsDataURL(file);
  });

export const generateGeminiText = async ({
  apiKey,
  systemInstruction,
  prompt,
  temperature = 0.4,
  maxOutputTokens = 900,
  useSearchGrounding = false,
  filePart,
}: PromptRequest) => {
  let lastError: unknown;
  const apiKeys = [...new Set((Array.isArray(apiKey) ? apiKey : [apiKey]).map((key) => key.trim()).filter(Boolean))];

  if (apiKeys.length === 0) {
    throw new Error('Missing Gemini API key. Add `VITE_GEMINI_API_KEY` or `VITE_GEMINI_API_KEYS` in `.env`.');
  }

  for (const key of apiKeys) {
    for (const modelName of GEMINI_MODELS) {
      const model = createModel(key, modelName, systemInstruction, useSearchGrounding);

      for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt += 1) {
        try {
          const parts = [{ text: prompt }];

          if (filePart) {
            parts.push({
              inlineData: {
                mimeType: filePart.mimeType,
                data: filePart.data,
              },
            } as never);
          }

          const result = await model.generateContent({
            contents: [
              {
                role: 'user',
                parts,
              },
            ],
            generationConfig: {
              temperature,
              maxOutputTokens,
            },
          });

          const text = result.response.text().trim();
          if (!text) {
            throw new Error('Gemini returned an empty response.');
          }

          const citations = uniqueCitations(
            (result.response.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
              .map((chunk) => chunk.web)
              .filter((web): web is { title?: string; uri?: string } => Boolean(web?.uri))
              .map((web) => ({
                title: web.title || 'Source',
                uri: web.uri || '',
              })),
          );

          return {
            text,
            modelName,
            citations,
          };
        } catch (error) {
          lastError = error;
          const shouldTryNextModel = isQuotaExceededGeminiError(error);
          const shouldRetrySameModel = isRetryableGeminiError(error) && attempt < MAX_RETRY_ATTEMPTS - 1;

          if (shouldTryNextModel) {
            break;
          }

          if (shouldRetrySameModel) {
            await sleep(1200 * (attempt + 1));
            continue;
          }

          if (!isRetryableGeminiError(error)) {
            throw error;
          }

          break;
        }
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Gemini could not answer right now.');
};
