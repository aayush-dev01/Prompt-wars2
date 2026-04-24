import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

type FirebaseEnv = {
  VITE_FIREBASE_API_KEY?: string;
  VITE_FIREBASE_AUTH_DOMAIN?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_STORAGE_BUCKET?: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  VITE_FIREBASE_APP_ID?: string;
  VITE_FIREBASE_MEASUREMENT_ID?: string;
};

export type FirebaseRuntimeConfig = FirebaseOptions & {
  measurementId?: string;
};

export type GoogleUserProfile = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
};

export type CloudAsset = {
  path: string;
  downloadUrl: string;
};

export const buildFirebaseConfig = (env: FirebaseEnv): FirebaseRuntimeConfig => ({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
});

export const isFirebaseConfigComplete = (config: FirebaseRuntimeConfig) =>
  [config.apiKey, config.authDomain, config.projectId, config.storageBucket, config.messagingSenderId, config.appId].every(Boolean);

const firebaseConfig = buildFirebaseConfig(import.meta.env as FirebaseEnv);

export const hasFirebaseConfig = isFirebaseConfigComplete(firebaseConfig);

const app = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;

export const firestore = app ? getFirestore(app) : null;
export const hasGoogleAuth = Boolean(app);
export const hasFirebaseStorage = Boolean(app && firebaseConfig.storageBucket);
export const hasFirebaseAnalytics = Boolean(app && firebaseConfig.measurementId);

type AnalyticsModule = typeof import('firebase/analytics');
type AnalyticsBundle = {
  analytics: import('firebase/analytics').Analytics;
  logEvent: AnalyticsModule['logEvent'];
};

let analyticsPromise: Promise<AnalyticsBundle | null> | null = null;
type AuthModule = typeof import('firebase/auth');
type StorageModule = typeof import('firebase/storage');
type AuthBundle = {
  auth: import('firebase/auth').Auth;
  module: AuthModule;
  provider: import('firebase/auth').GoogleAuthProvider;
};
type StorageBundle = {
  storage: import('firebase/storage').FirebaseStorage;
  module: StorageModule;
};

let authPromise: Promise<AuthBundle | null> | null = null;
let storagePromise: Promise<StorageBundle | null> | null = null;

const mapGoogleUser = (user: import('firebase/auth').User | null): GoogleUserProfile | null =>
  user
    ? {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      }
    : null;

const sanitizePathSegment = (value: string) => value.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'item';

const loadAuthBundle = () => {
  if (!app) {
    return Promise.resolve(null);
  }

  if (!authPromise) {
    authPromise = import('firebase/auth')
      .then(async (module) => {
        const auth = module.getAuth(app);
        await module.setPersistence(auth, module.browserLocalPersistence);
        return {
          auth,
          module,
          provider: new module.GoogleAuthProvider(),
        };
      })
      .catch(() => null);
  }

  return authPromise;
};

const loadStorageBundle = () => {
  if (!app || !firebaseConfig.storageBucket) {
    return Promise.resolve(null);
  }

  if (!storagePromise) {
    storagePromise = import('firebase/storage')
      .then((module) => ({
        storage: module.getStorage(app),
        module,
      }))
      .catch(() => null);
  }

  return storagePromise;
};

export const initializeFirebaseAnalytics = () => {
  if (!app || !firebaseConfig.measurementId || typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  if (!analyticsPromise) {
    analyticsPromise = import('firebase/analytics')
      .then(async ({ getAnalytics, isSupported, logEvent }) => {
        const supported = await isSupported();

        if (!supported) {
          return null;
        }

        const analytics = getAnalytics(app);
        logEvent(analytics, 'app_open', {
          app_name: 'ElectED',
        });
        return {
          analytics,
          logEvent,
        };
      })
      .catch(() => null);
  }

  return analyticsPromise;
};

export const trackPageView = async (path: string, title?: string) => {
  const analyticsBundle = await initializeFirebaseAnalytics();

  if (!analyticsBundle) {
    return;
  }

  analyticsBundle.logEvent(analyticsBundle.analytics, 'page_view', {
    page_path: path,
    page_title: title,
  });
};

export const subscribeToGoogleAuth = (callback: (user: GoogleUserProfile | null) => void) => {
  let unsubscribe: () => void = () => {};
  let active = true;

  void loadAuthBundle().then((bundle) => {
    if (!active) {
      return;
    }

    if (!bundle) {
      callback(null);
      return;
    }

    unsubscribe = bundle.module.onAuthStateChanged(bundle.auth, (user) => {
      callback(mapGoogleUser(user));
    });
  });

  return () => {
    active = false;
    unsubscribe();
  };
};

export const signInWithGoogle = async () => {
  const bundle = await loadAuthBundle();

  if (!bundle) {
    throw new Error('Google Sign-In is unavailable until Firebase is configured.');
  }

  bundle.provider.setCustomParameters({
    prompt: 'select_account',
  });

  const result = await bundle.module.signInWithPopup(bundle.auth, bundle.provider);
  return mapGoogleUser(result.user);
};

export const signOutFromGoogle = async () => {
  const bundle = await loadAuthBundle();

  if (!bundle) {
    return;
  }

  await bundle.module.signOut(bundle.auth);
};

export const uploadFileToCloudStorage = async ({
  file,
  userId,
  folder,
}: {
  file: File;
  userId: string;
  folder: string;
}) => {
  const bundle = await loadStorageBundle();

  if (!bundle) {
    throw new Error('Google Cloud Storage backup is unavailable until Firebase Storage is configured.');
  }

  const timestamp = Date.now();
  const path = `${sanitizePathSegment(folder)}/${sanitizePathSegment(userId)}/${timestamp}-${sanitizePathSegment(file.name)}`;
  const assetRef = bundle.module.ref(bundle.storage, path);
  await bundle.module.uploadBytes(assetRef, file, {
    contentType: file.type || 'application/octet-stream',
  });
  const downloadUrl = await bundle.module.getDownloadURL(assetRef);

  return {
    path,
    downloadUrl,
  } satisfies CloudAsset;
};

export const uploadTextToCloudStorage = async ({
  filename,
  content,
  userId,
  folder,
}: {
  filename: string;
  content: string;
  userId: string;
  folder: string;
}) => {
  const bundle = await loadStorageBundle();

  if (!bundle) {
    throw new Error('Google Cloud Storage backup is unavailable until Firebase Storage is configured.');
  }

  const timestamp = Date.now();
  const path = `${sanitizePathSegment(folder)}/${sanitizePathSegment(userId)}/${timestamp}-${sanitizePathSegment(filename)}`;
  const assetRef = bundle.module.ref(bundle.storage, path);
  await bundle.module.uploadString(assetRef, content, 'raw', {
    contentType: 'text/plain;charset=utf-8',
  });
  const downloadUrl = await bundle.module.getDownloadURL(assetRef);

  return {
    path,
    downloadUrl,
  } satisfies CloudAsset;
};
