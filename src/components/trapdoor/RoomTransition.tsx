/**
 * Room Transition Animation
 * Smooth UI transitions when entering secret rooms
 */

import React, { useEffect, useState } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomTransitionProps {
  roomName: string;
  onComplete: () => void;
  theme?: 'sonic' | 'ghost' | 'pandora' | 'default';
}

const THEME_COLORS = {
  sonic: {
    primary: '#22d3ee', // cyan
    secondary: '#0891b2',
    glow: 'glow-cyan',
  },
  ghost: {
    primary: '#8b5cf6', // purple
    secondary: '#6d28d9',
    glow: 'glow-purple',
  },
  pandora: {
    primary: '#f59e0b', // amber
    secondary: '#d97706',
    glow: 'glow-amber',
  },
  default: {
    primary: '#a855f7', // magenta
    secondary: '#9333ea',
    glow: 'glow-magenta',
  },
};

export function RoomTransition({ roomName, onComplete, theme = 'default' }: RoomTransitionProps) {
  const [stage, setStage] = useState<'locking' | 'handshake' | 'unlocking' | 'complete'>('locking');
  const colors = THEME_COLORS[theme];

  useEffect(() => {
    // Stage 1: Locking (0.5s)
    const timer1 = setTimeout(() => setStage('handshake'), 500);
    
    // Stage 2: Handshake (1.5s)
    const timer2 = setTimeout(() => setStage('unlocking'), 2000);
    
    // Stage 3: Unlocking (0.5s)
    const timer3 = setTimeout(() => setStage('complete'), 2500);
    
    // Complete (call callback)
    const timer4 = setTimeout(() => onComplete(), 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Lock/Unlock Icon */}
        <div className="mb-8 relative">
          <div
            className={cn(
              "w-24 h-24 mx-auto rounded-full border-4 flex items-center justify-center transition-all duration-500",
              stage === 'locking' && "border-gray-700 bg-gray-900",
              stage === 'handshake' && `border-${colors.primary} bg-${colors.primary}/20 ${colors.glow}`,
              stage === 'unlocking' && `border-${colors.primary} bg-${colors.primary}/20 ${colors.glow}`,
              stage === 'complete' && "opacity-0 scale-150"
            )}
          >
            {stage === 'locking' || stage === 'unlocking' ? (
              <Lock
                className={cn(
                  "w-12 h-12 transition-all duration-500",
                  stage === 'locking' && "text-gray-500",
                  stage === 'unlocking' && `text-${colors.primary} rotate-180`
                )}
              />
            ) : (
              <Sparkles
                className={cn(
                  "w-12 h-12 animate-pulse",
                  `text-${colors.primary}`
                )}
              />
            )}
          </div>

          {/* Ripple Effect */}
          {stage === 'handshake' && (
            <div className="absolute inset-0 flex items-center justify-center">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute rounded-full border-2 animate-ping",
                    `border-${colors.primary}`,
                    `w-${24 + i * 8} h-${24 + i * 8}`
                  )}
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1s',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Room Name */}
        <h2
          className={cn(
            "text-3xl font-bold mb-4 transition-all duration-500",
            stage === 'complete' ? 'opacity-0' : 'opacity-100',
            `text-${colors.primary}`
          )}
        >
          {roomName}
        </h2>

        {/* Status Text */}
        <p className="text-gray-400 text-sm">
          {stage === 'locking' && 'Securing connection...'}
          {stage === 'handshake' && 'Establishing secure handshake...'}
          {stage === 'unlocking' && 'Access granted...'}
          {stage === 'complete' && 'Entering room...'}
        </p>

        {/* Progress Bar */}
        <div className="mt-8 w-64 mx-auto h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              `bg-${colors.primary}`
            )}
            style={{
              width: stage === 'locking' ? '25%' : stage === 'handshake' ? '75%' : '100%',
            }}
          />
        </div>
      </div>
    </div>
  );
}
