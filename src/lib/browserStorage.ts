const hasWindow = typeof window !== 'undefined';

export const safeGetLocalStorageItem = (key: string) => {
  if (!hasWindow) {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const safeSetLocalStorageItem = (key: string, value: string) => {
  if (!hasWindow) {
    return false;
  }

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};
