'use client';

import { useRef, useEffect, useState } from 'react';
import type { FloatingBottlesProps } from '@/types';

interface BottlePosition {
  x: number;
  y: number;
}

interface BottleData {
  id: number;
  startX: number;
  startY: number;
  delay: number;
}

const Bottle = ({ startX, startY, delay }: { startX: number; startY: number; delay: number }) => {
  const [position, setPosition] = useState<BottlePosition>({ x: startX, y: startY });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animate = () => {
      setPosition(prev => ({
        x: prev.x + Math.sin(Date.now() / 2000 + delay) * 0.3,
        y: prev.y + Math.cos(Date.now() / 3000 + delay) * 0.2,
      }));
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, [delay]);

  return (
    <div
      ref={ref}
      className="absolute pointer-events-none opacity-20 hover:opacity-60 transition-opacity duration-1000 cursor-pointer group/bottle"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `rotate(${Math.sin(Date.now() / 1500 + delay) * 5}deg)`,
        animationDelay: `${delay}s`,
        filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.3))',
      }}
    >
      <svg width="40" height="60" viewBox="0 0 200 300" className="drop-shadow-lg">
        <path 
          d="M85,260 C50,260 40,230 45,180 C50,130 80,110 95,105 L105,105 C120,110 150,130 155,180 C160,230 150,260 115,260 Z" 
          fill="rgba(255,255,255,0.15)" 
          stroke="rgba(255,255,255,0.3)" 
          strokeWidth="2" 
        />
        <rect x="90" y="102" width="20" height="8" fill="#D4A373" rx="2" />
        <path 
          d="M70,180 Q100,200 130,170" 
          stroke="rgba(255,255,255,0.4)" 
          strokeWidth="3" 
          fill="none" 
          strokeLinecap="round" 
        />
        <rect x="85" y="160" width="30" height="35" fill="white" rx="2" opacity="0.4" />
      </svg>
    </div>
  );
};

export const FloatingBottles = ({ count = 8 }: FloatingBottlesProps) => {
  const bottles = useRef<BottleData[]>(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      startX: 10 + (i * 12) + Math.random() * 5,
      startY: 20 + Math.random() * 60,
      delay: i * 0.5,
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 hidden lg:block">
      {bottles.map((bottle) => (
        <Bottle
          key={bottle.id}
          startX={bottle.startX}
          startY={bottle.startY}
          delay={bottle.delay}
        />
      ))}
    </div>
  );
};
