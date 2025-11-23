'use client';

import { useRouter } from 'next/navigation';
import { OceanBackground } from '@/components/visual/OceanBackground';
import { AuthPage } from '@/components/pages/AuthPage';
import { useState, useEffect } from 'react';
import { loginWithGoogle, loginAnonymously, loginWithEmail, registerWithEmail } from '@/lib/services/auth';
import type { AuthLoginRequest } from '@/types';

export default function AuthRoute() {
  const router = useRouter();
  const [isWeb, setIsWeb] = useState<boolean>(false);
  const [loadingType, setLoadingType] = useState<'google' | 'anon' | 'email' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formatAuthError = (error: any): string => {
    const code = error?.code || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Try logging in instead.';
      case 'auth/invalid-email':
        return 'That email address looks invalid. Please check and try again.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Incorrect email or password. Please try again.';
      case 'auth/email-verification-required':
        return 'Verification email sent! Please check your inbox and follow the link before signing in.';
      case 'auth/email-not-verified':
        return 'Your email is not verified yet. We just re-sent the verification link—check your inbox, then sign in again.';
      default:
        return error?.message || 'Login failed. Please try again.';
    }
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsWeb(typeof window !== 'undefined' && window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkScreenSize);
      return () => window.removeEventListener('resize', checkScreenSize);
    }
  }, []);

  const handleLogin = async (request: AuthLoginRequest) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoadingType(request.type);
    try {
      if (request.type === 'google') {
        await loginWithGoogle();
        router.push('/home');
        return;
      }
      if (request.type === 'anon') {
        await loginAnonymously();
        router.push('/home');
        return;
      }

      if (!request.email || !request.password) {
        throw new Error('Email and password are required.');
      }

      if (request.mode === 'signup') {
        await registerWithEmail(request.email, request.password);
        setSuccessMessage(`Verification email sent to ${request.email}. Please verify your inbox, then use Log In.`);
        return;
      }

      await loginWithEmail(request.email, request.password);
      router.push('/home');
    } catch (e: any) {
      console.error('Login failed', e);
      setErrorMessage(formatAuthError(e));
    } finally {
      setLoadingType(null);
    }
  };

  const handleGuestAccess = () => {
    router.push('/home');
  };

  return (
    <div className="w-full h-full overflow-hidden relative">
      <OceanBackground isWeb={isWeb} />
      <div className="absolute inset-0 z-10 transition-opacity duration-500 h-full overflow-hidden">
        <AuthPage 
          onLogin={handleLogin} 
          loadingType={loadingType} 
          errorMessage={errorMessage}
          successMessage={successMessage}
          onGuestAccess={handleGuestAccess}
        />
      </div>
    </div>
  );
}

