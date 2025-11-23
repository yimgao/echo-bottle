'use client';

import { 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged, 
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
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
    callback(user ? { 
      id: user.uid, 
      name: user.displayName || 'Anonymous',
      type: user.isAnonymous ? 'anonymous' : 'email',
      email: user.email,
      emailVerified: user.emailVerified,
      isAnonymous: user.isAnonymous
    } : null);
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

export const loginWithEmail = async (email: string, password: string): Promise<void> => {
  if (isDemoMode || !auth || 'currentUser' in auth === false) {
    throw new Error('Email login is unavailable in demo mode.');
  }

  const credential = await signInWithEmailAndPassword(auth as any, email, password);
  if (credential.user && !credential.user.emailVerified) {
    await sendEmailVerification(credential.user);
    await signOut(auth as any);
    const error: any = new Error('Your email is not verified.');
    error.code = 'auth/email-not-verified';
    throw error;
  }
};

export const registerWithEmail = async (email: string, password: string): Promise<void> => {
  if (isDemoMode || !auth || 'currentUser' in auth === false) {
    throw new Error('Email signup is unavailable in demo mode.');
  }

  const credential = await createUserWithEmailAndPassword(auth as any, email, password);
  if (credential.user) {
    await sendEmailVerification(credential.user);
    await signOut(auth as any);
  }
};

export const resendVerificationEmail = async (): Promise<void> => {
  if (isDemoMode || !auth || 'currentUser' in auth === false || !auth.currentUser) {
    throw new Error('You must be signed in to resend verification email.');
  }

  if (auth.currentUser.emailVerified) {
    throw new Error('Your email is already verified.');
  }

  await sendEmailVerification(auth.currentUser);
};

