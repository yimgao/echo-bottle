'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { OceanBackground } from '@/components/visual/OceanBackground';
import { WebLayout } from '@/components/layout/WebLayout';
import { FloatingDock } from '@/components/layout/FloatingDock';
import { CreatePage } from '@/components/pages/CreatePage';
import { sendBottle } from '@/lib/services/firestore';
import type { MoodType } from '@/types';

const isPermissionError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  const err = error as { code?: string; message?: string };
  const message = typeof err.message === 'string' ? err.message.toLowerCase() : '';
  return err.code === 'permission-denied' || message.includes('missing or insufficient permissions');
};

export default function CreateRoute() {
  const router = useRouter();
  const [isWeb, setIsWeb] = useState<boolean>(false);
  const [limitModalType, setLimitModalType] = useState<'guest' | 'user' | 'auth' | null>(null);
  const showLimitModal = limitModalType !== null;

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

  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  const handleSendConfirm = async ({ text, mood }: { text: string; mood: MoodType }) => {
    try {
      await sendBottle(text, mood);
      // Trigger storage event to update guest status - wait a bit for localStorage to update
      if (typeof window !== 'undefined') {
        // Small delay to ensure localStorage is updated
        setTimeout(() => {
          window.dispatchEvent(new Event('echobottle_guest_action'));
          // Also trigger storage event manually for same-tab updates
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'echobottle_guest_actions',
            newValue: localStorage.getItem('echobottle_guest_actions')
          }));
        }, 100);
      }
      // Small delay before redirect to ensure event is processed
      setTimeout(() => {
        router.push('/home?success=bottle-sent');
      }, 200);
    } catch (e: any) {
      console.error("Error sending bottle:", e);
      if (e.message === 'GUEST_THROW_LIMIT_REACHED') {
        // Show modal and prevent redirect
        setLimitModalType('guest');
        // Don't redirect - let modal show
        return;
      }
      if (e.message === 'USER_LIMIT_REACHED') {
        setLimitModalType('user');
        // Don't redirect - let modal show
        return;
      }
      if (isPermissionError(e)) {
        setLimitModalType('auth');
        // Don't redirect - let modal show
        return;
      } else {
        router.push('/home?error=send-failed');
      }
    }
  };

  const handleLogout = async () => {
    const { logout } = await import('@/lib/services/auth');
    await logout();
    router.push('/auth');
  };

  const handleSignIn = () => {
    router.push('/auth');
  };

  if (isWeb) {
    return (
      <WebLayout 
        page="create"
        onNavigate={(dest) => router.push(`/${dest}`)}
        unreadCount={0}
        onLogout={handleLogout}
      >
        <OceanBackground isWeb={true} />
        <div className="absolute inset-0 z-10 transition-opacity duration-500 h-full overflow-hidden">
          {showLimitModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-slate-900/95 border border-amber-500/30 rounded-2xl p-6 max-w-md mx-4 backdrop-blur-xl">
                <h3 className="text-2xl font-serif text-white mb-2">
                  {limitModalType === 'user'
                    ? 'Daily Action Limit Reached'
                    : limitModalType === 'auth'
                      ? 'Sign In Required'
                      : 'Daily Throw Limit Reached'}
                </h3>
                <p className="text-white/70 mb-6">
                  {limitModalType === 'user'
                    ? "You've used all 10 bottle actions for today. Come back tomorrow to keep drifting!"
                    : limitModalType === 'auth'
                      ? 'This action needs a signed-in account. Please sign in to continue your journey.'
                      : "You've used all 3 guest actions for today. Sign in to continue throwing and catching bottles!"}
                </p>
                {limitModalType === 'user' ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setLimitModalType(null)}
                      className="flex-1 px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => router.push('/home')}
                      className="flex-1 px-4 py-2 rounded-xl bg-white/15 border border-white/20 text-white hover:bg-white/25 transition-colors"
                    >
                      Go Home
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setLimitModalType(null)}
                      className="flex-1 px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSignIn}
                      className="flex-1 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-100 hover:bg-amber-500/30 transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          <CreatePage onNavigate={handleNavigate} onSend={handleSendConfirm} isWeb={true} />
        </div>
      </WebLayout>
    );
  }

  // Mobile/Tablet layout
  return (
    <div className="w-full h-full overflow-hidden relative md:flex md:items-center md:justify-center md:min-h-screen md:bg-slate-900">
      <div className="w-full h-full overflow-hidden relative md:max-w-[400px] md:h-[800px] md:rounded-[3rem] md:shadow-2xl md:ring-8 md:ring-slate-800">
        <OceanBackground isWeb={false} />
        <div className="absolute inset-0 z-10 transition-opacity duration-500 h-full overflow-hidden">
          {showLimitModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-slate-900/95 border border-amber-500/30 rounded-2xl p-6 w-full max-w-sm backdrop-blur-xl">
                <h3 className="text-xl font-serif text-white mb-2">
                  {limitModalType === 'user'
                    ? 'Daily Action Limit Reached'
                    : limitModalType === 'auth'
                      ? 'Sign In Required'
                      : 'Daily Throw Limit Reached'}
                </h3>
                <p className="text-white/70 mb-6 text-sm">
                  {limitModalType === 'user'
                    ? "You've used all 10 bottle actions for today. Come back tomorrow to keep drifting!"
                    : limitModalType === 'auth'
                      ? 'This action needs a signed-in account. Please sign in to continue your journey.'
                      : "You've used all 3 guest actions for today. Sign in to continue!"}
                </p>
                {limitModalType === 'user' ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setLimitModalType(null)}
                      className="flex-1 px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-colors text-sm"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => router.push('/home')}
                      className="flex-1 px-4 py-2 rounded-xl bg-white/15 border border-white/20 text-white hover:bg-white/25 transition-colors text-sm"
                    >
                      Go Home
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setLimitModalType(null)}
                      className="flex-1 px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSignIn}
                      className="flex-1 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-100 hover:bg-amber-500/30 transition-colors text-sm"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          <CreatePage onNavigate={handleNavigate} onSend={handleSendConfirm} isWeb={false} />
        </div>
        <FloatingDock 
          activePage="create"
          onNavigate={(dest) => router.push(`/${dest}`)}
          unreadCount={0}
        />
      </div>
    </div>
  );
}

