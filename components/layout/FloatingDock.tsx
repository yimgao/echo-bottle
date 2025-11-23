'use client';

import { Compass, Send, MessageCircle, User } from 'lucide-react';
import type { FloatingDockProps, PageType } from '@/types';
import { useAuthContext } from '@/lib/context/AuthContext';

interface DockItem {
  id: PageType;
  icon: typeof Compass;
  label: string;
  badge?: number;
  requireSignIn?: boolean;
  requireVerified?: boolean;
}

export const FloatingDock = ({ activePage, onNavigate, unreadCount }: FloatingDockProps) => {
  const { isSignedIn, isVerified, needsVerification } = useAuthContext();

  const navItems: DockItem[] = [
    { id: 'home', icon: Compass, label: 'Ocean' },
    { id: 'create', icon: Send, label: 'Cast' },
    { id: 'inbox', icon: MessageCircle, label: 'Collection', badge: unreadCount }, // ✅ Guest users can access their inbox
    { id: 'profile', icon: User, label: 'Me', requireSignIn: true },
  ];

  const handleNav = (dest: PageType, item: DockItem) => {
    if (item.requireVerified && !(isSignedIn && isVerified)) {
      onNavigate('auth');
      return;
    }
    if (item.requireSignIn && !isSignedIn) {
      onNavigate('auth');
      return;
    }
    onNavigate(dest);
  };

  return (
    <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-50 flex justify-center items-center animate-fade-in-up px-4">
      <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-2.5 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/40">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id, item)}
              className={`
                relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 group touch-target active:scale-95 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed
                ${isActive ? 'bg-white text-slate-900 scale-105 sm:scale-110 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'text-white/60 hover:text-white hover:bg-white/10'}
              `}
              disabled={(item.requireSignIn && !isSignedIn) || (item.requireVerified && !(isSignedIn && isVerified))}
            >
              <Icon size={20} className="sm:w-6 sm:h-6" strokeWidth={isActive ? 2.5 : 2} />
              {item.badge && item.badge > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-rose-500 rounded-full border-2 border-slate-900" />
              )}
              <span className="absolute -top-10 sm:-top-12 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-1 bg-black/80 text-white text-[9px] sm:text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap backdrop-blur-sm border border-white/10">
                {((item.requireVerified && !(isSignedIn && isVerified)) || (item.requireSignIn && !isSignedIn))
                  ? item.requireVerified && !(isSignedIn && isVerified)
                    ? needsVerification
                      ? 'Verify email'
                      : 'Sign in'
                    : 'Sign in'
                  : item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
