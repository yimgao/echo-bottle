'use client';

import { 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged, 
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth, isDemoMode } from '../firebase';
import { clearGuestActions } from './guest';
import type { Unsubscribe, AuthStateCallback } from '@/types';

const googleProvider = typeof window !== 'undefined' ? new GoogleAuthProvider() : null;

export const initAuth = async (): Promise<void> => {
  if (isDemoMode || !auth || 'currentUser' in auth === false) {
    return;
  }
  
  try {
    // Check for custom token in localStorage (can be set by backend)
    const customToken = typeof window !== 'undefined' 
      ? localStorage.getItem('__initial_auth_token') 
      : null;

    if (customToken && 'signInWithCustomToken' in auth) {
      await signInWithCustomToken(auth as any, customToken);
      localStorage.removeItem('__initial_auth_token');
    } else if ('signInAnonymously' in auth) {
      await signInAnonymously(auth as any);
    }
  } catch (e) {
    console.error("Auth initialization failed", e);
  }
};

export const subscribeToAuthState = (callback: AuthStateCallback): Unsubscribe => {
  if (isDemoMode || !auth || 'currentUser' in auth === false) {
    return () => {};
  }
  
  return onAuthStateChanged(auth as any, (user: FirebaseUser | null) => {
    if (user) {
      // Clear guest actions when user signs in
      clearGuestActions();
    }
    callback(user ? { id: user.uid, name: user.displayName || 'Anonymous' } : null);
  });
};

export const logout = async (): Promise<void> => {
  if (isDemoMode || !auth || 'currentUser' in auth === false) {
    return;
  }
  await signOut(auth as any);
};

export const loginWithGoogle = async (): Promise<void> => {
  if (isDemoMode || !auth || !googleProvider) {
    return;
  }

  await signInWithPopup(auth as any, googleProvider);
};

export const loginAnonymously = async (): Promise<void> => {
  if (isDemoMode || !auth || 'currentUser' in auth === false) {
    return;
  }

  await signInAnonymously(auth as any);
};

