/**
 * LoadingPage - "The System Is Waking Up"
 * 
 * Concept A: Wires & Pulse
 * Vibe: The apartment is alive before the UI is.
 */

import React from 'react';
import { cn } from '@/lib/utils';

export function LoadingPage() {
  return (
    <div className="fixed inset-0 bg-midnight-room flex items-center justify-center overflow-hidden">
      {/* Exposed Wires */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 1200 800">
        {/* Wire 1 - Horizontal */}
        <path
          d="M 0 200 Q 300 180, 600 200 T 1200 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-spray-cyan"
        />
        
        {/* Wire 2 - Diagonal */}
        <path
          d="M 200 0 Q 400 200, 600 400 T 1000 800"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-spray-magenta"
        />
        
        {/* Wire 3 - Pulse Wire (animated) */}
        <path
          d="M 0 400 Q 400 380, 800 400 T 1200 400"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-tape-yellow animate-pulse"
          strokeDasharray="10 5"
        />
      </svg>
      
      {/* CRT Scanlines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }} />
      </div>
      
      {/* Pulsing Dot (Heartbeat) */}
      <div className="relative z-10">
        <div className="w-3 h-3 rounded-full bg-spray-cyan animate-pulse glow-cyan" />
      </div>
      
      {/* Boot Text */}
      <div className="absolute bottom-8 left-8 font-mono text-xs text-ink-muted">
        <span className="animate-pulse">BOOTING WORKSHOP</span>
        <span className="inline-block w-2 h-4 ml-1 bg-spray-cyan animate-pulse" />
      </div>
    </div>
  );
}

