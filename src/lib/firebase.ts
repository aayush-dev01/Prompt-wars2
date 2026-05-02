import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { cloudLog } from './cloudLogging';

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

const CLOUD_STORAGE_UNAVAILABLE_MESSAGE = 'Google Cloud Storage backup is unavailable until Firebase Storage is configured.';

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
type AnalyticsValue = string | number | boolean;

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
const buildCloudStoragePath = (folder: string, userId: string, filename: string, timestamp = Date.now()) =>
  `${sanitizePathSegment(folder)}/${sanitizePathSegment(userId)}/${timestamp}-${sanitizePathSegment(filename)}`;

const loadAuthBundle = () => {
  if (!app) {
    return Promise.resolve(null);
  }

  if (!authPromise) {
    authPromise = import('firebase/auth')
      .then(async (module) => {
        const auth = module.getAuth(app);
        await module.setPersistence(auth, module.browserLocalPersistence);

        // Handle redirect result from a previous signInWithRedirect call
        try {
          await module.getRedirectResult(auth);
        } catch (redirectError) {
          cloudLog.warn('Redirect result check failed (non-critical)', { error: String(redirectError) });
        }

        return {
          auth,
          module,
          provider: new module.GoogleAuthProvider(),
        };
      })
      .catch((err) => {
        cloudLog.error('Failed to load Firebase Auth bundle', { error: String(err) });
        return null;
      });
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

const getAnalyticsBundle = async () => {
  const analyticsBundle = await initializeFirebaseAnalytics();

  if (!analyticsBundle) {
    return null;
  }

  return analyticsBundle;
};

const logAnalyticsEvent = async (
  eventName: string,
  params: Record<string, AnalyticsValue | null | undefined>,
) => {
  const analyticsBundle = await getAnalyticsBundle();

  if (!analyticsBundle) {
    return;
  }

  const safeParams = Object.fromEntries(Object.entries(params).filter((entry) => entry[1] !== null && entry[1] !== undefined));
  analyticsBundle.logEvent(analyticsBundle.analytics, eventName, safeParams);
};

const getStorageBundleOrThrow = async () => {
  const bundle = await loadStorageBundle();

  if (!bundle) {
    throw new Error(CLOUD_STORAGE_UNAVAILABLE_MESSAGE);
  }

  return bundle;
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
  await logAnalyticsEvent('page_view', {
    page_path: path,
    page_title: title,
  });
};

/**
 * Tracks a custom feature event in Firebase Analytics.
 * Automatically handles environments where Analytics is not configured.
 * 
 * @param {string} eventName - The name of the event to track.
 * @param {Record<string, any>} params - Optional metadata for the event.
 */
export const trackFeatureEvent = async (
  eventName: string,
  params: Record<string, AnalyticsValue | null | undefined> = {},
) => {
  await logAnalyticsEvent(eventName, params);
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

/**
 * Initiates Google Sign-In using a popup with a fallback to redirect.
 * This ensures compatibility with environments that block popups (like Cloud Run).
 * 
 * @returns {Promise<GoogleUser | null>} The signed-in user or null if a redirect was triggered.
 */
export const signInWithGoogle = async () => {
  const bundle = await loadAuthBundle();

  if (!bundle) {
    throw new Error('Google Sign-In is unavailable until Firebase is configured.');
  }

  bundle.provider.setCustomParameters({
    prompt: 'select_account',
  });

  try {
    const result = await bundle.module.signInWithPopup(bundle.auth, bundle.provider);
    cloudLog.info('Google Sign-In succeeded via popup');
    return mapGoogleUser(result.user);
  } catch (popupError: unknown) {
    const code = (popupError as { code?: string })?.code;
    
    if (code === 'auth/unauthorized-domain') {
      cloudLog.error('Firebase Auth: Domain not authorized', { 
        domain: window.location.hostname,
        fix: 'Add this domain to Firebase Console > Authentication > Settings > Authorized Domains'
      });
      throw new Error(`Unauthorized Domain: Please add "${window.location.hostname}" to your Firebase Console authorized domains list.`);
    }

    // Fallback to redirect for environments that block popups or have internal errors
    if (code === 'auth/internal-error' || code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user') {
      cloudLog.warn('Popup sign-in failed, falling back to redirect', { code });
      await bundle.module.signInWithRedirect(bundle.auth, bundle.provider);
      return null; // Redirect will reload the page
    }
    cloudLog.error('Google Sign-In failed', { error: String(popupError) });
    throw popupError;
  }
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
  const bundle = await getStorageBundleOrThrow();
  const path = buildCloudStoragePath(folder, userId, file.name);
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

/**
 * Uploads plain text content to Google Cloud Storage.
 * Useful for exporting AI results and session data to a persistent cloud bucket.
 * 
 * @param {Object} params - Upload parameters.
 * @returns {Promise<{path: string, downloadUrl: string}>} The storage path and public URL.
 */
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
  const bundle = await getStorageBundleOrThrow();
  const path = buildCloudStoragePath(folder, userId, filename);
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
