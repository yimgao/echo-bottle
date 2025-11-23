'use client';

import { useEffect, useRef } from 'react';
import { Wind, Sparkles } from 'lucide-react';
import { Header } from '@/components/visual/Header';
import { MOODS } from '@/constants/moods';
import type { ChatPageProps } from '@/types';

export const ChatPage = ({ onBack, bottle, isWeb = false }: ChatPageProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const mood = MOODS.find(m => m.id === bottle.type) || MOODS[3];
  const MoodIcon = mood.icon;
  
  const dateStr = bottle.createdAt && 'seconds' in bottle.createdAt && bottle.createdAt.seconds
    ? new Date(bottle.createdAt.seconds * 1000).toLocaleDateString()
    : 'Unknown date';

  return (
    <div className={`h-full flex flex-col relative ${!isWeb ? 'pb-20 sm:pb-24' : ''}`}>
      <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${mood.color} opacity-10 blur-3xl pointer-events-none`} />
      {!isWeb && (
        <div className="p-4 z-10">
           <Header onBack={onBack} title="Message in a Bottle" />
        </div>
      )}
      {isWeb && (
        <div className="p-4 sm:p-6 lg:p-8 z-10">
          <button 
            onClick={onBack}
            className="text-white/60 hover:text-white transition-colors mb-4 flex items-center gap-2 touch-target text-sm sm:text-base"
          >
            ← Back
          </button>
          <h2 className="text-2xl sm:text-3xl font-serif text-white/90">Message in a Bottle</h2>
        </div>
      )}
      
      <div className={`flex-1 overflow-y-auto ${isWeb ? 'p-4 sm:p-6 lg:p-8' : 'p-4'} custom-scrollbar z-10`}>
        <div className="max-w-2xl mx-auto">
          {/* Mood Badge */}
          <div className="flex justify-center mb-6 animate-fade-in-up">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br ${mood.color} p-0.5 shadow-lg`}>
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/90 rounded-full backdrop-blur-sm">
                <MoodIcon size={16} className={mood.text} />
                <span className={`text-xs font-bold tracking-wider uppercase ${mood.text}`}>
                  {mood.label}
                </span>
              </div>
            </div>
          </div>

          {/* Main Message */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-center mb-4">
              <div className="inline-block p-3 rounded-full bg-white/5 border border-white/10 mb-3">
                <Wind size={24} className="text-white/40" />
              </div>
            </div>
            <p className="font-serif text-lg sm:text-xl leading-relaxed text-white/90 text-center italic mb-6">
              &quot;{bottle.content}&quot;
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-white/40">
              <Sparkles size={12} />
              <span>Cast into the ocean on {dateStr}</span>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-slate-800/30 backdrop-blur-md border border-white/10 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-cyan-500/10 shrink-0">
                <Wind size={18} className="text-cyan-400/60" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white/80 mb-1">A Message from a Stranger</h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  This bottle drifted across the digital ocean to reach you. Read it, reflect on it, but remember—like all messages in bottles, it cannot be answered. The sender has already cast it away, hoping someone would find meaning in their words.
                </p>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button 
              onClick={onBack}
              className="text-sm uppercase tracking-widest text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
            >
              Return to Shore
            </button>
          </div>

          <div ref={contentRef} />
        </div>
      </div>
    </div>
  );
};
