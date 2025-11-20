'use client';

import { useState } from 'react';
import { Mail, Lock, Sparkles, User, Loader2 } from 'lucide-react';
import { isDemoMode } from '@/lib/firebase';
import { GlassCard } from '@/components/visual/GlassCard';
import type { AuthPageProps } from '@/types';

export const AuthPage = ({ onLogin, loadingType = null, errorMessage = null, onGuestAccess }: AuthPageProps) => {
  const [email, setEmail] = useState<string>('');
  const disableEmail = true; // Placeholder until email auth is implemented

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative z-20">
      {isDemoMode && (
        <div className="absolute top-2 sm:top-4 bg-amber-500/20 border border-amber-500/50 text-amber-200 px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] uppercase tracking-widest z-30">
          Demo Mode (No Backend)
        </div>
      )}
      <div className="mb-6 sm:mb-8 relative group">
         <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl animate-float relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            <span className="text-4xl sm:text-5xl lg:text-6xl filter drop-shadow-lg relative z-10 animate-bob">🍾</span>
            
            <div className="absolute -top-2 -right-2 opacity-60">
              <Sparkles size={16} className="text-cyan-300 animate-sparkle-1" />
            </div>
            <div className="absolute -bottom-1 -left-2 opacity-40">
              <Sparkles size={12} className="text-blue-300 animate-sparkle-2" />
            </div>
            <div className="absolute top-1/2 -right-4 opacity-50">
              <Sparkles size={14} className="text-cyan-200 animate-sparkle-3" />
            </div>
         </div>
         <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/30 blur-lg rounded-full animate-pulse" />
      </div>
      
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-3 sm:mb-4 text-center tracking-tight animate-fade-in px-4">
        EchoBottle
      </h1>
      <p className="text-white/60 text-xs sm:text-sm font-light tracking-[0.2em] uppercase mb-8 sm:mb-12 lg:mb-16 text-center px-4">Whispers in the digital tide</p>
      
      <div className="w-full max-w-md space-y-3 sm:space-y-4 px-4">
        <GlassCard 
          onClick={() => onLogin('google')}
          className={`w-full p-4 sm:p-5 rounded-xl flex items-center justify-center gap-3 cursor-pointer group hover:bg-white/10 active:scale-95 touch-target min-h-[56px] ${loadingType === 'google' ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <div className="w-6 h-6 rounded-full bg-white text-slate-900 flex items-center justify-center font-bold text-xs shadow-lg shrink-0">G</div>
          <span className="font-medium text-white/90 group-hover:text-white tracking-wide text-sm sm:text-base">
            {loadingType === 'google' ? 'Connecting...' : 'Continue with Google'}
          </span>
          {loadingType === 'google' && <Loader2 size={16} className="animate-spin text-white/70" />}
        </GlassCard>
        
        <GlassCard 
          onClick={() => onLogin('anon')}
          className={`w-full p-4 sm:p-5 rounded-xl flex items-center justify-center gap-3 cursor-pointer group hover:bg-white/10 active:scale-95 touch-target min-h-[56px] ${loadingType === 'anon' ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <User size={18} className="text-white/60 group-hover:text-white shrink-0"/>
          <span className="font-medium text-white/90 group-hover:text-white tracking-wide text-sm sm:text-base">
            {loadingType === 'anon' ? 'Drifting...' : 'Drift Anonymously'}
          </span>
          {loadingType === 'anon' && <Loader2 size={16} className="animate-spin text-white/70" />}
        </GlassCard>
        
        <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-white/30 text-xs">OR EMAIL</span>
            <div className="flex-grow border-t border-white/10"></div>
        </div>
        <div className="space-y-3">
            <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-4 py-3 sm:py-4 flex items-center gap-3 transition-all duration-300 focus-within:bg-white/10 focus-within:border-cyan-400/30 focus-within:shadow-[0_0_15px_rgba(34,211,238,0.2)] group min-h-[56px]">
                <Mail size={18} className="text-white/30 transition-colors duration-300 group-focus-within:text-cyan-300 shrink-0" />
                <input 
                    type="email" 
                    placeholder="hello@example.com" 
                    className="bg-transparent border-none text-white placeholder:text-white/20 text-sm sm:text-base focus:outline-none w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-4 py-3 sm:py-4 flex items-center gap-3 transition-all duration-300 focus-within:bg-white/10 focus-within:border-cyan-400/30 focus-within:shadow-[0_0_15px_rgba(34,211,238,0.2)] group min-h-[56px]">
                <Lock size={18} className="text-white/30 transition-colors duration-300 group-focus-within:text-cyan-300 shrink-0" />
                <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="bg-transparent border-none text-white placeholder:text-white/20 text-sm sm:text-base focus:outline-none w-full"
                />
            </div>
        </div>
        <button 
            onClick={() => onLogin('email')}
            disabled={!email || disableEmail}
            className="w-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-100 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold hover:bg-cyan-500/30 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] hover:border-cyan-400/50 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2 group relative overflow-hidden touch-target min-h-[56px] text-sm sm:text-base"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-400/20 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="relative z-10">Log In</span>
        </button>
        {errorMessage && (
          <div className="text-center text-xs sm:text-sm text-rose-300 mt-2">
            {errorMessage}
          </div>
        )}
      </div>
      
      {onGuestAccess && (
        <button
          onClick={onGuestAccess}
          className="mt-6 text-white/40 hover:text-white/60 text-xs sm:text-sm font-light tracking-wide transition-colors underline"
        >
          Continue as Guest (3 throws, 3 catches per day)
        </button>
      )}
      <p className="mt-8 text-xs text-white/30">
          By continuing, you agree to the <span className="underline hover:text-white/50 cursor-pointer">Ocean Laws</span>.
      </p>
    </div>
  );
};
