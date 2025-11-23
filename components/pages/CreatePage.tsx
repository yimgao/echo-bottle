'use client';

import { useState, useRef, useEffect } from 'react';
import { Wind, Sparkles, Waves, Droplets, Anchor, Send } from 'lucide-react';
import { Header } from '@/components/visual/Header';
import { GlassCard } from '@/components/visual/GlassCard';
import { MOODS } from '@/constants/moods';
import { TextParticles } from '@/components/visual/TextParticles';
import { useAuthContext } from '@/lib/context/AuthContext';
import { getUserDailyStatus } from '@/lib/services/firestore';
import type { CreatePageProps, MoodType, PageType } from '@/types';

type Step = 'compose' | 'sending';

export const CreatePage = ({ onNavigate, onSend, isWeb = false }: CreatePageProps) => {
  const [text, setText] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<MoodType>('talk');
  const [step, setStep] = useState<Step>('compose');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [dailyStatus, setDailyStatus] = useState<{ 
    throwUsed: number; 
    throwLimit: number; 
    throwRemaining: number; 
    catchUsed: number;
    catchLimit: number;
    catchRemaining: number;
    used: number; 
    limit: number; 
    remaining: number; 
    hasReachedLimit: boolean;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user, isGuest } = useAuthContext();

  useEffect(() => {
    const fetchDailyStatus = async () => {
      if (user && isGuest) {
        const status = await getUserDailyStatus(user.id, user.isAnonymous || false);
        setDailyStatus(status);
      } else {
        setDailyStatus(null);
      }
    };
    fetchDailyStatus();
  }, [user, isGuest]);

  const charCount = text.length;
  const isNearLimit = charCount > 450;
  const isAtLimit = charCount >= 500;

  const handleSend = async () => {
    if (!text.trim()) return;
    
    // Show sending animation
    setStep('sending');
    setTimeout(async () => {
      try {
        const result = onSend({ text, mood: selectedMood });
        if (result instanceof Promise) {
          await result;
        }
      } catch (error) {
        // If error occurs (including guest limit), reset to compose step so modal can show
        setStep('compose');
      }
    }, 2500);
  };

  if (step === 'sending') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center relative z-20">
        <div className="absolute inset-0 bg-blue-950/50 backdrop-blur-sm z-0 animate-fade-in" />
        <div className="z-10 flex flex-col items-center animate-fade-out-up">
           <div className="relative mb-8">
             <div className="w-32 h-32 rounded-full border-2 border-white/20 flex items-center justify-center animate-spin-slow relative overflow-hidden">
               <Anchor className="text-white/70 animate-pulse relative z-10" size={48} />
             </div>
             <Sparkles size={16} className="absolute -top-2 -right-2 text-white/50 animate-sparkle-1" />
             <Sparkles size={12} className="absolute top-1/2 -left-4 text-white/40 animate-sparkle-2" />
             <Sparkles size={14} className="absolute -bottom-2 right-8 text-white/45 animate-sparkle-3" />
           </div>
           <h3 className="text-3xl lg:text-4xl font-serif text-white mb-3">
             Drifting away...
           </h3>
           <p className="text-white/60 text-lg font-light italic">Your voice is now part of the tide.</p>
           <div className="mt-8 flex gap-2">
             <Waves size={20} className="text-white/40 animate-float" style={{ animationDelay: '0s' }} />
             <Waves size={20} className="text-white/35 animate-float" style={{ animationDelay: '0.3s' }} />
             <Waves size={20} className="text-white/40 animate-float" style={{ animationDelay: '0.6s' }} />
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col p-4 sm:p-6 lg:p-8 relative ${!isWeb ? 'pb-24 sm:pb-28' : ''}`}>
      {!isWeb && <Header onBack={() => onNavigate('home' as PageType)} title="Write a Message" />}
      
      {isWeb && (
        <div className="mb-4 sm:mb-6 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white/90 mb-2 bg-gradient-to-r from-cyan-100 via-white to-blue-100 bg-clip-text text-transparent">
            Cast a Bottle
          </h2>
          <p className="text-white/50 text-xs sm:text-sm lg:text-base font-light italic">Share your thoughts with the ocean</p>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-4 sm:gap-6 relative overflow-visible">
        <div className="relative flex-1 group">
          <TextParticles active={isFocused && text.length > 0} />
          
          <GlassCard className={`flex-1 flex flex-col p-1 bg-gradient-to-b from-white/10 to-white/5 relative overflow-hidden transition-all duration-500 ${isFocused ? 'ring-1 ring-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]' : ''}`}>
            {isFocused && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent animate-shimmer pointer-events-none" />
            )}
            
            {isFocused && text.length === 0 && (
              <div className="absolute top-4 right-4 opacity-20 animate-float pointer-events-none">
                <Droplets size={32} className="text-white/40" />
              </div>
            )}

            <textarea
              ref={textareaRef}
              className="w-full h-full bg-transparent p-4 sm:p-6 text-base sm:text-lg lg:text-xl text-white placeholder:text-white/30 resize-none focus:outline-none font-serif leading-relaxed relative z-10"
              placeholder="Share a secret, a wish, or a dream..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              maxLength={500}
              autoFocus
            />
            
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center border-t border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent relative z-10">
              <span className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-white/50 group-hover:text-white/60 transition-colors duration-300">
                <Wind size={12} className="sm:w-[14px] sm:h-[14px] text-white/40 group-hover:text-white/60 transition-colors duration-300" />
                <span>Anonymous</span>
              </span>
              <span 
                className={`text-xs font-mono font-bold transition-all duration-300 ${
                  isAtLimit 
                    ? 'text-rose-400 animate-pulse scale-110' 
                    : isNearLimit 
                      ? 'text-amber-300' 
                      : 'text-white/50'
                }`}
              >
                {charCount}/500
                {isNearLimit && !isAtLimit && (
                  <span className="ml-1 inline-block w-1 h-1 bg-amber-300 rounded-full animate-ping" />
                )}
              </span>
            </div>
          </GlassCard>
        </div>
        <div className="space-y-3 sm:space-y-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="sm:w-[14px] sm:h-[14px] text-white/40" />
            <label className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-widest">Emotion</label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {MOODS.map((m) => {
              const isSelected = selectedMood === m.id;
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMood(m.id)}
                  className={`relative h-20 sm:h-24 lg:h-28 rounded-xl sm:rounded-2xl transition-all duration-500 flex flex-col items-center justify-center gap-2 sm:gap-3 border group/mood overflow-hidden touch-target ${
                    isSelected 
                      ? `${m.border} bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.08)] scale-105 sm:scale-110 z-10` 
                      : 'border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/15 hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  )}
                  
                  <div className={`relative z-10 transform transition-all duration-500 ${isSelected ? 'scale-110 sm:scale-125 rotate-3 sm:rotate-6' : 'group-hover/mood:scale-105 sm:group-hover/mood:scale-110'}`}>
                    <Icon 
                      size={isWeb ? 28 : 20} 
                      className={`sm:w-6 sm:h-6 transition-all duration-300 ${isSelected ? m.text : 'text-white/40 group-hover/mood:text-white/70'}`}
                    />
                  </div>
                  
                  <span className={`text-[9px] sm:text-[10px] lg:text-xs font-medium tracking-wide relative z-10 transition-all duration-300 ${
                    isSelected ? 'text-white font-bold' : 'text-white/40 group-hover/mood:text-white/70'
                  }`}>
                    {m.label}
                  </span>

                  {isSelected && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white/60 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {isGuest && dailyStatus && (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            {dailyStatus.throwRemaining > 0 ? (
              <div className="text-[10px] sm:text-xs text-amber-300/80 font-medium text-center bg-amber-500/10 border border-amber-500/20 rounded-full py-2 px-4 max-w-xs mx-auto">
                📤 Guest Mode: {dailyStatus.throwRemaining} throw{dailyStatus.throwRemaining !== 1 ? 's' : ''} remaining today
              </div>
            ) : (
              <div className="text-[10px] sm:text-xs text-amber-100 font-semibold text-center bg-amber-500/20 border border-amber-400/40 rounded-2xl py-3 px-4 max-w-xs mx-auto">
                ⚠️ Guest throw limit reached — <button onClick={() => onNavigate('auth')} className="underline hover:text-white transition-colors">sign in</button> for more!
              </div>
            )}
          </div>
        )}

            <button 
              onClick={handleSend}
              disabled={!text.trim()}
              className={`group relative w-full py-4 sm:py-5 lg:py-6 rounded-xl sm:rounded-2xl font-serif text-base sm:text-lg lg:text-xl tracking-wide transition-all duration-500 overflow-hidden touch-target min-h-[56px] ${
                text.trim() 
                  ? 'bg-white/10 border border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:bg-white/15 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-95 translate-y-0' 
                  : 'bg-white/10 text-white/20 cursor-not-allowed translate-y-2 opacity-50'
              }`}
            >
          {text.trim() && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bottom-0 rounded-full bg-white/20 animate-rise"
                    style={{
                      left: `${20 + i * 15}%`,
                      width: `${4 + i * 2}px`,
                      height: `${4 + i * 2}px`,
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: '2s',
                    }}
                  />
                ))}
              </div>
            </>
          )}

          <span className="relative z-10 flex items-center justify-center gap-3">
            <Send 
              size={20} 
              className={`transition-transform duration-300 ${text.trim() ? 'group-hover:-translate-y-1 group-hover:translate-x-1' : ''}`} 
            />
            Throw into the Sea
          </span>
        </button>
      </div>
    </div>
  );
};
