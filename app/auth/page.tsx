'use client';

import { useRouter } from 'next/navigation';
import { OceanBackground } from '@/components/visual/OceanBackground';
import { AuthPage } from '@/components/pages/AuthPage';
import { useState, useEffect } from 'react';
import { loginWithGoogle, loginAnonymously } from '@/lib/services/auth';

export default function AuthRoute() {
  const router = useRouter();
  const [isWeb, setIsWeb] = useState<boolean>(false);
  const [loadingType, setLoadingType] = useState<'google' | 'anon' | 'email' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleLogin = async (type: 'google' | 'anon' | 'email') => {
    setErrorMessage(null);
    setLoadingType(type);
    try {
      if (type === 'google') {
        await loginWithGoogle();
      } else if (type === 'anon') {
        await loginAnonymously();
      } else {
        throw new Error('Email login is not available yet.');
      }
      router.push('/home');
    } catch (e: any) {
      console.error('Login failed', e);
      setErrorMessage(e?.message || 'Login failed. Please try again.');
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
          onGuestAccess={handleGuestAccess}
        />
      </div>
    </div>
  );
}

