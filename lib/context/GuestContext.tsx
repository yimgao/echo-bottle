'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, appId, isDemoMode } from '@/lib/firebase';
import { useAuthContext } from './AuthContext';

export interface GuestStatus {
  isGuest: boolean;
  actionsRemaining: number;
  totalActions: number;
  hasReachedLimit: boolean;
}

interface GuestContextValue {
  status: GuestStatus;
  refresh: () => void;
  recordAction: (type: 'throw' | 'catch') => boolean;
  clear: () => void;
}

const defaultStatus: GuestStatus = {
  isGuest: false,
  actionsRemaining: 3,
  totalActions: 0,
  hasReachedLimit: false,
};

const GuestContext = createContext<GuestContextValue>({
  status: defaultStatus,
  refresh: () => {},
  recordAction: () => false,
  clear: () => {},
});

export const GuestProvider = ({ children }: { children: ReactNode }) => {
  const { user, isGuest } = useAuthContext();
  const [status, setStatus] = useState<GuestStatus>(defaultStatus);

  useEffect(() => {
    // If no user (yet) or demo mode, show default state
    if (isDemoMode || !db || !user) {
      setStatus({
        isGuest: true, // Default to guest if loading or not signed in
        actionsRemaining: 3,
        totalActions: 0,
        hasReachedLimit: false
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    // We use the user's ID to track stats
    const statsRef = doc(db, 'artifacts', appId, 'users', user.id, 'daily_stats', today);

    const unsubscribe = onSnapshot(statsRef, (doc) => {
      const count = doc.exists() ? (doc.data().count || 0) : 0;
      // Define limits: 3 for anonymous, 10 for authenticated users
      const limit = user.isAnonymous ? 3 : 10;
      
      setStatus({
        isGuest: user.isAnonymous,
        actionsRemaining: Math.max(0, limit - count),
        totalActions: count,
        hasReachedLimit: count >= limit
      });
    }, (error) => {
      console.error("Error listening to guest stats:", error);
    });

    return () => unsubscribe();
  }, [user, isGuest]);

  const refresh = useCallback(() => {
    // No-op since we use real-time listener
  }, []);

  const recordAction = useCallback((type: 'throw' | 'catch') => {
    // No-op, handled by Firestore logic
    return true;
  }, []);

  const clear = useCallback(() => {
    // No-op
  }, []);

  const value = useMemo(() => ({
    status,
    refresh,
    recordAction,
    clear,
  }), [status, refresh, recordAction, clear]);

  return <GuestContext.Provider value={value}>{children}</GuestContext.Provider>;
};

export const useGuestContext = (): GuestContextValue => useContext(GuestContext);
