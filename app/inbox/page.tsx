'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { OceanBackground } from '@/components/visual/OceanBackground';
import { WebLayout } from '@/components/layout/WebLayout';
import { FloatingDock } from '@/components/layout/FloatingDock';
import { InboxPage } from '@/components/pages/InboxPage';
import { subscribeToInbox, markBottleAsRead } from '@/lib/services/firestore';
import { isDemoMode } from '@/lib/firebase';
import { useAuthContext } from '@/lib/context/AuthContext';
import type { Bottle } from '@/types';

export default function InboxRoute() {
  const router = useRouter();
  const [myBottles, setMyBottles] = useState<Bottle[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
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
    setDataLoading(true);
    const userId = isDemoMode ? 'demo-user' : (user?.id || 'demo-user');

    const unsubscribe = subscribeToInbox(userId, (bottles: Bottle[]) => {
      setMyBottles(bottles);
      setDataLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  const handleOpenBottle = async (bottle: Bottle) => {
    if (bottle.unread) {
      const userId = isDemoMode ? 'demo-user' : (user?.id || 'demo-user');
      try {
        await markBottleAsRead(userId, bottle.id);
      } catch (e) { 
        console.error(e); 
      }
    }
    
    router.push(`/chat?id=${bottle.id}`);
  };

  const handleLogout = async () => {
    const { logout } = await import('@/lib/services/auth');
    await logout();
    router.push('/auth');
  };

  if (isWeb) {
    return (
      <WebLayout 
        page="inbox"
        onNavigate={(dest) => router.push(`/${dest}`)}
        unreadCount={myBottles.filter(b => b.unread).length}
        onLogout={handleLogout}
      >
        <OceanBackground isWeb={true} />
        <div className="absolute inset-0 z-10 transition-opacity duration-500 h-full overflow-hidden">
          <InboxPage 
            onNavigate={handleNavigate} 
            bottles={myBottles} 
            onOpenBottle={handleOpenBottle} 
            isLoading={dataLoading}
            isWeb={true}
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
          <InboxPage 
            onNavigate={handleNavigate} 
            bottles={myBottles} 
            onOpenBottle={handleOpenBottle} 
            isLoading={dataLoading}
            isWeb={false}
          />
        </div>
        <FloatingDock 
          activePage="inbox"
          onNavigate={(dest) => router.push(`/${dest}`)}
          unreadCount={myBottles.filter(b => b.unread).length}
        />
      </div>
    </div>
  );
}

