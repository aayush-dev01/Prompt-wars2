import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  Copy,
  Database,
  Download,
  ExternalLink,
  FileSearch,
  FileText,
  Globe2,
  Languages,
  LibraryBig,
  Link as LinkIcon,
  Loader2,
  LogIn,
  MapPinned,
  Save,
  SearchCheck,
  ShieldAlert,
  Share2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { SCENARIO_PRESETS, TOOL_LABELS } from '../data/actionCenterData';
import { fileToInlineData, formatGeminiError, generateGeminiText, GEMINI_MODELS, getGeminiApiKeys, type Citation, type GeminiModelName } from '../lib/gemini';
import { sanitizeCitations, sanitizeDownloadFilename, validateUploadedDocument } from '../lib/security';
import { downloadTextFile, copyText, shareText } from '../lib/share';
import { getSaveOriginLabel, loadSavedSessions, removeSession, saveSession, type SavedSession, type SavedSessionKind } from '../lib/sessionStore';
import { useLanguage } from '../i18n/LanguageContext';
import { hasFirebaseAnalytics, hasFirebaseStorage, hasGoogleAuth, signInWithGoogle, uploadFileToCloudStorage, uploadTextToCloudStorage } from '../lib/firebase';
import { useGoogleAuthState } from '../hooks/useGoogleAuthState';

type GeminiTextResult = Awaited<ReturnType<typeof generateGeminiText>>;

const RESEARCH_PROMPT = `You are an election research assistant.
Answer neutrally and clearly.
Use grounded web search context when available.
If facts vary by location or time, say so explicitly and advise the user to verify with the official election authority.
Do not endorse political actors.
Keep the answer practical and calm.
Respond in the user's selected language.`;

const PLAN_PROMPT = `You are a civic planning assistant.
Create a personalized, practical voting plan using only the user's details.
Do not invent legal deadlines.
Mark location-specific or deadline-specific items as "verify locally."
Use these headings exactly:
Overview
Priority Checklist
What To Verify Officially
Election-Day Backup Plan
Respond in the user's selected language.`;

const DOCUMENT_PROMPT = `You are a neutral civic explainer.
The user may upload a voter notice, ballot, election guide, poster, screenshot, or manifesto.
Explain it in plain language.
Extract deadlines, required documents, actions, risks, and ambiguous parts.
If the file looks political, remain nonpartisan and summarize rather than persuading.
Use these headings exactly:
What This Is
Important Details
What To Do Next
What To Verify
Respond in the user's selected language.`;

const CLAIM_PROMPT = `You are an election misinformation checker.
Evaluate the user's claim in a neutral tone.
Use grounded web search context when available.
Start with exactly one verdict line: Verdict: Confirmed, Verdict: Unclear, or Verdict: Likely misleading.
Then use these headings:
Why This Verdict
What A Voter Should Check Next
Official Sources To Verify
Do not overclaim certainty.
Respond in the user's selected language.`;

const BALLOT_PROMPT = `You are a neutral ballot and manifesto explainer.
Explain the user's pasted ballot text, proposition, measure, speech excerpt, or manifesto section in plain language.
Do not advocate for a side.
Use these headings exactly:
Plain-Language Meaning
Who It Affects
Potential Tradeoffs
What To Verify
Respond in the user's selected language.`;

const SCENARIO_PROMPT = `You are a calm civic scenario simulator.
The user wants practical help for a voting problem.
Do not invent laws or deadlines.
Use these headings exactly:
Likely Situation
Best Next Steps
Fastest Official Checks
If Things Go Wrong
Respond in the user's selected language.`;

const supportedFileLabel = 'PDF, TXT, PNG, JPG, or WEBP up to 10 MB';

const cardClass = 'rounded-[2rem] border border-border bg-card/90 p-6 shadow-lg shadow-slate-900/5';
const inputClass =
  'w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20';

const formatLanguageHint = (language: string) => `Respond in ${language}.`;

const buildExportBlock = (title: string, content: string, citations: Citation[] = []) => {
  const safeCitations = sanitizeCitations(citations);
  const sourceText =
    safeCitations.length > 0
      ? `\n\nSources\n${safeCitations.map((citation) => `- ${citation.title}: ${citation.uri}`).join('\n')}`
      : '';

  return `${title}\n\n${content}${sourceText}`;
};

