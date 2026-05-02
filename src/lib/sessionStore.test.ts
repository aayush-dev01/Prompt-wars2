// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadSavedSessions, removeSession, saveSession } from './sessionStore';

vi.mock('./firebase', () => ({
  hasFirebaseConfig: false,
  firestore: null,
}));

describe('session store local fallback', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(Date, 'now').mockReturnValue(1710000000000);
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('11111111-1111-1111-1111-111111111111');
  });

  it('saves sessions locally when Firebase is unavailable', async () => {
    const session = await saveSession({
      kind: 'grounded_answer',
      title: 'Claim check',
      summary: 'Testing save',
      content: 'Saved answer',
      citations: [{ title: 'Safe source', uri: 'https://example.com' }],
      language: 'en',
      modelName: 'gemini-2.5-flash',
    });

    expect(session.id).toBe('11111111-1111-1111-1111-111111111111');

    const saved = await loadSavedSessions();
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      id: '11111111-1111-1111-1111-111111111111',
      title: 'Claim check',
      summary: 'Testing save',
      content: 'Saved answer',
    });
    expect(saved[0].citations).toEqual([{ title: 'Safe source', uri: 'https://example.com/' }]);
  });

  it('drops malformed local entries while loading sessions', async () => {
    localStorage.setItem(
      'elected-saved-sessions',
      JSON.stringify([
        { id: 'bad', title: 'Broken' },
        {
          id: 'good',
          kind: 'voting_plan',
          title: 'Voting plan',
          summary: 'Clean record',
          content: 'Body',
          citations: [{ title: 'Unsafe', uri: 'javascript:alert(1)' }],
          language: 'en',
          modelName: 'gemini-2.5-flash',
          createdAt: 1710000000000,
        },
      ]),
    );

    const saved = await loadSavedSessions();

    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe('good');
    expect(saved[0].citations).toEqual([]);
  });

  it('removes sessions from local storage', async () => {
    localStorage.setItem(
      'elected-saved-sessions',
      JSON.stringify([
        {
          id: 'session-1',
          kind: 'scenario_simulation',
          title: 'Scenario',
          summary: 'Summary',
          content: 'Body',
          citations: [],
          language: 'en',
          modelName: 'gemini-2.5-flash',
          createdAt: 1710000000000,
        },
      ]),
    );

    await removeSession('session-1');

    await expect(loadSavedSessions()).resolves.toEqual([]);
  });
});
