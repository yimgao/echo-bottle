'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { OceanBackground } from '@/components/visual/OceanBackground';
import { WebLayout } from '@/components/layout/WebLayout';
import { FloatingDock } from '@/components/layout/FloatingDock';
import { HomePage } from '@/components/pages/HomePage';
import { subscribeToInbox, getAvailableBottlesCount } from '@/lib/services/firestore';
import { auth, isDemoMode } from '@/lib/firebase';
import type { Bottle } from '@/types';
import { CheckCircle, XCircle } from 'lucide-react';
import { useGuestContext } from '@/lib/context/GuestContext';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [myBottles, setMyBottles] = useState<Bottle[]>([]);
  const [isWeb, setIsWeb] = useState<boolean>(false);
  const [availableBottles, setAvailableBottles] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const { status: guestStatus, refresh: refreshGuestStatus } = useGuestContext();

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

  useEffect(() => {
    // Check for success/error messages
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    
    if (success === 'bottle-sent') {
      refreshGuestStatus();
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.replace('/home');
      }, 3000);
    }
    
    if (error === 'send-failed') {
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
        router.replace('/home');
      }, 3000);
    }
  }, [searchParams, router, refreshGuestStatus]);

  useEffect(() => {
    setMyBottles([]);
    const userId = isDemoMode ? 'demo-user' : (auth?.currentUser?.uid || 'demo-user');

    const unsubscribe = subscribeToInbox(userId, (bottles: Bottle[]) => {
      setMyBottles(bottles);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const count = await getAvailableBottlesCount();
        setAvailableBottles(count);
      } catch (e) {
        console.error("Error fetching bottles count:", e);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (dest: string) => {
    if (dest === 'catch') {
      router.push('/catch');
    } else {
      router.push(`/${dest}`);
    }
  };

  const handleLogout = async () => {
    const { logout } = await import('@/lib/services/auth');
    await logout();
    router.push('/auth');
  };

  if (isWeb) {
    return (
      <WebLayout 
        page="home"
        onNavigate={handleNavigate}
        unreadCount={myBottles.filter(b => b.unread).length}
        onLogout={handleLogout}
      >
        <OceanBackground isWeb={true} />
        <div className="absolute inset-0 z-10 transition-opacity duration-500 h-full overflow-hidden">
          {showSuccess && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
              <div className="bg-green-500/20 border border-green-400/30 backdrop-blur-xl rounded-2xl px-6 py-4 flex items-center gap-3 shadow-2xl">
                <CheckCircle size={20} className="text-green-400" />
                <span className="text-green-100 font-medium">Bottle thrown into the ocean! 🌊</span>
              </div>
            </div>
          )}
          {showError && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
              <div className="bg-rose-500/20 border border-rose-400/30 backdrop-blur-xl rounded-2xl px-6 py-4 flex items-center gap-3 shadow-2xl">
                <XCircle size={20} className="text-rose-400" />
                <span className="text-rose-100 font-medium">Failed to send bottle. Try again.</span>
              </div>
            </div>
          )}
              <HomePage 
                onNavigate={handleNavigate} 
                unreadCount={myBottles.filter(b => b.unread).length} 
                onLogout={handleLogout}
                isWeb={true}
                availableBottles={availableBottles}
              />
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
          {showSuccess && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] animate-fade-in-up">
              <div className="bg-green-500/20 border border-green-400/30 backdrop-blur-xl rounded-2xl px-4 py-3 flex items-center gap-2 shadow-2xl">
                <CheckCircle size={18} className="text-green-400 shrink-0" />
                <span className="text-green-100 font-medium text-sm">Bottle thrown! 🌊</span>
              </div>
            </div>
          )}
          {showError && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] animate-fade-in-up">
              <div className="bg-rose-500/20 border border-rose-400/30 backdrop-blur-xl rounded-2xl px-4 py-3 flex items-center gap-2 shadow-2xl">
                <XCircle size={18} className="text-rose-400 shrink-0" />
                <span className="text-rose-100 font-medium text-sm">Failed to send. Try again.</span>
              </div>
            </div>
          )}
          <HomePage 
            onNavigate={handleNavigate} 
            unreadCount={myBottles.filter(b => b.unread).length} 
            onLogout={handleLogout}
            isWeb={false}
            availableBottles={availableBottles}
          />
        </div>
        <FloatingDock 
          activePage="home"
          onNavigate={handleNavigate}
          unreadCount={myBottles.filter(b => b.unread).length}
        />
      </div>
    </div>
  );
}

export default function HomeRoute() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white/60 font-serif text-lg animate-pulse">Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

