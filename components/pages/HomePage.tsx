'use client';

import { Send, MessageCircle } from 'lucide-react';
import { Header } from '@/components/visual/Header';
import type { HomePageProps } from '@/types';

export const HomePage = ({ onNavigate, unreadCount, onLogout, isWeb = false, availableBottles = 0, guestStatus }: HomePageProps) => {
  const handleCatchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigate('catch');
  };

  return (
    <div className={`h-full flex flex-col relative p-4 sm:p-6 lg:p-12 ${!isWeb ? 'pb-24 sm:pb-28' : ''}`}>
      {!isWeb && (
        <Header 
          rightElement={
              <button onClick={onLogout} className="text-white/30 hover:text-white/80 transition-colors text-xs uppercase tracking-widest font-bold touch-target">
                  Sign Out
              </button>
          } 
        />
      )}
      
      <div className={`flex-1 flex flex-col ${isWeb ? 'justify-center items-center' : 'items-center justify-center'} relative z-10`}>
        <div className="relative mb-8 sm:mb-12 lg:mb-16 animate-float cursor-pointer group touch-target" onClick={handleCatchClick}>
           <div className="absolute inset-0 bg-cyan-400/20 blur-[60px] rounded-full group-hover:bg-cyan-400/30 transition-all duration-1000" />
           <div className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 relative">
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl transform rotate-12 group-hover:rotate-6 transition-transform duration-700 ease-in-out">
                <path d="M85,160 C50,160 40,130 45,80 C50,30 80,10 95,5 L105,5 C120,10 150,30 155,80 C160,130 150,160 115,160 Z" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                <rect x="90" y="2" width="20" height="10" fill="#D4A373" rx="2" />
                <path d="M70,100 Q100,120 130,90" stroke="rgba(255,255,255,0.6)" strokeWidth="3" fill="none" strokeLinecap="round" />
                <rect x="85" y="80" width="30" height="40" fill="white" rx="2" opacity="0.6" className="animate-pulse"/>
              </svg>
           </div>
           <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-cyan-200/80 text-sm tracking-widest uppercase font-light opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              Tap to Catch
           </div>
        </div>
        <h2 className={`${isWeb ? 'text-4xl sm:text-5xl lg:text-6xl' : 'text-2xl sm:text-3xl'} font-serif text-white/90 text-center leading-relaxed mb-2 sm:mb-3 drop-shadow-lg px-4`}>
          The ocean keeps <br/> <span className="italic text-cyan-200">everyone&apos;s secrets.</span>
        </h2>
        <p className={`${isWeb ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'} text-white/50 font-light tracking-wide mb-2 sm:mb-3 px-4`}>What will you find today?</p>
        {availableBottles > 0 && (
          <p className={`${isWeb ? 'text-sm' : 'text-xs'} text-cyan-300/80 font-light mb-6 sm:mb-8 px-4 text-center`}>
            🌊 {availableBottles} {availableBottles === 1 ? 'bottle' : 'bottles'} drifting in the ocean
          </p>
        )}
        {availableBottles === 0 && !guestStatus?.hasReachedLimit && (
          <p className={`${isWeb ? 'text-sm' : 'text-xs'} text-white/40 font-light mb-6 sm:mb-8 px-4 text-center italic`}>
            The ocean is calm... throw the first bottle!
          </p>
        )}
        {guestStatus && guestStatus.isGuest && !guestStatus.hasReachedLimit && (
          <div className={`${isWeb ? 'text-xs' : 'text-[10px]'} text-amber-300/80 font-light mb-4 sm:mb-6 px-4 text-center bg-amber-500/10 border border-amber-500/20 rounded-full py-2 max-w-xs mx-auto`}>
            🎁 Guest Mode: {guestStatus.actionsRemaining} action{guestStatus.actionsRemaining !== 1 ? 's' : ''} remaining today
          </div>
        )}
        {guestStatus && guestStatus.isGuest && guestStatus.hasReachedLimit && (
          <div className={`${isWeb ? 'text-xs' : 'text-[10px]'} text-amber-200/90 font-medium mb-4 sm:mb-6 px-4 text-center bg-amber-500/20 border border-amber-400/30 rounded-full py-2 max-w-xs mx-auto`}>
            ⚠️ Daily limit reached! <button onClick={() => onNavigate('auth' as any)} className="underline font-bold hover:text-amber-100 transition-colors">Sign in</button> for unlimited access
          </div>
        )}
        <div className={`w-full px-4 ${isWeb ? 'max-w-md' : 'max-w-xs'} space-y-3 sm:space-y-4`}>
          <button 
            onClick={() => onNavigate('create')}
            className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 p-4 sm:p-5 transition-all hover:bg-cyan-500/30 hover:border-cyan-400/60 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] active:scale-95 touch-target min-h-[56px]"
          >
            <div className="flex items-center justify-center gap-3 text-cyan-100 group-hover:text-white font-medium tracking-wide text-sm sm:text-base">
              <Send size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" />
              <span>Cast a Bottle</span>
            </div>
          </button>
          <button 
            onClick={() => onNavigate('inbox')}
            className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 transition-all hover:bg-white/10 flex items-center justify-center gap-2 text-white/60 hover:text-white active:scale-95 touch-target min-h-[56px] text-sm sm:text-base"
          >
            <div className="relative">
               <MessageCircle size={18} />
               {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />}
               {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />}
            </div>
            <span>My Collection</span>
          </button>
        </div>
      </div>
    </div>
  );
};
