// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import {
  buildFirebaseConfig,
  initializeFirebaseAnalytics,
  isFirebaseConfigComplete,
  signInWithGoogle,
  signOutFromGoogle,
  subscribeToGoogleAuth,
  trackFeatureEvent,
  trackPageView,
  uploadFileToCloudStorage,
  uploadTextToCloudStorage,
} from './firebase';

describe('firebase config helpers', () => {
  it('builds firebase config from Vite env values', () => {
    const config = buildFirebaseConfig({
      VITE_FIREBASE_API_KEY: 'api-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'demo.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'demo-project',
      VITE_FIREBASE_STORAGE_BUCKET: 'demo.appspot.com',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '12345',
      VITE_FIREBASE_APP_ID: 'app-id',
      VITE_FIREBASE_MEASUREMENT_ID: 'G-12345',
    });

    expect(config).toEqual({
      apiKey: 'api-key',
      authDomain: 'demo.firebaseapp.com',
      projectId: 'demo-project',
      storageBucket: 'demo.appspot.com',
      messagingSenderId: '12345',
      appId: 'app-id',
      measurementId: 'G-12345',
    });
  });

  it('requires the core Firebase fields but not analytics measurement id', () => {
    expect(
      isFirebaseConfigComplete({
        apiKey: 'api-key',
        authDomain: 'demo.firebaseapp.com',
        projectId: 'demo-project',
        storageBucket: 'demo.appspot.com',
        messagingSenderId: '12345',
        appId: 'app-id',
      }),
    ).toBe(true);

    expect(
      isFirebaseConfigComplete({
        apiKey: 'api-key',
        authDomain: 'demo.firebaseapp.com',
        projectId: 'demo-project',
        storageBucket: 'demo.appspot.com',
        messagingSenderId: '',
        appId: 'app-id',
      }),
    ).toBe(false);
  });

  it('treats Google auth and storage helpers as unavailable without Firebase config', async () => {
    await expect(signInWithGoogle()).rejects.toThrow('Google Sign-In is unavailable until Firebase is configured.');
    await expect(
      uploadFileToCloudStorage({
        file: new File(['hello'], 'notes.txt', { type: 'text/plain' }),
        userId: 'user-1',
        folder: 'exports',
      }),
    ).rejects.toThrow('Google Cloud Storage backup is unavailable until Firebase Storage is configured.');
    await expect(
      uploadTextToCloudStorage({
        filename: 'notes.txt',
        content: 'Saved content',
        userId: 'user-1',
        folder: 'exports',
      }),
    ).rejects.toThrow('Google Cloud Storage backup is unavailable until Firebase Storage is configured.');
  });

  it('gracefully no-ops analytics and sign-out when Firebase is not configured', async () => {
    await expect(initializeFirebaseAnalytics()).resolves.toBeNull();
    await expect(trackPageView('/action-center', 'Action Center')).resolves.toBeUndefined();
    await expect(trackFeatureEvent('session_saved', { kind: 'grounded_answer' })).resolves.toBeUndefined();
    await expect(signOutFromGoogle()).resolves.toBeUndefined();
  });

  it('subscribes with a null user when Google auth is unavailable', async () => {
    const callback = vi.fn();
    const unsubscribe = subscribeToGoogleAuth(callback);

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalledWith(null);
    });

    expect(typeof unsubscribe).toBe('function');
    unsubscribe();
  });
});
