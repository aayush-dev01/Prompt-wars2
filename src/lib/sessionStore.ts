import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { firestore, hasFirebaseConfig } from './firebase';
import type { Citation, GeminiModelName } from './gemini';
import { sanitizeCitations } from './security';

export type SavedSessionKind =
  | 'grounded_answer'
  | 'voting_plan'
  | 'document_explainer'
  | 'misinformation_check'
  | 'ballot_explainer'
  | 'scenario_simulation';

export type SavedSession = {
  id: string;
  kind: SavedSessionKind;
  title: string;
  summary: string;
  content: string;
  citations?: Citation[];
  language: string;
  modelName: GeminiModelName;
  createdAt: number;
  userId?: string;
};

type NewSavedSession = Omit<SavedSession, 'id' | 'createdAt'>;

const STORAGE_KEY = 'elected-saved-sessions';
const COLLECTION_NAME = 'electEDSessions';

const isSavedSessionKind = (value: unknown): value is SavedSessionKind =>
  typeof value === 'string' &&
  [
    'grounded_answer',
    'voting_plan',
    'document_explainer',
    'misinformation_check',
    'ballot_explainer',
    'scenario_simulation',
  ].includes(value);

const sanitizeSavedSession = (value: unknown): SavedSession | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<SavedSession>;

  if (
    typeof candidate.id !== 'string' ||
    !isSavedSessionKind(candidate.kind) ||
    typeof candidate.title !== 'string' ||
    typeof candidate.summary !== 'string' ||
    typeof candidate.content !== 'string' ||
    typeof candidate.language !== 'string' ||
    typeof candidate.modelName !== 'string' ||
    typeof candidate.createdAt !== 'number' ||
    (candidate.userId !== undefined && typeof candidate.userId !== 'string')
  ) {
    return null;
  }

  return {
    id: candidate.id,
    kind: candidate.kind,
    title: candidate.title,
    summary: candidate.summary,
    content: candidate.content,
    citations: sanitizeCitations(candidate.citations || []),
    language: candidate.language,
    modelName: candidate.modelName as GeminiModelName,
    createdAt: candidate.createdAt,
    userId: candidate.userId,
  };
};

const readLocalSessions = (): SavedSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((session) => sanitizeSavedSession(session))
      .filter((session): session is SavedSession => Boolean(session))
      .slice(0, 40);
  } catch {
    return [];
  }
};

const writeLocalSessions = (sessions: SavedSession[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export const loadSavedSessions = async (userId?: string) => {
  if (firestore && hasFirebaseConfig && userId) {
    try {
      const sessionsQuery = query(collection(firestore, COLLECTION_NAME), where('userId', '==', userId));
      const snapshot = await getDocs(sessionsQuery);

      return snapshot.docs
        .map((item) => {
          const data = item.data() as Omit<SavedSession, 'id'>;
          return sanitizeSavedSession({
            id: item.id,
            ...data,
          });
        })
        .filter((session): session is SavedSession => Boolean(session))
        .sort((left, right) => right.createdAt - left.createdAt);
    } catch {
      return readLocalSessions();
    }
  }

  return readLocalSessions();
};

export const saveSession = async (session: NewSavedSession) => {
  const payload = {
    ...session,
    createdAt: Date.now(),
  };

  if (firestore && hasFirebaseConfig && session.userId) {
    try {
      const ref = await addDoc(collection(firestore, COLLECTION_NAME), payload);
      return {
        id: ref.id,
        ...payload,
      } satisfies SavedSession;
    } catch {
      // Fall back to local persistence below.
    }
  }

  const localSession = {
    id: crypto.randomUUID(),
    ...payload,
  } satisfies SavedSession;
  const nextSessions = [localSession, ...readLocalSessions()].slice(0, 40);
  writeLocalSessions(nextSessions);
  return localSession;
};

export const removeSession = async (id: string) => {
  if (firestore && hasFirebaseConfig) {
    try {
      await deleteDoc(doc(firestore, COLLECTION_NAME, id));
      return;
    } catch {
      // Fall back to local deletion below.
    }
  }

  const remainingSessions = readLocalSessions().filter((session) => session.id !== id);
  writeLocalSessions(remainingSessions);
};

export const getSaveOriginLabel = (userId?: string) =>
  hasFirebaseConfig && userId ? 'Firestore + local fallback' : 'Local browser save';
