'use client';

import { useEffect, useRef } from 'react';
import type { LightRaysProps } from '@/types';

export const LightRays = ({}: LightRaysProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const raysRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rayCount = 8;

    for (let i = 0; i < rayCount; i++) {
      const ray = document.createElement('div');
      ray.className = 'absolute bottom-0 w-px bg-gradient-to-t from-cyan-400/20 via-cyan-300/10 to-transparent';
      ray.style.left = `${(i / rayCount) * 100}%`;
      ray.style.height = `${30 + Math.random() * 40}%`;
      ray.style.animationDelay = `${i * 0.3}s`;
      ray.style.animation = 'rayPulse 5s ease-in-out infinite';
      ray.style.transformOrigin = 'bottom center';
      ray.style.width = '2px';
      ray.style.filter = 'blur(1px)';
      container.appendChild(ray);
      raysRef.current.push(ray);
    }

    return () => {
      raysRef.current.forEach(ray => {
        if (ray && ray.parentNode) {
          ray.parentNode.removeChild(ray);
        }
      });
      raysRef.current = [];
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 hidden lg:block"
    />
  );
};
