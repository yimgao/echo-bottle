'use client';

import { useRef } from 'react';
import type { BubblesProps } from '@/types';

interface Bubble {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: string;
  opacity: number;
}

export const Bubbles = ({ count = 15, isWeb = false }: BubblesProps) => {
  const bubbleCount = isWeb ? count * 2 : count;
  const bubbles = useRef<Bubble[]>([...Array(bubbleCount)].map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${10 + Math.random() * 10}s`,
    size: `${(isWeb ? 3 : 4) + Math.random() * (isWeb ? 12 : 8)}px`,
    opacity: Math.random() * 0.3 + 0.2,
  }))).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="absolute bottom-[-20px] rounded-full bg-white/20 backdrop-blur-sm animate-rise"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDelay: b.delay,
            animationDuration: b.duration,
            opacity: b.opacity,
            boxShadow: `0 0 ${parseInt(b.size) * 2}px rgba(34,211,238,0.3)`,
          }}
        />
      ))}
    </div>
  );
};
