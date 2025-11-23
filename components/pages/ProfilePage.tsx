'use client';

import { useState } from 'react';
import { User, Send, Mail, RefreshCcw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/visual/GlassCard';
import type { ProfilePageProps } from '@/types';

export const ProfilePage = ({ onLogout, user, isWeb = false, onResendVerification, collectedCount = 0, thrownCount = 0, statsLoading = false }: ProfilePageProps) => {
  const [resendState, setResendState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState<string>('');

  const isAnonymous = user?.isAnonymous;
  const showVerificationBlock = Boolean(user && !isAnonymous);
  const isVerified = Boolean(user?.emailVerified);

  const handleResend = async () => {
    if (!onResendVerification) return;
    try {
      setResendState('loading');
      setResendMessage('');
      await onResendVerification();
      setResendState('success');
      setResendMessage('Verification email sent! Check your inbox.');
    } catch (error: any) {
      setResendState('error');
      setResendMessage(error?.message || 'Failed to send verification email.');
    }
  };

  return (
    <div className={`h-full w-full flex flex-col p-4 sm:p-6 pt-8 sm:pt-10 ${!isWeb ? 'pb-24 sm:pb-28' : 'pb-8'} max-w-2xl mx-auto overflow-y-auto custom-scrollbar animate-fade-in`}>
      {!isWeb && (
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-serif text-white">My Journal</h2>
          <button 
            onClick={onLogout} 
            className="px-3 sm:px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs text-white/60 hover:bg-white/10 hover:text-white transition-colors tracking-wider uppercase touch-target min-h-[44px]"
          >
            Sign Out
          </button>
        </div>
      )}

      {isWeb && (
        <div className="mb-4 sm:mb-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white/90 mb-2">My Journal</h2>
          <p className="text-white/50 text-xs sm:text-sm lg:text-base font-light italic">Your journey across the ocean</p>
        </div>
      )}

      <GlassCard className="p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] mb-6 sm:mb-8 bg-gradient-to-br from-white/5 to-transparent border-white/10">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-white/20 to-white/5 flex items-center justify-center shadow-2xl border border-white/20 shrink-0">
            <User size={28} className="sm:w-9 sm:h-9 text-white/80" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-serif text-xl sm:text-2xl mb-1 truncate">{user?.name || 'Anonymous Traveler'}</h3>
            <p className="text-white/60 text-[10px] sm:text-xs uppercase tracking-widest mb-2 sm:mb-3">Level 1 • Beachcomber</p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-2 py-1 rounded bg-white/10 text-[9px] sm:text-[10px] text-white/80">🌊 Ocean Born</span>
              <span className="px-2 py-1 rounded bg-white/10 text-[9px] sm:text-[10px] text-white/80">🐚 Collector</span>
            </div>
          </div>
        </div>
        <div className="mt-6 sm:mt-8 flex gap-3 sm:gap-4">
          <div className="flex-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-black/30 border border-white/5 text-center backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-serif text-white mb-1 flex items-center justify-center gap-2">
              {statsLoading ? <Loader2 size={20} className="animate-spin text-white/70" /> : collectedCount}
            </div>
            <div className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest">Collected</div>
          </div>
          <div className="flex-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-black/30 border border-white/5 text-center backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-serif text-white mb-1 flex items-center justify-center gap-2">
              {statsLoading ? <Loader2 size={20} className="animate-spin text-white/70" /> : thrownCount}
            </div>
            <div className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest">Thrown</div>
          </div>
        </div>

        {showVerificationBlock && (
          <div className="mt-6 sm:mt-8 p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-white/60" />
              <div>
                <p className="text-sm text-white/80">{user?.email || 'No email on file'}</p>
                <p className={`text-xs font-semibold ${isVerified ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {isVerified ? 'Email verified' : 'Email not verified'}
                </p>
              </div>
            </div>
            {!isVerified && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleResend}
                  disabled={resendState === 'loading'}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-100 hover:bg-amber-500/30 transition-colors text-xs sm:text-sm font-semibold touch-target disabled:opacity-60"
                >
                  <RefreshCcw size={14} className={resendState === 'loading' ? 'animate-spin' : ''} />
                  Resend verification email
                </button>
                {resendState === 'success' && (
                  <div className="flex items-center gap-2 text-emerald-300 text-xs">
                    <CheckCircle size={14} />
                    <span>{resendMessage}</span>
                  </div>
                )}
                {resendState === 'error' && (
                  <div className="flex items-center gap-2 text-rose-300 text-xs">
                    <AlertCircle size={14} />
                    <span>{resendMessage}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </GlassCard>

      <h3 className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-widest mb-3 sm:mb-4 ml-2">Sent History</h3>
      <div className="space-y-2 sm:space-y-3">
        {thrownCount > 0 ? (
          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors active:scale-[0.98] touch-target">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
              <Send size={14} className="sm:w-4 sm:h-4 text-white/40"/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="h-2 w-3/4 bg-white/10 rounded-full mb-2" />
              <div className="h-2 w-1/3 bg-white/10 rounded-full" />
            </div>
            <span className="text-[9px] sm:text-[10px] text-white/20 uppercase tracking-widest shrink-0">Recent</span>
          </div>
        ) : (
          <p className="text-white/30 text-xs sm:text-sm text-center py-6 sm:py-8 font-serif italic px-4">No messages sent yet. Cast your first bottle into the ocean.</p>
        )}
      </div>
    </div>
  );
};
