'use client';

import { ArrowLeft } from 'lucide-react';
import type { HeaderProps } from '@/types';

export const Header = ({ onBack, title, rightElement }: HeaderProps) => (
  <div className="flex items-center justify-between p-4 sm:p-6 z-10 relative animate-fade-in">
    <div className="flex items-center gap-3 sm:gap-4">
      {onBack && (
        <button 
          onClick={onBack} 
          className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10 group touch-target active:scale-95"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-white group-hover:-translate-x-1 transition-transform" />
        </button>
      )}
      <h1 className={`text-xl sm:text-2xl font-serif tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 to-blue-200 drop-shadow-sm`}>
        {title || 'EchoBottle'}
      </h1>
    </div>
    {rightElement}
  </div>
);
