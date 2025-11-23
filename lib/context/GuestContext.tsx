'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getGuestStatus, recordGuestAction, clearGuestActions } from '@/lib/services/guest';
import type { GuestStatus } from '@/lib/services/guest';

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
  const [status, setStatus] = useState<GuestStatus>(() => getGuestStatus());

  const refresh = useCallback(() => {
    setStatus(getGuestStatus());
  }, []);

  const recordWrapped = useCallback((type: 'throw' | 'catch') => {
    const result = recordGuestAction(type);
    if (result) {
      refresh();
    }
    return result;
  }, [refresh]);

  const clear = useCallback(() => {
    clearGuestActions();
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handler = () => refresh();
    if (typeof window !== 'undefined') {
      window.addEventListener('echobottle_guest_action', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('echobottle_guest_action', handler);
      }
    };
  }, [refresh]);

  const value = useMemo(() => ({
    status,
    refresh,
    recordAction: recordWrapped,
    clear,
  }), [status, refresh, recordWrapped, clear]);

  return <GuestContext.Provider value={value}>{children}</GuestContext.Provider>;
};

export const useGuestContext = (): GuestContextValue => useContext(GuestContext);

