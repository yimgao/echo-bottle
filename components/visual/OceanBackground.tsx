'use client';

import { Bubbles } from './Bubbles';
import { FloatingBottles } from './FloatingBottles';
import { OceanWaves } from './OceanWaves';
import { ParticleField } from './ParticleField';
import { LightRays } from './LightRays';
import type { OceanBackgroundProps } from '@/types';

export const OceanBackground = ({ isWeb = false }: OceanBackgroundProps) => (
  <div className="absolute inset-0 overflow-hidden -z-10 bg-[#050a14] text-white">
    <div className="absolute inset-0 bg-gradient-to-b from-[#0f1c30] via-[#050a14] to-[#02040a]"></div>
    
    <div className="absolute inset-0 opacity-30 mix-blend-overlay">
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(34,211,238,0.1)_30deg,transparent_60deg)] animate-slow-spin" />
    </div>
    
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/30 via-blue-950/20 to-indigo-950/30 animate-gradient-shift"></div>
    
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
    
    <div className="absolute top-0 left-1/4 w-32 h-[120%] bg-gradient-to-b from-cyan-300/10 to-transparent -rotate-12 blur-3xl transform origin-top animate-light-beam-1" />
    <div className="absolute top-0 right-1/3 w-40 h-[120%] bg-gradient-to-b from-blue-400/10 to-transparent rotate-12 blur-3xl transform origin-top animate-light-beam-2" />
    {isWeb && (
      <>
        <div className="absolute top-0 left-1/2 w-48 h-[120%] bg-gradient-to-b from-indigo-400/8 to-transparent rotate-6 blur-3xl transform origin-top animate-light-beam-3" />
        <div className="absolute top-0 right-1/4 w-36 h-[120%] bg-gradient-to-b from-purple-400/8 to-transparent -rotate-6 blur-3xl transform origin-top animate-light-beam-4" />
        <div className="absolute top-0 left-[15%] w-28 h-[110%] bg-gradient-to-b from-teal-400/6 to-transparent -rotate-3 blur-3xl transform origin-top animate-light-beam-5" />
      </>
    )}
    
    {isWeb && <ParticleField />}
    
    {isWeb && <LightRays />}
    
    <Bubbles count={15} isWeb={isWeb} />
    
    {isWeb && <FloatingBottles count={12} />}
    
    {isWeb && <OceanWaves />}
    
    {isWeb && (
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-[radial-gradient(circle_at_30%_50%,rgba(34,211,238,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.12),transparent_50%)] animate-caustic"></div>
    )}
    
    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
  </div>
);
