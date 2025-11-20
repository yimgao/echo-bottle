'use client';

import { db, auth, isDemoMode, app } from './firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { appId } from './firebase';

export interface ConnectionStatus {
  isConnected: boolean;
  isDemoMode: boolean;
  hasAuth: boolean;
  hasDb: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  canAccessPool: boolean;
  canAccessInbox: boolean;
  error?: string;
}

export const checkConnectionStatus = async (): Promise<ConnectionStatus> => {
  const status: ConnectionStatus = {
    isConnected: false,
    isDemoMode: isDemoMode,
    hasAuth: auth !== null && typeof auth === 'object',
    hasDb: db !== null,
    isAuthenticated: false,
    userId: null,
    canAccessPool: false,
    canAccessInbox: false,
  };

  // Check if in demo mode
  if (isDemoMode || !db) {
    status.error = 'Running in Demo Mode - No database connection';
    return status;
  }

  // Check authentication
  if (auth && 'currentUser' in auth && auth.currentUser) {
    status.isAuthenticated = true;
    status.userId = auth.currentUser.uid;
  }

  // Try to access pool (read test)
  try {
    const poolRef = collection(db, 'artifacts', appId, 'public', 'data', 'pool_bottles');
    await getDocs(query(poolRef, limit(1)));
    status.canAccessPool = true;
  } catch (e: any) {
    status.error = `Cannot access pool: ${e.message}`;
    status.canAccessPool = false;
  }

  // Try to access inbox (if authenticated)
  if (status.isAuthenticated && status.userId) {
    try {
      const inboxRef = collection(db, 'artifacts', appId, 'users', status.userId, 'inbox');
      await getDocs(query(inboxRef, limit(1)));
      status.canAccessInbox = true;
    } catch (e: any) {
      status.error = `Cannot access inbox: ${e.message}`;
      status.canAccessInbox = false;
    }
  }

  // Overall connection status
  status.isConnected = status.hasDb && (status.canAccessPool || status.canAccessInbox);

  return status;
};

