'use client';

import { Send, MessageCircle, LogOut, Compass, User } from 'lucide-react';
import type { WebLayoutProps } from '@/types';
import { useAuthContext } from '@/lib/context/AuthContext';

type NavRequirements = {
  requireSignIn?: boolean;
  requireVerified?: boolean;
};

export const WebLayout = ({ children, page, onNavigate, unreadCount, onLogout }: WebLayoutProps) => {
  const { isSignedIn, isVerified, needsVerification } = useAuthContext();

  const handleNav = (dest: Parameters<WebLayoutProps['onNavigate']>[0], requirements: NavRequirements = {}) => {
    if (requirements.requireVerified && !(isSignedIn && isVerified)) {
      onNavigate('auth');
      return;
    }
    if (requirements.requireSignIn && !isSignedIn) {
      onNavigate('auth');
      return;
    }
    onNavigate(dest);
  };

  return (
    <div className="h-full flex relative">
      <div className="w-80 bg-slate-900/80 backdrop-blur-2xl border-r border-white/20 shadow-2xl flex flex-col p-6 z-20">
        <div className="mb-12 mt-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500/30 to-blue-500/20 backdrop-blur-xl border border-cyan-400/30 flex items-center justify-center shadow-lg">
              <span className="text-2xl filter drop-shadow-lg">🍾</span>
            </div>
            <h1 className="text-2xl font-serif tracking-wide text-white">
              EchoBottle
            </h1>
          </div>
          <p className="text-cyan-200/60 text-xs font-light italic ml-16">Messages in the tide</p>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => handleNav('home')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left ${
              page === 'home'
                ? 'bg-cyan-500/20 border border-cyan-400/30 text-white shadow-lg shadow-cyan-500/10'
                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            <Compass size={18} className={page === 'home' ? 'text-cyan-300' : ''} />
            <span className="font-medium">Ocean</span>
          </button>

          <button
            onClick={() => handleNav('create')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left ${
              page === 'create'
                ? 'bg-cyan-500/20 border border-cyan-400/30 text-white shadow-lg shadow-cyan-500/10'
                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            <Send size={18} className={page === 'create' ? 'text-cyan-300' : ''} />
            <span className="font-medium">Cast a Bottle</span>
          </button>

          <button
            onClick={() => handleNav('inbox')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left relative ${
              page === 'inbox'
                ? 'bg-cyan-500/20 border border-cyan-400/30 text-white shadow-lg shadow-cyan-500/10'
                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            <div className="relative">
              <MessageCircle size={18} className={page === 'inbox' ? 'text-cyan-300' : ''} />
              {unreadCount > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
                </>
              )}
            </div>
            <span className="font-medium">My Collection</span>
            {unreadCount > 0 && (
              <span className="ml-auto bg-rose-500/30 text-rose-100 text-xs px-2 py-1 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNav('profile', { requireSignIn: true })}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed ${
              page === 'profile'
                ? 'bg-cyan-500/20 border border-cyan-400/30 text-white shadow-lg shadow-cyan-500/10'
                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20'
            }`}
            disabled={!isSignedIn}
          >
            <User size={18} className={page === 'profile' ? 'text-cyan-300' : ''} />
            <span className="font-medium">My Journal</span>
            {!isSignedIn && (
              <span className="ml-auto text-[10px] text-amber-200/80 italic pr-1">
                Sign in
              </span>
            )}
            {isSignedIn && needsVerification && (
              <span className="ml-auto text-[10px] text-amber-200/80 italic pr-1">
                Verify email
              </span>
            )}
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/20">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all"
          >
            <LogOut size={18} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>
    </div>
  );
};
