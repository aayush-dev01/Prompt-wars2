import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Bot, ExternalLink, Loader2, MessageSquare, Mic, RotateCcw, Send, User, Volume2, VolumeX, X } from 'lucide-react';
import { formatGeminiError, GEMINI_MODELS, generateGeminiText, getGeminiApiKeys, type Citation } from '../lib/gemini';
import { sanitizeCitations, sanitizeExternalUrl } from '../lib/security';
import { useLanguage } from '../i18n/LanguageContext';

const SYSTEM_PROMPT = `You are the ElectED assistant.
You help users understand elections, voting processes, civic rights, democratic institutions, and public-interest participation in a neutral educational tone.
Rules:
1. Stay focused on elections, voting, government process, democratic institutions, and civic participation.
2. Do not endorse any political party, campaign, or candidate.
3. If a question is location-specific, date-specific, or law-specific, tell the user to verify the latest details with the official election authority in their jurisdiction.
4. Keep answers concise, practical, and easy to follow.`;

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
};

type ConnectionState = 'missing_key' | 'ready' | 'live' | 'error';

type SpeechRecognitionCtor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

const URL_PATTERN = /(https?:\/\/[^\s)]+)|(www\.[^\s)]+)/gi;
const STATUS_LABELS: Record<ConnectionState, string> = {
  live: 'Gemini connected',
  ready: 'Gemini key loaded',
  missing_key: 'Gemini key required',
  error: 'Gemini request failed',
};

