import { describe, expect, it } from 'vitest';
import { buildFirebaseConfig, isFirebaseConfigComplete } from './firebase';

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
});
