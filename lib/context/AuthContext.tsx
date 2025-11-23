'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@/types';
import { auth, isDemoMode } from '@/lib/firebase';
import { subscribeToAuthState, initAuth } from '@/lib/services/auth';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  isVerified: boolean;
  needsVerification: boolean;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isSignedIn: false,
  isVerified: false,
  needsVerification: false,
  isGuest: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isDemoMode || !auth || 'currentUser' in auth === false) {
      console.log('[AuthContext] Demo mode or no auth available');
      setIsLoading(false);
      setUser(null);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    // Initialize authentication first, THEN subscribe
    const initialize = async () => {
      try {
        console.log('[AuthContext] Starting initialization...');
        await initAuth();
        console.log('[AuthContext] Init complete, setting up listener');
        
        // Subscribe to auth state changes AFTER initialization
        unsubscribe = subscribeToAuthState((nextUser) => {
          console.log('[AuthContext] Auth state changed:', nextUser?.id, 'isAnonymous:', nextUser?.isAnonymous);
          setUser(nextUser);
          setIsLoading(false);
        });
      } catch (e) {
        console.error('[AuthContext] Auth initialization failed:', e);
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      if (unsubscribe) {
        console.log('[AuthContext] Cleaning up listener');
        unsubscribe();
      }
    };
  }, []);

  const value = useMemo(() => {
    const isSignedIn = Boolean(user && !user.isAnonymous);
    const isGuest = !isSignedIn;
    const isVerified = Boolean(user && (user.isAnonymous || user.emailVerified));
    const needsVerification = Boolean(user && !user.isAnonymous && !user.emailVerified);

    return {
      user,
      isLoading,
      isSignedIn,
      isVerified,
      needsVerification,
      isGuest,
    };
  }, [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextValue => useContext(AuthContext);

