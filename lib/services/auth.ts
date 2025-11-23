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
import type { Unsubscribe, AuthStateCallback } from '@/types';

const googleProvider = typeof window !== 'undefined' ? new GoogleAuthProvider() : null;

// Prevent multiple simultaneous init calls
let initPromise: Promise<void> | null = null;

export const initAuth = async (): Promise<void> => {
  // If already initializing, return the existing promise
  if (initPromise) {
    console.log('[Auth] Already initializing, waiting for existing promise...');
    return initPromise;
  }

  if (isDemoMode || !auth || 'currentUser' in auth === false) {
    console.log('[Auth] Skipping init - demo mode or no auth');
    return;
  }
  
  // Create the initialization promise
  initPromise = (async () => {
    try {
      // If already authenticated, no need to initialize
      if (auth.currentUser) {
        console.log('[Auth] Already authenticated as:', auth.currentUser.uid, 'isAnonymous:', auth.currentUser.isAnonymous);
        return;
      }

      console.log('[Auth] No current user, initializing...');
      console.log('[Auth] Auth object type:', typeof auth, 'Has signInAnonymously?', 'signInAnonymously' in auth);

      // Check for custom token in localStorage (can be set by backend)
      const customToken = typeof window !== 'undefined' 
        ? localStorage.getItem('__initial_auth_token') 
        : null;

      if (customToken) {
        console.log('[Auth] Found custom token, signing in...');
        await signInWithCustomToken(auth as any, customToken);
        localStorage.removeItem('__initial_auth_token');
        console.log('[Auth] ✓ Signed in with custom token');
      } else {
        // Sign in anonymously for guest users
        console.log('[Auth] No custom token, signing in anonymously...');
        console.log('[Auth] Calling signInAnonymously on auth object...');
        const result = await signInAnonymously(auth as any);
        console.log('[Auth] ✓ Guest user signed in anonymously:', result.user.uid, 'isAnonymous:', result.user.isAnonymous);
      }
    } catch (e) {
      console.error("[Auth] ✗ Auth initialization failed:", e);
      throw e;
    } finally {
      // Clear the promise after completion
      initPromise = null;
    }
  })();

  return initPromise;
};

export const subscribeToAuthState = (callback: AuthStateCallback): Unsubscribe => {
  if (isDemoMode || !auth || 'currentUser' in auth === false) {
    return () => {};
  }
  
  return onAuthStateChanged(auth as any, (user: FirebaseUser | null) => {
    callback(user ? { 
      id: user.uid,
      uid: user.uid, // Include both for compatibility
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

