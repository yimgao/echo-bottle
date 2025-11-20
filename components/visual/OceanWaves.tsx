'use client';

import type { OceanWavesProps } from '@/types';

export const OceanWaves = ({}: OceanWavesProps) => (
  <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden hidden lg:block pointer-events-none z-0">
    <svg 
      className="absolute bottom-0 w-full h-full" 
      viewBox="0 0 1200 120" 
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(34,211,238,0.1)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0.15)" />
        </linearGradient>
      </defs>
      <path
        d="M0,60 Q300,40 600,60 T1200,60 L1200,120 L0,120 Z"
        fill="url(#waveGradient)"
        className="animate-wave"
      >
        <animate
          attributeName="d"
          dur="8s"
          repeatCount="indefinite"
          values="M0,60 Q300,40 600,60 T1200,60 L1200,120 L0,120 Z;
                  M0,65 Q300,50 600,65 T1200,65 L1200,120 L0,120 Z;
                  M0,60 Q300,45 600,60 T1200,60 L1200,120 L0,120 Z;
                  M0,60 Q300,40 600,60 T1200,60 L1200,120 L0,120 Z"
        />
      </path>
      <path
        d="M0,70 Q400,55 800,70 T1200,70 L1200,120 L0,120 Z"
        fill="rgba(34,211,238,0.08)"
        className="animate-wave-slow"
      >
        <animate
          attributeName="d"
          dur="12s"
          repeatCount="indefinite"
          values="M0,70 Q400,55 800,70 T1200,70 L1200,120 L0,120 Z;
                  M0,75 Q400,60 800,75 T1200,75 L1200,120 L0,120 Z;
                  M0,70 Q400,58 800,70 T1200,70 L1200,120 L0,120 Z;
                  M0,70 Q400,55 800,70 T1200,70 L1200,120 L0,120 Z"
        />
      </path>
    </svg>
  </div>
);
