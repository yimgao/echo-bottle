'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, isDemoMode } from '@/lib/firebase';
import { initAuth, subscribeToAuthState } from '@/lib/services/auth';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const setupAuth = async () => {
      if (!isDemoMode) {
        await initAuth();
      }
    };

    setupAuth();
    
    if (!isDemoMode && auth) {
      const unsubscribe = subscribeToAuthState((user) => {
        if (user) {
          router.push('/home');
        } else {
          // Allow guests to access the app - redirect to home (they'll see limit)
          router.push('/home');
        }
      });
      return () => unsubscribe();
    } else {
      // Allow guests to use the app in demo mode too
      router.push('/home');
    }
  }, [router]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-slate-900">
      <div className="text-white/60 font-serif text-lg animate-pulse">
        Loading...
      </div>
    </div>
  );
}