const ResultPanel = ({
  title,
  modelName,
  content,
  citations = [],
  onSave,
  onCopy,
  onShare,
  onDownload,
  onCloudSync,
}: {
  title: string;
  modelName: GeminiModelName;
  content: string;
  citations?: Citation[];
  onSave?: () => void;
  onCopy?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  onCloudSync?: () => void;
}) => {
  const safeCitations = sanitizeCitations(citations);

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold">{title}</h3>
          <span className="mt-2 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            {modelName}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {onSave && (
            <button onClick={onSave} className="rounded-full border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary/40 hover:bg-secondary/60">
              <Save className="mr-1 inline h-3.5 w-3.5" />
              Save
            </button>
          )}
          {onCopy && (
            <button onClick={onCopy} className="rounded-full border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary/40 hover:bg-secondary/60">
              <Copy className="mr-1 inline h-3.5 w-3.5" />
              Copy
            </button>
          )}
          {onShare && (
            <button onClick={onShare} className="rounded-full border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary/40 hover:bg-secondary/60">
              <Share2 className="mr-1 inline h-3.5 w-3.5" />
              Share
            </button>
          )}
          {onDownload && (
            <button onClick={onDownload} className="rounded-full border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary/40 hover:bg-secondary/60">
              <Download className="mr-1 inline h-3.5 w-3.5" />
              Export
            </button>
          )}
          {onCloudSync && (
            <button onClick={onCloudSync} className="rounded-full border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary/40 hover:bg-secondary/60">
              <Cloud className="mr-1 inline h-3.5 w-3.5" />
              Sync to Google Cloud
            </button>
          )}
        </div>
      </div>

      <div className="whitespace-pre-wrap text-sm leading-7 text-foreground/90">{content}</div>

      {safeCitations.length > 0 && (
        <div className="mt-6 border-t border-border pt-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <LinkIcon className="h-4 w-4 text-primary" />
            Sources
          </div>
          <div className="space-y-2">
            {safeCitations.map((citation) => (
              <a
                key={`${citation.title}-${citation.uri}`}
                href={citation.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl border border-border bg-background px-4 py-3 text-sm transition-colors hover:border-primary/40 hover:bg-secondary/40"
              >
                <div className="font-semibold text-foreground">{citation.title}</div>
                <div className="truncate text-xs text-muted-foreground">{citation.uri}</div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const NOTICE_TIMEOUT_MS = 2500;

const ActionCenter = () => {
  const apiKeys = getGeminiApiKeys();
  const hasApiKey = apiKeys.length > 0;
  const { labels, geminiLanguageLabel } = useLanguage();
  const { user, loading: authLoading, isSignedIn } = useGoogleAuthState();
  const noticeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [saveNotice, setSaveNotice] = useState('');
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [googleAuthError, setGoogleAuthError] = useState('');

  const [groundedQuestion, setGroundedQuestion] = useState('');
  const [groundedAnswer, setGroundedAnswer] = useState('');
  const [groundedCitations, setGroundedCitations] = useState<Citation[]>([]);
  const [groundedModel, setGroundedModel] = useState<GeminiModelName>(GEMINI_MODELS[0]);
  const [groundedLoading, setGroundedLoading] = useState(false);
  const [groundedError, setGroundedError] = useState('');

  const [planForm, setPlanForm] = useState({
    country: '',
    stateOrRegion: '',
    electionType: '',
    votingMethod: '',
    electionDate: '',
    concerns: '',
  });
  const [planResult, setPlanResult] = useState('');
  const [planModel, setPlanModel] = useState<GeminiModelName>(GEMINI_MODELS[0]);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState('');

  const [docQuestion, setDocQuestion] = useState('Explain this document in plain language and tell me what I should do next.');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docResult, setDocResult] = useState('');
  const [docModel, setDocModel] = useState<GeminiModelName>(GEMINI_MODELS[0]);
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState('');
  const [docCloudPath, setDocCloudPath] = useState('');
  const [docCloudUrl, setDocCloudUrl] = useState('');
  const [docCloudLoading, setDocCloudLoading] = useState(false);

  const [claimText, setClaimText] = useState('');
  const [claimContext, setClaimContext] = useState('');
  const [claimResult, setClaimResult] = useState('');
  const [claimModel, setClaimModel] = useState<GeminiModelName>(GEMINI_MODELS[0]);
  const [claimCitations, setClaimCitations] = useState<Citation[]>([]);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState('');

  const [ballotText, setBallotText] = useState('');
  const [ballotResult, setBallotResult] = useState('');
  const [ballotModel, setBallotModel] = useState<GeminiModelName>(GEMINI_MODELS[0]);
  const [ballotLoading, setBallotLoading] = useState(false);
  const [ballotError, setBallotError] = useState('');

  const [scenarioId, setScenarioId] = useState<(typeof SCENARIO_PRESETS)[number]['id']>(SCENARIO_PRESETS[0].id);
  const [scenarioNotes, setScenarioNotes] = useState('');
  const [scenarioResult, setScenarioResult] = useState('');
  const [scenarioModel, setScenarioModel] = useState<GeminiModelName>(GEMINI_MODELS[0]);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [scenarioError, setScenarioError] = useState('');

  const selectedScenario = useMemo(
    () => SCENARIO_PRESETS.find((scenario) => scenario.id === scenarioId) || SCENARIO_PRESETS[0],
    [scenarioId],
  );

  const showNotice = (message: string) => {
    if (noticeTimeoutRef.current) {
      clearTimeout(noticeTimeoutRef.current);
    }

    setSaveNotice(message);
    noticeTimeoutRef.current = setTimeout(() => {
      setSaveNotice('');
      noticeTimeoutRef.current = null;
    }, NOTICE_TIMEOUT_MS);
  };

  useEffect(() => {
    const loadSessions = async () => {
      setSessionsLoading(true);
      const sessions = await loadSavedSessions(user?.uid);
      setSavedSessions(sessions);
      setSessionsLoading(false);
    };

    void loadSessions();
  }, [user?.uid]);

  useEffect(() => () => {
    if (noticeTimeoutRef.current) {
      clearTimeout(noticeTimeoutRef.current);
    }
  }, []);

  const ensureApiKey = () => {
    if (apiKeys.length === 0) {
      throw new Error('Missing Gemini API key. Add `VITE_GEMINI_API_KEY` or `VITE_GEMINI_API_KEYS` in `.env` to use the Action Center.');
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleAuthError('');

    try {
      await signInWithGoogle();
      showNotice('Google account connected.');
    } catch (error) {
      setGoogleAuthError(error instanceof Error ? error.message : 'Google Sign-In could not be completed.');
    }
  };

  const persistSession = async ({
    kind,
    title,
    summary,
    content,
    citations,
    modelName,
  }: {
    kind: SavedSessionKind;
    title: string;
    summary: string;
    content: string;
    citations?: Citation[];
    modelName: GeminiModelName;
  }) => {
    const saved = await saveSession({
      kind,
      title,
      summary,
      content,
      citations,
      language: geminiLanguageLabel,
      modelName,
      userId: user?.uid,
    });
    setSavedSessions((current) => [saved, ...current.filter((item) => item.id !== saved.id)].slice(0, 40));
    showNotice(user?.uid ? `${title} saved to your Google-backed workspace.` : `${title} saved locally on this device.`);
  };

  const runCopy = async (title: string, content: string, citations: Citation[] = []) => {
    try {
      await copyText(buildExportBlock(title, content, citations));
      showNotice(`${title} copied.`);
    } catch {
      showNotice('Copy failed on this device.');
    }
  };

  const runShare = async (title: string, content: string, citations: Citation[] = []) => {
    try {
      await shareText(title, buildExportBlock(title, content, citations));
    } catch {
      showNotice('Share is not available here.');
    }
  };

  const runExport = (title: string, content: string, citations: Citation[] = []) => {
    downloadTextFile(sanitizeDownloadFilename(`${title}.txt`), buildExportBlock(title, content, citations));
    showNotice(`${title} exported.`);
  };

  const runCloudSync = async (title: string, content: string, citations: Citation[] = [], folder = 'action-center-exports') => {
    if (!user?.uid) {
      showNotice('Sign in with Google to sync this result to Cloud Storage.');
      return;
    }

    if (!hasFirebaseStorage) {
      showNotice('Firebase Storage is not configured yet for this deployment.');
      return;
    }

    try {
      const asset = await uploadTextToCloudStorage({
        filename: sanitizeDownloadFilename(`${title}.txt`),
        content: buildExportBlock(title, content, citations),
        userId: user.uid,
        folder,
      });

      showNotice(`Synced to Google Cloud Storage: ${asset.path}`);
    } catch (error) {
      showNotice(error instanceof Error ? error.message : 'Cloud sync failed.');
    }
  };

  const runGeminiTask = async ({
    setLoading,
    setError,
    request,
    onSuccess,
  }: {
    setLoading: (value: boolean) => void;
    setError: (value: string) => void;
    request: () => Promise<GeminiTextResult>;
    onSuccess: (result: GeminiTextResult) => void;
  }) => {
    setLoading(true);
    setError('');

    try {
      ensureApiKey();
      const result = await request();
      onSuccess(result);
    } catch (error) {
      setError(formatGeminiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGroundedSearch = async () => {
    if (!groundedQuestion.trim() || groundedLoading) return;

    await runGeminiTask({
      setLoading: setGroundedLoading,
      setError: setGroundedError,
      request: () =>
        generateGeminiText({
          apiKey: apiKeys,
          systemInstruction: RESEARCH_PROMPT,
          prompt: `${formatLanguageHint(geminiLanguageLabel)}

Question: ${groundedQuestion}

Answer with practical steps and point to official verification where useful.`,
          useSearchGrounding: true,
          temperature: 0.2,
          maxOutputTokens: 750,
        }),
      onSuccess: (result) => {
        setGroundedAnswer(result.text);
        setGroundedCitations(sanitizeCitations(result.citations));
        setGroundedModel(result.modelName);
      },
    });
  };

  const handlePlanBuild = async () => {
    if (planLoading) return;

    await runGeminiTask({
      setLoading: setPlanLoading,
      setError: setPlanError,
      request: () =>
        generateGeminiText({
          apiKey: apiKeys,
          systemInstruction: PLAN_PROMPT,
          prompt: `${formatLanguageHint(geminiLanguageLabel)}

Build a personalized voting plan from this information:
Country: ${planForm.country || 'Not provided'}
State or region: ${planForm.stateOrRegion || 'Not provided'}
Election type: ${planForm.electionType || 'Not provided'}
Preferred voting method: ${planForm.votingMethod || 'Not provided'}
Election date: ${planForm.electionDate || 'Not provided'}
Special concerns or constraints: ${planForm.concerns || 'Not provided'}`,
          temperature: 0.3,
          maxOutputTokens: 950,
        }),
      onSuccess: (result) => {
        setPlanResult(result.text);
        setPlanModel(result.modelName);
      },
    });
  };

  const handleDocumentExplain = async () => {
    if (!docFile || docLoading) return;

    setDocCloudPath('');
    setDocCloudUrl('');

    await runGeminiTask({
      setLoading: setDocLoading,
      setError: setDocError,
      request: async () => {
        const validationError = validateUploadedDocument(docFile);
        if (validationError) {
          throw new Error(validationError);
        }

        if (user?.uid && hasFirebaseStorage) {
          setDocCloudLoading(true);

          try {
            const cloudAsset = await uploadFileToCloudStorage({
              file: docFile,
              userId: user.uid,
              folder: 'action-center-documents',
            });

            setDocCloudPath(cloudAsset.path);
            setDocCloudUrl(cloudAsset.downloadUrl);
          } finally {
            setDocCloudLoading(false);
          }
        }

        const inlineData = await fileToInlineData(docFile);
        return generateGeminiText({
          apiKey: apiKeys,
          systemInstruction: DOCUMENT_PROMPT,
          prompt: `${formatLanguageHint(geminiLanguageLabel)}

User request: ${docQuestion}

If the file contains dates, deadlines, eligibility rules, or required documents, highlight them clearly.`,
          filePart: inlineData,
          temperature: 0.2,
          maxOutputTokens: 1150,
        });
      },
      onSuccess: (result) => {
        setDocResult(result.text);
        setDocModel(result.modelName);
      },
    });
  };

  const handleClaimCheck = async () => {
    if (!claimText.trim() || claimLoading) return;

    await runGeminiTask({
      setLoading: setClaimLoading,
      setError: setClaimError,
      request: () =>
        generateGeminiText({
          apiKey: apiKeys,
          systemInstruction: CLAIM_PROMPT,
          prompt: `${formatLanguageHint(geminiLanguageLabel)}

Claim to verify:
${claimText}

Extra context:
${claimContext || 'None provided'}

Check whether this claim is reliable for voters right now.`,
          useSearchGrounding: true,
          temperature: 0.1,
          maxOutputTokens: 800,
        }),
      onSuccess: (result) => {
        setClaimResult(result.text);
        setClaimCitations(sanitizeCitations(result.citations));
        setClaimModel(result.modelName);
      },
    });
  };

  const handleBallotExplain = async () => {
    if (!ballotText.trim() || ballotLoading) return;

    await runGeminiTask({
      setLoading: setBallotLoading,
      setError: setBallotError,
      request: () =>
        generateGeminiText({
          apiKey: apiKeys,
          systemInstruction: BALLOT_PROMPT,
          prompt: `${formatLanguageHint(geminiLanguageLabel)}

Explain this text neutrally:
${ballotText}`,
          temperature: 0.25,
          maxOutputTokens: 850,
        }),
      onSuccess: (result) => {
        setBallotResult(result.text);
        setBallotModel(result.modelName);
      },
    });
  };

  const handleScenarioRun = async () => {
    if (scenarioLoading) return;

    await runGeminiTask({
      setLoading: setScenarioLoading,
      setError: setScenarioError,
      request: () =>
        generateGeminiText({
          apiKey: apiKeys,
          systemInstruction: SCENARIO_PROMPT,
          prompt: `${formatLanguageHint(geminiLanguageLabel)}

Scenario: ${selectedScenario.title}
Baseline description: ${selectedScenario.description}
User details: ${scenarioNotes || 'No extra details provided.'}

Keep it practical and tell the user what they should verify with official sources.`,
          useSearchGrounding: true,
          temperature: 0.25,
          maxOutputTokens: 900,
        }),
      onSuccess: (result) => {
        setScenarioResult(result.text);
        setScenarioModel(result.modelName);
      },
    });
  };

  const deleteSession = async (id: string) => {
    await removeSession(id);
    setSavedSessions((current) => current.filter((session) => session.id !== id));
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-10 shadow-lg shadow-slate-900/5 sm:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(22,50,79,0.14),_transparent_32%),radial-gradient(circle_at_80%_20%,_rgba(194,65,12,0.12),_transparent_28%)]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-semibold text-muted-foreground">
              <Sparkles className="h-4 w-4 text-accent" />
              {labels.actionCenter.heroBadge}
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">{labels.actionCenter.heroTitle}</h1>
            <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {labels.actionCenter.heroBody}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="rounded-full border border-border bg-background/70 px-3 py-1.5">{labels.actionCenter.geminiOnly}</span>
              <span className="rounded-full border border-border bg-background/70 px-3 py-1.5">{getSaveOriginLabel(user?.uid) === 'Local browser save' ? labels.actionCenter.saveModeLocal : labels.actionCenter.saveModeHybrid}</span>
              <span className="rounded-full border border-border bg-background/70 px-3 py-1.5">{labels.actionCenter.zeroBudget}</span>
              <span className="rounded-full border border-border bg-background/70 px-3 py-1.5">{isSignedIn ? 'Google Sign-In active' : 'Google Sign-In available'}</span>
              <span className="rounded-full border border-border bg-background/70 px-3 py-1.5">{hasFirebaseStorage ? 'Cloud Storage ready' : 'Cloud Storage pending'}</span>
            </div>
          </div>

          <div className="w-full max-w-sm rounded-3xl border border-border bg-background/85 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Languages className="h-4 w-4 text-primary" />
              {labels.actionCenter.outputLanguage}
            </div>
            <div className={`${inputClass} flex items-center bg-card text-muted-foreground`}>{geminiLanguageLabel}</div>
            <div className="mt-3 text-xs text-muted-foreground">{labels.actionCenter.outputLanguageBody}</div>
            <div className="mt-4 rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 text-sm font-semibold text-foreground">Google services</div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2"><Cloud className="h-4 w-4 text-primary" /> Google Sign-In</span>
                  <span>{authLoading ? 'Checking...' : isSignedIn ? 'Connected' : hasGoogleAuth ? 'Ready' : 'Setup needed'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2"><Database className="h-4 w-4 text-primary" /> Firestore sync</span>
                  <span>{user?.uid ? 'User-scoped' : 'Local fallback'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2"><Cloud className="h-4 w-4 text-primary" /> Cloud Storage</span>
                  <span>{hasFirebaseStorage ? 'Ready' : 'Setup needed'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Analytics</span>
                  <span>{hasFirebaseAnalytics ? 'Tracking routes' : 'Setup needed'}</span>
                </div>
              </div>
              {!isSignedIn && hasGoogleAuth && (
                <button onClick={() => void handleGoogleSignIn()} className="mt-4 inline-flex items-center rounded-2xl border border-border px-4 py-2 text-sm font-semibold transition hover:border-primary/40 hover:bg-secondary">
                  <LogIn className="mr-2 h-4 w-4" />
                  Connect Google account
                </button>
              )}
            </div>
          </div>
        </div>

        {!hasApiKey && (
          <div className="relative z-10 mt-6 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="alert">
            {labels.actionCenter.missingKey}
          </div>
        )}
        {saveNotice && (
          <div className="relative z-10 mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status" aria-live="polite">
            {saveNotice}
          </div>
        )}
        {googleAuthError && (
          <div className="relative z-10 mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
            {googleAuthError}
          </div>
        )}
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.55fr_1fr]">
        <div className="grid gap-8">
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <SearchCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Grounded Q&A</h2>
                <p className="text-sm text-muted-foreground">Ask a live question and get Gemini answers with verification links.</p>
              </div>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-foreground">Question</span>
              <textarea value={groundedQuestion} onChange={(event) => setGroundedQuestion(event.target.value)} placeholder="What documents should a first-time voter usually verify before election day in my state?" className={`${inputClass} min-h-32 resize-none`} />
            </label>
            <button onClick={handleGroundedSearch} disabled={!groundedQuestion.trim() || groundedLoading} className="mt-4 inline-flex items-center rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
              {groundedLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SearchCheck className="mr-2 h-4 w-4" />}
              Ask with sources
            </button>
            {groundedError && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{groundedError}</div>}
            {groundedAnswer && (
              <div className="mt-5">
                <ResultPanel
                  title="Grounded answer"
                  modelName={groundedModel}
                  content={groundedAnswer}
                  citations={groundedCitations}
                  onSave={() =>
                    void persistSession({
                      kind: 'grounded_answer',
                      title: 'Grounded answer',
                      summary: groundedQuestion.slice(0, 110),
                      content: groundedAnswer,
                      citations: groundedCitations,
                      modelName: groundedModel,
                    })
                  }
                  onCopy={() => void runCopy('Grounded answer', groundedAnswer, groundedCitations)}
                  onShare={() => void runShare('Grounded answer', groundedAnswer, groundedCitations)}
                  onDownload={() => runExport('Grounded answer', groundedAnswer, groundedCitations)}
                  onCloudSync={() => void runCloudSync('Grounded answer', groundedAnswer, groundedCitations, 'grounded-answers')}
                />
              </div>
            )}
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className={cardClass}>
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-accent/10 p-3 text-accent">
                <MapPinned className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">My Voting Plan</h2>
                <p className="text-sm text-muted-foreground">Personalized checklist plus export and sharing for demo-ready output.</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input value={planForm.country} onChange={(event) => setPlanForm((current) => ({ ...current, country: event.target.value }))} placeholder="Country" className={inputClass} aria-label="Country" />
              <input value={planForm.stateOrRegion} onChange={(event) => setPlanForm((current) => ({ ...current, stateOrRegion: event.target.value }))} placeholder="State or region" className={inputClass} aria-label="State or region" />
              <input value={planForm.electionType} onChange={(event) => setPlanForm((current) => ({ ...current, electionType: event.target.value }))} placeholder="Election type" className={inputClass} aria-label="Election type" />
              <input value={planForm.votingMethod} onChange={(event) => setPlanForm((current) => ({ ...current, votingMethod: event.target.value }))} placeholder="Preferred voting method" className={inputClass} aria-label="Preferred voting method" />
              <input type="date" value={planForm.electionDate} onChange={(event) => setPlanForm((current) => ({ ...current, electionDate: event.target.value }))} className={inputClass} aria-label="Election date" />
              <div className="rounded-2xl border border-border bg-background px-4 py-3 text-xs text-muted-foreground">
                Tip: mention missing ID, travel, accessibility needs, mail ballot worries, or first-time voter anxiety.
              </div>
              <textarea value={planForm.concerns} onChange={(event) => setPlanForm((current) => ({ ...current, concerns: event.target.value }))} placeholder="Special concerns or constraints" className={`${inputClass} min-h-28 resize-none md:col-span-2`} aria-label="Special concerns or constraints" />
            </div>
            <button onClick={handlePlanBuild} disabled={planLoading} className="mt-4 inline-flex items-center rounded-2xl bg-accent px-5 py-3 text-sm font-bold text-accent-foreground transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50">
              {planLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPinned className="mr-2 h-4 w-4" />}
              Build my plan
            </button>
            {planError && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{planError}</div>}
            {planResult && (
              <div className="mt-5">
                <ResultPanel
                  title="Personalized voting plan"
                  modelName={planModel}
                  content={planResult}
                  onSave={() =>
                    void persistSession({
                      kind: 'voting_plan',
                      title: 'Voting plan',
                      summary: `${planForm.country || 'Unknown country'} · ${planForm.electionType || 'Election plan'}`,
                      content: planResult,
                      modelName: planModel,
                    })
                  }
                  onCopy={() => void runCopy('Voting plan', planResult)}
                  onShare={() => void runShare('Voting plan', planResult)}
                  onDownload={() => runExport('Voting plan', planResult)}
                  onCloudSync={() => void runCloudSync('Voting plan', planResult, [], 'voting-plans')}
                />
              </div>
            )}
          </motion.section>

          <div className="grid gap-8 lg:grid-cols-2">
            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className={cardClass}>
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-400">
                  <FileSearch className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Document Explainer</h2>
                  <p className="text-sm text-muted-foreground">Upload election notices, ballots, screenshots, or PDFs.</p>
                </div>
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-foreground">Election document</span>
                <input
                  type="file"
                  accept=".pdf,.txt,image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] || null;

                    if (!nextFile) {
                      setDocFile(null);
                      return;
                    }

                    const validationError = validateUploadedDocument(nextFile);
                    if (validationError) {
                      setDocFile(null);
                      setDocError(validationError);
                      event.target.value = '';
                      return;
                    }

                    setDocError('');
                    setDocFile(nextFile);
                  }}
                  className={`${inputClass} cursor-pointer file:mr-4 file:rounded-xl file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:font-semibold file:text-primary`}
                />
              </label>
              <div className="mt-2 text-xs text-muted-foreground">{supportedFileLabel}</div>
              {docFile && (
                <div className="mt-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm">
                  <div className="flex items-center gap-2 font-semibold">
                    <FileText className="h-4 w-4 text-primary" />
                    {docFile.name}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{Math.ceil(docFile.size / 1024)} KB</div>
                </div>
              )}
              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-semibold text-foreground">What to focus on</span>
                <textarea value={docQuestion} onChange={(event) => setDocQuestion(event.target.value)} placeholder="What should Gemini focus on in this file?" className={`${inputClass} min-h-24 resize-none`} />
              </label>
              <button onClick={handleDocumentExplain} disabled={!docFile || docLoading} className="mt-4 inline-flex items-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
                {docLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSearch className="mr-2 h-4 w-4" />}
                Explain document
              </button>
              {(docCloudLoading || docCloudPath || (!isSignedIn && hasGoogleAuth) || (isSignedIn && !hasFirebaseStorage)) && (
                <div className="mt-4 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                  {docCloudLoading && 'Backing up the source file to Google Cloud Storage...'}
                  {!docCloudLoading && docCloudPath && (
                    <div className="space-y-1">
                      <div className="font-semibold text-foreground">Google Cloud backup created</div>
                      <div className="truncate text-xs">{docCloudPath}</div>
                      {docCloudUrl && (
                        <a href={docCloudUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                          Open cloud file
                        </a>
                      )}
                    </div>
                  )}
                  {!docCloudLoading && !docCloudPath && !isSignedIn && hasGoogleAuth && 'Sign in with Google to back up uploaded documents to Cloud Storage.'}
                  {!docCloudLoading && !docCloudPath && isSignedIn && !hasFirebaseStorage && 'Firebase Storage is not configured yet for this deployment.'}
                </div>
              )}
              {docError && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{docError}</div>}
              {docResult && (
                <div className="mt-5">
                  <ResultPanel
                    title="Document explanation"
                    modelName={docModel}
                    content={docResult}
                    onSave={() =>
                      void persistSession({
                        kind: 'document_explainer',
                        title: 'Document explanation',
                        summary: docFile?.name || 'Uploaded election document',
                        content: docResult,
                        modelName: docModel,
                      })
                    }
                    onCopy={() => void runCopy('Document explanation', docResult)}
                    onShare={() => void runShare('Document explanation', docResult)}
                    onDownload={() => runExport('Document explanation', docResult)}
                    onCloudSync={() => void runCloudSync('Document explanation', docResult, [], 'document-explanations')}
                  />
                </div>
              )}
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className={cardClass}>
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-rose-500/10 p-3 text-rose-700 dark:text-rose-400">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Claim Checker</h2>
                  <p className="text-sm text-muted-foreground">Paste a voting-related claim and have Gemini verify it carefully.</p>
                </div>
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-foreground">Claim to check</span>
                <textarea value={claimText} onChange={(event) => setClaimText(event.target.value)} placeholder="Example: You can vote by text message in federal elections." className={`${inputClass} min-h-24 resize-none`} />
              </label>
              <label className="mt-3 block">
                <span className="mb-2 block text-sm font-semibold text-foreground">Optional context</span>
                <textarea value={claimContext} onChange={(event) => setClaimContext(event.target.value)} placeholder="Optional location or context" className={`${inputClass} min-h-20 resize-none`} />
              </label>
              <button onClick={handleClaimCheck} disabled={!claimText.trim() || claimLoading} className="mt-4 inline-flex items-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50">
                {claimLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
                Check claim
              </button>
              {claimError && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{claimError}</div>}
              {claimResult && (
                <div className="mt-5">
                  <ResultPanel
                    title="Claim check"
                    modelName={claimModel}
                    content={claimResult}
                    citations={claimCitations}
                    onSave={() =>
                      void persistSession({
                        kind: 'misinformation_check',
                        title: 'Claim check',
                        summary: claimText.slice(0, 110),
                        content: claimResult,
                        citations: claimCitations,
                        modelName: claimModel,
                      })
                    }
                    onCopy={() => void runCopy('Claim check', claimResult, claimCitations)}
                    onShare={() => void runShare('Claim check', claimResult, claimCitations)}
                    onDownload={() => runExport('Claim check', claimResult, claimCitations)}
                    onCloudSync={() => void runCloudSync('Claim check', claimResult, claimCitations, 'claim-checks')}
                  />
                </div>
              )}
            </motion.section>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className={cardClass}>
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-700 dark:text-indigo-300">
                  <LibraryBig className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Ballot / Manifesto Explainer</h2>
                  <p className="text-sm text-muted-foreground">Paste ballot text, a proposition, a speech excerpt, or a manifesto section.</p>
                </div>
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-foreground">Text to explain</span>
                <textarea value={ballotText} onChange={(event) => setBallotText(event.target.value)} placeholder="Paste a ballot measure, proposition, or manifesto excerpt here." className={`${inputClass} min-h-40 resize-none`} />
              </label>
              <button onClick={handleBallotExplain} disabled={!ballotText.trim() || ballotLoading} className="mt-4 inline-flex items-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
                {ballotLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LibraryBig className="mr-2 h-4 w-4" />}
                Explain text
              </button>
              {ballotError && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{ballotError}</div>}
              {ballotResult && (
                <div className="mt-5">
                  <ResultPanel
                    title="Ballot / manifesto explainer"
                    modelName={ballotModel}
                    content={ballotResult}
                    onSave={() =>
                      void persistSession({
                        kind: 'ballot_explainer',
                        title: 'Ballot / manifesto explainer',
                        summary: ballotText.slice(0, 110),
                        content: ballotResult,
                        modelName: ballotModel,
                      })
                    }
                    onCopy={() => void runCopy('Ballot / manifesto explainer', ballotResult)}
                    onShare={() => void runShare('Ballot / manifesto explainer', ballotResult)}
                    onDownload={() => runExport('Ballot / manifesto explainer', ballotResult)}
                    onCloudSync={() => void runCloudSync('Ballot / manifesto explainer', ballotResult, [], 'ballot-explainers')}
                  />
                </div>
              )}
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={cardClass}>
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-700 dark:text-sky-300">
                  <Globe2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Scenario Simulator</h2>
                  <p className="text-sm text-muted-foreground">Run practical election edge cases in a guided way.</p>
                </div>
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-foreground">Scenario</span>
                <select value={scenarioId} onChange={(event) => setScenarioId(event.target.value as (typeof SCENARIO_PRESETS)[number]['id'])} className={inputClass}>
                  {SCENARIO_PRESETS.map((scenario) => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.title}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">{selectedScenario.description}</div>
              <label className="mt-3 block">
                <span className="mb-2 block text-sm font-semibold text-foreground">Local details</span>
                <textarea value={scenarioNotes} onChange={(event) => setScenarioNotes(event.target.value)} placeholder="Add local details like country, age, accessibility needs, travel constraints, or deadline pressure." className={`${inputClass} min-h-28 resize-none`} />
              </label>
              <button onClick={handleScenarioRun} disabled={scenarioLoading} className="mt-4 inline-flex items-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50">
                {scenarioLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe2 className="mr-2 h-4 w-4" />}
                Simulate scenario
              </button>
              {scenarioError && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{scenarioError}</div>}
              {scenarioResult && (
                <div className="mt-5">
                  <ResultPanel
                    title="Scenario simulation"
                    modelName={scenarioModel}
                    content={scenarioResult}
                    onSave={() =>
                      void persistSession({
                        kind: 'scenario_simulation',
                        title: 'Scenario simulation',
                        summary: `${selectedScenario.title}${scenarioNotes ? ` · ${scenarioNotes.slice(0, 60)}` : ''}`,
                        content: scenarioResult,
                        modelName: scenarioModel,
                      })
                    }
                    onCopy={() => void runCopy('Scenario simulation', scenarioResult)}
                    onShare={() => void runShare('Scenario simulation', scenarioResult)}
                    onDownload={() => runExport('Scenario simulation', scenarioResult)}
                    onCloudSync={() => void runCloudSync('Scenario simulation', scenarioResult, [], 'scenario-simulations')}
                  />
                </div>
              )}
            </motion.section>
          </div>
        </div>

        <aside className={`${cardClass} h-fit xl:sticky xl:top-24`}>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">{labels.actionCenter.savedTitle}</h2>
              <p className="text-sm text-muted-foreground">{labels.actionCenter.savedBody}</p>
            </div>
            <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
              {savedSessions.length}
            </span>
          </div>

          {sessionsLoading ? (
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {labels.actionCenter.loadingSaved}
            </div>
          ) : savedSessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-6 text-sm text-muted-foreground">
              {labels.actionCenter.noSaved}
            </div>
          ) : (
            <div className="space-y-3">
              {savedSessions.map((session) => (
                <div key={session.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-primary">{TOOL_LABELS[session.kind]}</div>
                      <div className="mt-1 font-semibold text-foreground">{session.summary}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {new Date(session.createdAt).toLocaleString()} · {session.language}
                      </div>
                    </div>
                    <button onClick={() => void deleteSession(session.id)} className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground" aria-label="Delete saved session">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 max-h-40 overflow-hidden whitespace-pre-wrap text-sm leading-6 text-foreground/80">{session.content}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => void runCopy(session.title, session.content, session.citations)} className="rounded-full border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary/40 hover:bg-secondary/60">
                      <Copy className="mr-1 inline h-3.5 w-3.5" />
                      Copy
                    </button>
                    <button onClick={() => void runShare(session.title, session.content, session.citations)} className="rounded-full border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary/40 hover:bg-secondary/60">
                      <Share2 className="mr-1 inline h-3.5 w-3.5" />
                      Share
                    </button>
                    <button onClick={() => runExport(session.title, session.content, session.citations)} className="rounded-full border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary/40 hover:bg-secondary/60">
                      <Download className="mr-1 inline h-3.5 w-3.5" />
                      Export
                    </button>
                  </div>
                  {session.citations && session.citations.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {sanitizeCitations(session.citations).slice(0, 2).map((citation) => (
                        <a key={`${session.id}-${citation.uri}`} href={citation.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span className="truncate">{citation.title}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
            <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {labels.actionCenter.polishedChecklist}
            </div>
            <div className="space-y-2">
              <div>Grounded Q&A with citations</div>
              <div>Voting plan with export and share</div>
              <div>Document explainer</div>
              <div>Misinformation checker</div>
              <div>Ballot and manifesto simplifier</div>
              <div>Scenario simulator</div>
              <div>Saved sessions plus multilingual outputs</div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4" />
              {labels.actionCenter.realityTitle}
            </div>
            <div>{labels.actionCenter.realityBody}</div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ActionCenter;
