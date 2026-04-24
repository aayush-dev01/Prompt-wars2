import { useEffect, useState } from 'react';
import { subscribeToGoogleAuth, type GoogleUserProfile } from '../lib/firebase';

export const useGoogleAuthState = () => {
  const [user, setUser] = useState<GoogleUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToGoogleAuth((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    user,
    loading,
    isSignedIn: Boolean(user),
  };
};
