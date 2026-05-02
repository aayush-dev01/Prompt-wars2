// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('firebase configured runtime', () => {
  const originalEnv = {
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
    VITE_FIREBASE_MEASUREMENT_ID: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  beforeEach(() => {
    vi.resetModules();
    Object.assign(import.meta.env, {
      VITE_FIREBASE_API_KEY: 'api-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'demo.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'demo-project',
      VITE_FIREBASE_STORAGE_BUCKET: 'demo.appspot.com',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '12345',
      VITE_FIREBASE_APP_ID: 'app-id',
      VITE_FIREBASE_MEASUREMENT_ID: 'G-12345',
    });
  });

  afterEach(() => {
    Object.assign(import.meta.env, originalEnv);
    vi.clearAllMocks();
  });

  it('initializes analytics, auth, and storage helpers when Firebase is configured', async () => {
    const initializeApp = vi.fn(() => 'app');
    const getFirestore = vi.fn(() => 'firestore');
    const logEvent = vi.fn();
    const getAnalytics = vi.fn(() => 'analytics');
    const isSupported = vi.fn().mockResolvedValue(true);
    const getAuth = vi.fn(() => 'auth');
    const setPersistence = vi.fn().mockResolvedValue(undefined);
    const signInWithPopup = vi.fn().mockResolvedValue({
      user: {
        uid: 'user-123',
        displayName: 'Ada Lovelace',
        email: 'ada@example.com',
        photoURL: 'https://example.com/avatar.png',
      },
    });
    const signOut = vi.fn().mockResolvedValue(undefined);
    const onAuthStateChanged = vi.fn((_auth, callback) => {
      callback({
        uid: 'user-123',
        displayName: 'Ada Lovelace',
        email: 'ada@example.com',
        photoURL: 'https://example.com/avatar.png',
      });

      return vi.fn();
    });
    const providerSetCustomParameters = vi.fn();
    const getStorage = vi.fn(() => 'storage');
    const ref = vi.fn((_storage, path: string) => ({ fullPath: path }));
    const uploadBytes = vi.fn().mockResolvedValue(undefined);
    const uploadString = vi.fn().mockResolvedValue(undefined);
    const getDownloadURL = vi.fn().mockResolvedValue('https://example.com/download');

    vi.doMock('firebase/app', () => ({
      initializeApp,
    }));
    vi.doMock('firebase/firestore', () => ({
      getFirestore,
    }));
    vi.doMock('firebase/analytics', () => ({
      getAnalytics,
      isSupported,
      logEvent,
    }));
    vi.doMock('firebase/auth', () => ({
      browserLocalPersistence: 'local',
      getAuth,
      GoogleAuthProvider: class {
        setCustomParameters = providerSetCustomParameters;
      },
      onAuthStateChanged,
      setPersistence,
      signInWithPopup,
      signOut,
    }));
    vi.doMock('firebase/storage', () => ({
      getStorage,
      ref,
      uploadBytes,
      uploadString,
      getDownloadURL,
    }));

    const firebase = await import('./firebase');

    expect(firebase.hasFirebaseConfig).toBe(true);
    expect(firebase.hasGoogleAuth).toBe(true);
    expect(firebase.hasFirebaseStorage).toBe(true);
    expect(firebase.hasFirebaseAnalytics).toBe(true);

    await expect(firebase.initializeFirebaseAnalytics()).resolves.toEqual({
      analytics: 'analytics',
      logEvent,
    });
    await firebase.trackPageView('/action-center', 'Action Center');
    await firebase.trackFeatureEvent('session_saved', { kind: 'grounded_answer' });

    const callback = vi.fn();
    const unsubscribe = firebase.subscribeToGoogleAuth(callback);

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalledWith({
        uid: 'user-123',
        displayName: 'Ada Lovelace',
        email: 'ada@example.com',
        photoURL: 'https://example.com/avatar.png',
      });
    });

    const signedInUser = await firebase.signInWithGoogle();
    await firebase.signOutFromGoogle();

    const uploadedFile = await firebase.uploadFileToCloudStorage({
      file: new File(['hello'], 'My Notes!!.txt', { type: 'text/plain' }),
      userId: 'user/123',
      folder: 'exports',
    });

    const uploadedText = await firebase.uploadTextToCloudStorage({
      filename: 'Plan Draft.txt',
      content: 'Saved content',
      userId: 'user/123',
      folder: 'plans',
    });

    expect(initializeApp).toHaveBeenCalledTimes(1);
    expect(getFirestore).toHaveBeenCalledWith('app');
    expect(logEvent).toHaveBeenCalledWith('analytics', 'app_open', { app_name: 'ElectED' });
    expect(logEvent).toHaveBeenCalledWith('analytics', 'page_view', {
      page_path: '/action-center',
      page_title: 'Action Center',
    });
    expect(logEvent).toHaveBeenCalledWith('analytics', 'session_saved', { kind: 'grounded_answer' });
    expect(setPersistence).toHaveBeenCalledWith('auth', 'local');
    expect(providerSetCustomParameters).toHaveBeenCalledWith({ prompt: 'select_account' });
    expect(signInWithPopup).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledWith('auth');
    expect(signedInUser).toMatchObject({ uid: 'user-123', email: 'ada@example.com' });
    expect(uploadBytes).toHaveBeenCalledTimes(1);
    expect(uploadString).toHaveBeenCalledTimes(1);
    expect(uploadedFile).toEqual({
      path: expect.stringMatching(/^exports\/user-123\/\d+-My-Notes-.txt$/),
      downloadUrl: 'https://example.com/download',
    });
    expect(uploadedText).toEqual({
      path: expect.stringMatching(/^plans\/user-123\/\d+-Plan-Draft.txt$/),
      downloadUrl: 'https://example.com/download',
    });

    unsubscribe();
  });
});
