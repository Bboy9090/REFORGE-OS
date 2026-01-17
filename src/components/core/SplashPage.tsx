/**
 * SplashPage - "Welcome to the Apartment"
 * 
 * Concept A: The Wall
 * Vibe: The logo lives here. It's not printed—it's mounted.
 */

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SplashPageProps {
  onComplete: () => void;
  duration?: number; // milliseconds
}

export function SplashPage({ onComplete, duration = 1500 }: SplashPageProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 300); // Fade duration
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <div className={cn(
      "fixed inset-0 bg-midnight-room flex items-center justify-center transition-opacity motion-slide",
      fadeOut && "opacity-0"
    )}>
      {/* Brick Wall Texture (subtle) */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.02) 50px, rgba(255,255,255,0.02) 52px),
          repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.02) 30px, rgba(255,255,255,0.02) 32px)
        `,
      }} />
      
      {/* Logo Container - Mounted on Wall */}
      <div className="relative z-10 text-center">
        {/* Tape (top corners) */}
        <div className="absolute -top-4 -left-4 w-8 h-8 border-2 border-tape-yellow/30 rotate-45" />
        <div className="absolute -top-4 -right-4 w-8 h-8 border-2 border-tape-yellow/30 rotate-45" />
        
        {/* Wires (connecting to logo) */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 200">
          <path
            d="M 50 0 L 50 80 M 350 0 L 350 80"
            stroke="currentColor"
            strokeWidth="2"
            className="text-spray-cyan"
          />
        </svg>
        
        {/* Logo Text */}
        <div className="relative">
          <h1 className="text-6xl font-bold text-ink-primary mb-2" style={{
            textShadow: '0 0 20px rgba(45, 212, 255, 0.3)',
            fontFamily: 'var(--font-mono)',
          }}>
            BOBBY'S
          </h1>
          <h2 className="text-4xl font-bold text-spray-cyan mb-4" style={{
            textShadow: '0 0 15px rgba(45, 212, 255, 0.5)',
            fontFamily: 'var(--font-mono)',
          }}>
            WORKSHOP
          </h2>
          
          {/* Subtitle - Small, Sharpie-like */}
          <p className="text-xs text-ink-muted font-tag mt-4">
            & His World of Secrets and Traps
          </p>
        </div>
        
        {/* Paint Outline (stenciled effect) */}
        <div className="absolute inset-0 -z-10 blur-sm opacity-20">
          <h1 className="text-6xl font-bold text-spray-cyan" style={{ fontFamily: 'var(--font-mono)' }}>
            BOBBY'S
          </h1>
        </div>
      </div>
      
      {/* Small Crack (texture detail) */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-px h-16 bg-ink-muted/20" />
    </div>
  );
}