const renderMessageWithLinks = (content: string) => {
  const lines = content.split('\n');

  return lines.map((line, lineIndex) => {
    const matches = Array.from(line.matchAll(URL_PATTERN));

    if (matches.length === 0) {
      return (
        <span key={`line-${lineIndex}`}>
          {line}
          {lineIndex < lines.length - 1 ? <br /> : null}
        </span>
      );
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((match, matchIndex) => {
      const rawUrl = match[0];
      const start = match.index ?? 0;
      const end = start + rawUrl.length;

      if (start > lastIndex) {
        parts.push(line.slice(lastIndex, start));
      }

      const href = sanitizeExternalUrl(rawUrl);
      if (!href) {
        parts.push(rawUrl);
        lastIndex = end;
        return;
      }

      parts.push(
        <a
          key={`link-${lineIndex}-${matchIndex}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all underline underline-offset-2 transition-opacity hover:opacity-80"
        >
          {rawUrl}
        </a>,
      );

      lastIndex = end;
    });

    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }

    return (
      <span key={`line-${lineIndex}`}>
        {parts}
        {lineIndex < lines.length - 1 ? <br /> : null}
      </span>
    );
  });
};

const AIAssistant = () => {
  const apiKeys = getGeminiApiKeys();
  const hasApiKey = apiKeys.length > 0;
  const { labels, geminiLanguageLabel } = useLanguage();
  const SpeechRecognition = typeof window !== 'undefined' ? ((window as Window & { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition ||
    (window as Window & { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition) : undefined;
  const hasVoiceInput = Boolean(SpeechRecognition);
  const hasVoiceOutput = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: labels.assistant.welcome,
    },
  ]);
  const [hasUnread, setHasUnread] = useState(true);
  const [connectionState, setConnectionState] = useState<ConnectionState>(hasApiKey ? 'ready' : 'missing_key');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeModel, setActiveModel] = useState<(typeof GEMINI_MODELS)[number]>(GEMINI_MODELS[0]);
  const [isListening, setIsListening] = useState(false);
  const [voiceRepliesEnabled, setVoiceRepliesEnabled] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<InstanceType<SpeechRecognitionCtor> | null>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    setMessages((currentMessages) =>
      currentMessages.map((message, index) =>
        index === 0 && message.id === 'welcome'
          ? { ...message, content: labels.assistant.welcome }
          : message,
      ),
    );
  }, [labels.assistant.welcome]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setHasUnread(false);
      window.setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen, messages]);

  const clearChat = () => {
    setMessages([{ id: 'welcome', role: 'assistant', content: labels.assistant.welcome }]);
    setInput('');
    setErrorMessage('');
    setConnectionState(hasApiKey ? 'ready' : 'missing_key');
    setActiveModel(GEMINI_MODELS[0]);
    setIsListening(false);
    recognitionRef.current?.stop();
    if (hasVoiceOutput) {
      window.speechSynthesis.cancel();
    }
  };

  const handleToggle = () => {
    setIsOpen((open) => !open);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  const handleSend = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const userMessage = input.trim();
    if (!userMessage || isTyping) return;

    const nextConversation = [...messages, { id: `${Date.now()}`, role: 'user' as const, content: userMessage }];
    setMessages(nextConversation);
    setInput('');
    setIsTyping(true);
    setErrorMessage('');

    try {
      if (apiKeys.length === 0) {
        throw new Error('Missing Gemini API key. Add `VITE_GEMINI_API_KEY` or `VITE_GEMINI_API_KEYS` in `.env` to continue.');
      }

      const transcript = nextConversation
        .map((message) => `${message.role === 'assistant' ? 'Assistant' : 'User'}: ${message.content}`)
        .join('\n\n');

      const { text: reply, modelName, citations } = await generateGeminiText({
        apiKey: apiKeys,
        systemInstruction: SYSTEM_PROMPT,
        prompt: `Respond in ${geminiLanguageLabel}. Continue this conversation naturally and answer the latest user message. When reliable web sources are available, use them and include direct official or primary-source links when they would help the user.\n\n${transcript}`,
        temperature: 0.5,
        maxOutputTokens: 500,
        useSearchGrounding: true,
      });

      setMessages((currentMessages) => [
        ...currentMessages,
        { id: `${Date.now()}-assistant`, role: 'assistant', content: reply, citations: sanitizeCitations(citations) },
      ]);
      setConnectionState('live');
      setActiveModel(modelName);

      if (voiceRepliesEnabled && hasVoiceOutput) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(reply);
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (error) {
      console.error('Gemini assistant error:', error);
      setConnectionState(hasApiKey ? 'error' : 'missing_key');
      setErrorMessage(formatGeminiError(error));
    } finally {
      setIsTyping(false);
    }
  };

  const toggleListening = () => {
    if (!hasVoiceInput || isTyping) {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!SpeechRecognition) {
      setErrorMessage('Voice input is not available in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0]?.transcript || '')
          .join(' ')
          .trim();

        setInput(transcript);
      };

      recognition.onerror = (event) => {
        setErrorMessage(event.error === 'not-allowed' ? 'Microphone permission was denied.' : 'Voice input failed. Please try again.');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setErrorMessage('');
      setIsListening(true);
    } catch {
      setErrorMessage('Voice input is not available in this browser.');
      setIsListening(false);
    }
  };

  const toggleVoiceReplies = () => {
    if (!hasVoiceOutput) {
      setErrorMessage('Voice playback is not available in this browser.');
      return;
    }

    const nextValue = !voiceRepliesEnabled;
    setVoiceRepliesEnabled(nextValue);

    if (!nextValue) {
      window.speechSynthesis.cancel();
    }
  };

  const statusLabel = STATUS_LABELS[connectionState];

  const statusDotClass =
    connectionState === 'live'
      ? 'bg-green-400 animate-pulse'
      : connectionState === 'ready'
      ? 'bg-sky-300'
      : connectionState === 'missing_key'
      ? 'bg-amber-300'
      : 'bg-rose-400';

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full bg-primary p-4 text-primary-foreground shadow-2xl shadow-primary/30"
        aria-label={labels.assistant.open}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls="ai-assistant-dialog"
      >
        <MessageSquare className="h-6 w-6" />
        {hasUnread && <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-background bg-red-500" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', bounce: 0.25, duration: 0.45 }}
            className="fixed bottom-6 right-6 z-50 flex h-[620px] max-h-[80vh] w-[90vw] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl sm:w-[400px]"
            id="ai-assistant-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-assistant-title"
            aria-describedby="ai-assistant-description"
          >
            <div className="relative flex items-center justify-between overflow-hidden bg-primary p-4 text-primary-foreground">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent opacity-10" />

              <div className="relative z-10 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/20 backdrop-blur-sm">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 id="ai-assistant-title" className="font-bold">
                    {labels.assistant.title}
                  </h3>
                  <div className="flex items-center text-xs text-primary-foreground/80" role="status" aria-live="polite">
                    <span className={`mr-1.5 h-2 w-2 rounded-full ${statusDotClass}`} />
                    {statusLabel}
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-1">
                <button
                  onClick={toggleVoiceReplies}
                  title={voiceRepliesEnabled ? 'Disable voice replies' : 'Enable voice replies'}
                  className="rounded-full p-2 transition-colors hover:bg-background/20"
                  aria-label={voiceRepliesEnabled ? 'Disable voice replies' : 'Enable voice replies'}
                >
                  {voiceRepliesEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  onClick={clearChat}
                  title="Clear conversation"
                  className="rounded-full p-2 transition-colors hover:bg-background/20"
                  aria-label="Clear conversation"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 transition-colors hover:bg-background/20"
                  aria-label="Close assistant"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div id="ai-assistant-description" className="border-b border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
              {labels.assistant.educational}
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2 border-b border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700" role="alert">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="chat-scroll flex-grow space-y-4 overflow-y-auto bg-muted/20 p-4" role="log" aria-live="polite" aria-relevant="additions text">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[85%] items-end gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        message.role === 'user'
                          ? 'bg-secondary text-secondary-foreground'
                          : 'border border-primary/20 bg-primary/10 text-primary'
                      }`}
                    >
                      {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>

                    <div
                      className={`rounded-2xl p-3 text-sm leading-relaxed ${
                        message.role === 'user'
                          ? 'rounded-br-sm bg-primary text-primary-foreground'
                          : 'rounded-bl-sm border border-border bg-card text-foreground shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{renderMessageWithLinks(message.content)}</div>
                      {message.role === 'assistant' && message.citations && message.citations.length > 0 && (
                        <div className="mt-3 space-y-2 border-t border-border/70 pt-3">
                          {message.citations.slice(0, 4).map((citation) => (
                            <a
                              key={`${message.id}-${citation.uri}`}
                              href={citation.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{citation.title}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start" role="status" aria-live="polite">
                  <div className="flex max-w-[85%] items-end gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                      <Bot size={16} />
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border bg-card p-4 shadow-sm">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">{labels.assistant.thinking}</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border bg-card p-4">
              <form onSubmit={handleSend} className="flex gap-2">
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={!hasVoiceInput || isTyping}
                  className={`rounded-2xl border p-3 transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                    isListening
                      ? 'border-red-300 bg-red-50 text-red-600'
                      : 'border-border bg-secondary text-foreground hover:border-primary/30'
                  }`}
                  aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                  title={hasVoiceInput ? (isListening ? 'Stop voice input' : 'Start voice input') : 'Voice input not supported in this browser'}
                >
                  <Mic className="h-5 w-5" />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={labels.assistant.placeholder}
                  className="flex-grow rounded-2xl border border-transparent bg-secondary px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isTyping}
                  aria-label={labels.assistant.placeholder}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="rounded-2xl bg-primary p-3 text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
              <div className="mt-2 text-center">
                <span className="text-[10px] text-muted-foreground">
                  {hasApiKey
                    ? `Using ${activeModel} through the Gemini API.`
                    : 'Add `VITE_GEMINI_API_KEY` or `VITE_GEMINI_API_KEYS` to enable the assistant.'}
                </span>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {hasVoiceInput || hasVoiceOutput
                    ? `${hasVoiceInput ? labels.assistant.micAvailable : labels.assistant.micUnavailable} • ${voiceRepliesEnabled ? labels.assistant.voiceRepliesOn : labels.assistant.voiceRepliesOff}`
                    : 'Voice features depend on browser support.'}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
