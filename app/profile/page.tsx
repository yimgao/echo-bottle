'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { OceanBackground } from '@/components/visual/OceanBackground';
import { WebLayout } from '@/components/layout/WebLayout';
import { FloatingDock } from '@/components/layout/FloatingDock';
import { ProfilePage } from '@/components/pages/ProfilePage';
import { isDemoMode } from '@/lib/firebase';
import { useAuthContext } from '@/lib/context/AuthContext';
import { subscribeToInbox, countUserSentBottles } from '@/lib/services/firestore';
import type { User } from '@/types';

export default function ProfileRoute() {
  const router = useRouter();
  const [isWeb, setIsWeb] = useState<boolean>(false);
  const { user } = useAuthContext();
  const [collectedCount, setCollectedCount] = useState<number>(0);
  const [thrownCount, setThrownCount] = useState<number>(0);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);

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

  const demoMode = useMemo(() => isDemoMode, []);

  const resolvedUser: User | null = useMemo(() => {
    if (demoMode) {
      return { name: 'Traveler', id: 'demo-user', email: null, emailVerified: true, isAnonymous: true };
    }
    return user || null;
  }, [demoMode, user]);

  useEffect(() => {
    if (demoMode || !resolvedUser || resolvedUser.isAnonymous) {
      setCollectedCount(0);
      setThrownCount(0);
      setStatsLoading(false);
      return;
    }

    setStatsLoading(true);
    let unsubscribe: (() => void) | undefined;

    unsubscribe = subscribeToInbox(resolvedUser.id, (bottles) => {
      setCollectedCount(bottles.length);
    });

    countUserSentBottles(resolvedUser.id)
      .then((count) => setThrownCount(count))
      .finally(() => setStatsLoading(false));

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [resolvedUser, demoMode]);

  const handleLogout = async () => {
    const { logout } = await import('@/lib/services/auth');
    await logout();
    router.push('/auth');
  };

  const handleResendVerification = async () => {
    const { resendVerificationEmail } = await import('@/lib/services/auth');
    await resendVerificationEmail();
  };

  if (isWeb) {
    return (
      <WebLayout 
        page="profile"
        onNavigate={(dest) => router.push(`/${dest}`)}
        unreadCount={0}
        onLogout={handleLogout}
      >
        <OceanBackground isWeb={true} />
        <div className="absolute inset-0 z-10 transition-opacity duration-500 h-full overflow-hidden">
          <ProfilePage 
            user={resolvedUser}
            onLogout={handleLogout}
            onResendVerification={handleResendVerification}
            collectedCount={collectedCount}
            thrownCount={thrownCount}
            statsLoading={statsLoading}
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
          <ProfilePage 
            user={resolvedUser}
            onLogout={handleLogout}
            onResendVerification={handleResendVerification}
            collectedCount={collectedCount}
            thrownCount={thrownCount}
            statsLoading={statsLoading}
            isWeb={false}
          />
        </div>
        <FloatingDock 
          activePage="profile"
          onNavigate={(dest) => router.push(`/${dest}`)}
          unreadCount={0}
        />
      </div>
    </div>
  );
}

