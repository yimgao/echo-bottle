'use client';

import { Header } from '@/components/visual/Header';
import { GlassCard } from '@/components/visual/GlassCard';
import { MOODS } from '@/constants/moods';
import { Wind, Sparkles } from 'lucide-react';
import type { InboxPageProps, PageType } from '@/types';

export const InboxPage = ({ onNavigate, bottles, onOpenBottle, isLoading, isWeb = false }: InboxPageProps) => {
  return (
    <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8">
      {!isWeb && <Header onBack={() => onNavigate('home' as PageType)} title="My Collection" />}
      
      {isWeb && (
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-serif text-white/90 mb-2">My Collection</h2>
          <p className="text-white/50 text-xs sm:text-sm">Messages washed up on your shore</p>
        </div>
      )}
      
      <div className={`flex-1 overflow-y-auto ${!isWeb ? 'pb-24 sm:pb-28' : 'pb-4'} custom-scrollbar`}>
        <div className={isWeb ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4' : 'space-y-3 sm:space-y-4'}>
        {isLoading ? (
            <div className="text-center text-white/30 mt-10 animate-pulse">Searching the sands...</div>
        ) : bottles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/30">
            <Wind size={48} className="mb-4 opacity-50" />
            <p className="font-serif italic">The shore is empty today.</p>
          </div>
        ) : (
          bottles.map((bottle, idx) => {
            const mood = MOODS.find(m => m.id === bottle.type) || MOODS[3];
            const MoodIcon = mood.icon;
            
            const dateStr = bottle.createdAt && 'seconds' in bottle.createdAt && bottle.createdAt.seconds
                ? new Date(bottle.createdAt.seconds * 1000).toLocaleDateString()
                : 'Recently';
            return (
              <GlassCard 
                key={bottle.id}
                onClick={() => onOpenBottle(bottle)}
                delay={`${idx * 0.1}s`}
                className={`p-4 sm:p-5 cursor-pointer group hover:bg-white/15 active:scale-[0.98] border-l-4 touch-target ${bottle.unread ? 'border-l-cyan-400' : 'border-l-transparent'}`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${mood.color} p-0.5 shadow-lg shrink-0`}>
                    <div className="w-full h-full bg-slate-900/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                       <MoodIcon size={18} className={`sm:w-5 sm:h-5 ${mood.text}`} />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] sm:text-xs font-bold tracking-wider uppercase ${mood.text} opacity-80`}>
                            {mood.label}
                        </span>
                        {bottle.unread && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)] shrink-0" />}
                    </div>
                    <p className={`font-serif text-base sm:text-lg leading-snug text-white/90 line-clamp-2 mb-2 sm:mb-3 group-hover:text-white transition-colors`}>
                      &quot;{bottle.content}&quot;
                    </p>
                    <p className="text-[10px] sm:text-xs text-white/40 font-light flex items-center gap-1">
                        <Sparkles size={8} className="sm:w-[10px] sm:h-[10px]" /> Washed up {dateStr}
                    </p>
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
        </div>
      </div>
    </div>
  );
};
