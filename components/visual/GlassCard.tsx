'use client';

import type { GlassCardProps } from '@/types';

export const GlassCard = ({ children, className = "", onClick, delay = "0s" }: GlassCardProps) => (
  <div 
    onClick={onClick}
    className={`bg-white/10 backdrop-blur-md border border-white/20 shadow-xl text-white rounded-3xl overflow-hidden transition-all duration-500 animate-fade-in-up ${className}`}
    style={{ animationDelay: delay }}
  >
    {children}
  </div>
);
