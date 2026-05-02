// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadSavedSessions, removeSession, saveSession, getSaveOriginLabel } from './sessionStore';

vi.mock('./firebase', () => ({
  hasFirebaseConfig: true,
  firestore: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn().mockRejectedValue(new Error('Network error')),
  addDoc: vi.fn().mockRejectedValue(new Error('Network error')),
  deleteDoc: vi.fn().mockRejectedValue(new Error('Network error')),
  query: vi.fn(),
  where: vi.fn(),
}));

describe('session store firestore fallbacks', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('falls back to local read on firestore getDocs error', async () => {
    const saved = await loadSavedSessions('user-1');
    expect(saved).toEqual([]);
  });

  it('falls back to local save on firestore addDoc error', async () => {
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('uuid-123');
    
    const session = await saveSession({
      kind: 'grounded_answer',
      title: 'Fallback',
      summary: 'Testing fallback',
      content: 'Saved answer',
      language: 'en',
      modelName: 'gemini-2.5-flash',
      userId: 'user-1',
    });

    expect(session.id).toBe('uuid-123');
  });

  it('falls back to local remove on firestore deleteDoc error', async () => {
    // Should not throw
    await expect(removeSession('session-1')).resolves.toBeUndefined();
  });

  it('returns correct origin label', () => {
    expect(getSaveOriginLabel('user-1')).toBe('Firestore + local fallback');
    expect(getSaveOriginLabel()).toBe('Local browser save');
  });
});
