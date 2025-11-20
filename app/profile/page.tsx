'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { OceanBackground } from '@/components/visual/OceanBackground';
import { WebLayout } from '@/components/layout/WebLayout';
import { FloatingDock } from '@/components/layout/FloatingDock';
import { ProfilePage } from '@/components/pages/ProfilePage';
import { auth, isDemoMode } from '@/lib/firebase';
import type { User } from '@/types';

export default function ProfileRoute() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isWeb, setIsWeb] = useState<boolean>(false);

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
    if (isDemoMode) {
      setUser({ name: "Traveler", id: "demo-user" });
    } else if (auth?.currentUser) {
      setUser({ 
        name: auth.currentUser.displayName || "Anonymous", 
        id: auth.currentUser.uid 
      });
    }
  }, []);

  const handleLogout = async () => {
    const { logout } = await import('@/lib/services/auth');
    await logout();
    router.push('/auth');
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
            user={user}
            onLogout={handleLogout}
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
            user={user}
            onLogout={handleLogout}
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

