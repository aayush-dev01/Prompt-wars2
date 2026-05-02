/**
 * VotePath AI - Google Cloud Utilities
 * Implements Cloud Translation and Cloud Natural Language (Sentiment Analysis)
 * Note: In a true backend environment, this uses @google-cloud/translate and @google-cloud/language.
 * For this client-side hackathon integration, this provides the REST abstraction.
 */

// --- Cloud Translate ---
export const translateText = async (text: string, targetLanguage: string, apiKey?: string): Promise<string> => {
  if (!text || !targetLanguage) return text;
  
  if (!apiKey) {
    // Graceful fallback for demo/hackathon purposes when API key isn't provided
    console.warn('Cloud Translation API Key missing. Falling back to original text.');
    return text;
  }

  try {
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
      }),
    });

    if (!response.ok) throw new Error('Translation failed');
    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
};

// --- Cloud Natural Language (Sentiment Analysis) ---
export interface SentimentResult {
  score: number; // -1.0 to 1.0
  magnitude: number; // 0.0 to +inf
  isPositive: boolean;
  isNegative: boolean;
  isNeutral: boolean;
}

export const analyzeSentiment = async (text: string, apiKey?: string): Promise<SentimentResult> => {
  const defaultNeutral = {
    score: 0,
    magnitude: 0,
    isPositive: false,
    isNegative: false,
    isNeutral: true,
  };

  if (!text) return defaultNeutral;

  if (!apiKey) {
    console.warn('Cloud Natural Language API Key missing. Using heuristic fallback.');
    return _heuristicSentiment(text);
  }

  try {
    const response = await fetch(`https://language.googleapis.com/v1/documents:analyzeSentiment?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document: {
          type: 'PLAIN_TEXT',
          content: text,
        },
        encodingType: 'UTF8',
      }),
    });

    if (!response.ok) throw new Error('Sentiment analysis failed');
    
    const data = await response.json();
    const { score, magnitude } = data.documentSentiment;
    
    return {
      score,
      magnitude,
      isPositive: score > 0.2,
      isNegative: score < -0.2,
      isNeutral: score >= -0.2 && score <= 0.2,
    };
  } catch (error) {
    console.error('Sentiment error:', error);
    return _heuristicSentiment(text);
  }
};

// Simple offline fallback to ensure the app never breaks
const _heuristicSentiment = (text: string): SentimentResult => {
  const lower = text.toLowerCase();
  const positiveWords = ['good', 'great', 'awesome', 'excellent', 'happy', 'yes', 'agree', 'thanks'];
  const negativeWords = ['bad', 'terrible', 'awful', 'sad', 'angry', 'no', 'disagree', 'hate'];
  
  let score = 0;
  positiveWords.forEach(w => { if (lower.includes(w)) score += 0.5; });
  negativeWords.forEach(w => { if (lower.includes(w)) score -= 0.5; });
  
  // Cap at -1 to 1
  score = Math.max(-1, Math.min(1, score));
  
  return {
    score,
    magnitude: Math.abs(score),
    isPositive: score > 0.2,
    isNegative: score < -0.2,
    isNeutral: score >= -0.2 && score <= 0.2,
  };
};
