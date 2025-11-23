'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { catchBottle } from '@/lib/services/firestore';
import { useAuthContext } from '@/lib/context/AuthContext';

const isPermissionError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  const err = error as { code?: string; message?: string };
  const message = typeof err.message === 'string' ? err.message.toLowerCase() : '';
  return err.code === 'permission-denied' || message.includes('missing or insufficient permissions');
};

export default function CatchRoute() {
  const router = useRouter();
  const [error, setError] = useState<'GUEST_LIMIT_REACHED' | 'USER_LIMIT_REACHED' | 'AUTH_REQUIRED' | null>(null);
  const { user, isGuest, isLoading } = useAuthContext();

  useEffect(() => {
    const handleCatch = async () => {
      console.log('[Catch Route] handleCatch called - isLoading:', isLoading, 'user:', user);
      
      if (isLoading) {
        console.log('[Catch Route] Still loading, waiting...');
        return; // Wait for auth to settle
      }
      
      try {
        const userId = user?.id || null;
        const isAnonymous = user?.isAnonymous || false;
        
        console.log('[Catch Route] Attempting catch - userId:', userId, 'isAnonymous:', isAnonymous);
        
        if (!userId) {
          // If not loading and no user, something failed or auth didn't happen
          console.error('[Catch Route] No userId! Setting AUTH_REQUIRED error');
          setError('AUTH_REQUIRED');
          return;
        }
        
        const bottle = await catchBottle(userId, isAnonymous);
        console.log('[Catch Route] Successfully caught bottle:', bottle.id);
        router.push(`/chat?id=${bottle.id}`);
      } catch (e: any) {
        console.error('[Catch Route] Error:', e);
        console.error('[Catch Route] Error message:', e.message);
        console.error('[Catch Route] Error code:', e.code);
        
        if (e.message === 'USER_LIMIT_REACHED') {
          setError('USER_LIMIT_REACHED');
          return;
        }
        if (e.message === 'GUEST_LIMIT_REACHED') {
          setError('GUEST_LIMIT_REACHED');
          return;
        }
        if (e.message === 'AUTH_REQUIRED' || isPermissionError(e)) {
          setError('AUTH_REQUIRED');
          return;
        }

        router.push('/home?error=catch-failed');
      }
    };

    handleCatch();
  }, [router, user, isLoading]);

  if (error) {
    const isUserLimit = error === 'USER_LIMIT_REACHED';
    const isAuthRequired = error === 'AUTH_REQUIRED';
    const isGuestLimit = error === 'GUEST_LIMIT_REACHED';
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="bg-slate-900/95 border border-amber-500/30 rounded-2xl p-6 max-w-md backdrop-blur-xl">
          <h3 className="text-2xl font-serif text-white mb-2">
            {isUserLimit
              ? 'Daily Action Limit Reached'
              : isAuthRequired
                ? 'Sign In Required'
                : 'Daily Catch Limit Reached'}
          </h3>
          <p className="text-white/70 mb-6">
            {isUserLimit
              ? "You've used all 10 bottle actions for today. Come back tomorrow to continue your voyage!"
              : isAuthRequired
                ? 'This action needs a signed-in account. Please sign in to keep exploring the ocean.'
                : "You've used all 3 catch actions for today. Sign in to continue throwing and catching bottles!"}
          </p>
          {isUserLimit ? (
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/home')}
                className="flex-1 px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
              >
                Go Home
              </button>
              <button
                onClick={() => setError(null)}
                className="flex-1 px-4 py-2 rounded-xl bg-white/15 border border-white/20 text-white hover:bg-white/25 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/home')}
                className="flex-1 px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
              >
                Go Home
              </button>
              <button
                onClick={() => router.push('/auth')}
                className="flex-1 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-100 hover:bg-amber-500/30 transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-slate-900">
      <div className="text-white/60 font-serif text-lg animate-pulse">
        Catching a bottle...
      </div>
    </div>
  );
}

