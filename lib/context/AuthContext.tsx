'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@/types';
import { auth, isDemoMode } from '@/lib/firebase';
import { subscribeToAuthState } from '@/lib/services/auth';

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
      setIsLoading(false);
      setUser(null);
      return;
    }

    const unsubscribe = subscribeToAuthState((nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
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

