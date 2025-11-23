'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { OceanBackground } from '@/components/visual/OceanBackground';
import { WebLayout } from '@/components/layout/WebLayout';
import { ChatPage } from '@/components/pages/ChatPage';
import { subscribeToInbox } from '@/lib/services/firestore';
import { isDemoMode } from '@/lib/firebase';
import { useAuthContext } from '@/lib/context/AuthContext';
import type { Bottle } from '@/types';

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeBottle, setActiveBottle] = useState<Bottle | null>(null);
  const [myBottles, setMyBottles] = useState<Bottle[]>([]);
  const [isWeb, setIsWeb] = useState<boolean>(false);
  const { user } = useAuthContext();

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
    const userId = isDemoMode ? 'demo-user' : (user?.id || 'demo-user');
    const bottleId = searchParams.get('id');

    if (!bottleId) {
      router.push('/inbox');
      return;
    }

    const unsubscribe = subscribeToInbox(userId, (bottles: Bottle[]) => {
      setMyBottles(bottles);
      
      // Find the bottle with matching ID
      const foundBottle = bottles.find(b => b.id === bottleId);
      if (foundBottle) {
        setActiveBottle({ ...foundBottle, unread: false });
      } else {
        // If not found, redirect to inbox
        router.push('/inbox');
      }
    });

    return () => unsubscribe();
  }, [searchParams, router, user]);

  const handleBack = () => {
    router.push('/inbox');
  };

  const handleLogout = async () => {
    const { logout } = await import('@/lib/services/auth');
    await logout();
    router.push('/auth');
  };

  if (!activeBottle) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white/60 font-serif text-lg animate-pulse">
          Loading bottle...
        </div>
      </div>
    );
  }

  if (isWeb) {
    return (
      <WebLayout 
        page="chat"
        onNavigate={(dest) => router.push(`/${dest}`)}
        unreadCount={myBottles.filter(b => b.unread).length}
        onLogout={handleLogout}
      >
        <OceanBackground isWeb={true} />
        <div className="absolute inset-0 z-10 transition-opacity duration-500 h-full overflow-hidden">
          <ChatPage onBack={handleBack} bottle={activeBottle} isWeb={true} />
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
          <ChatPage onBack={handleBack} bottle={activeBottle} isWeb={false} />
        </div>
      </div>
    </div>
  );
}

export default function ChatRoute() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white/60 font-serif text-lg animate-pulse">
          Loading bottle...
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}

