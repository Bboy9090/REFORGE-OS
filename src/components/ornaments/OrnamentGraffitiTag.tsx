/**
 * OrnamentGraffitiTag
 * 
 * Graffiti-style tag for corner accents or section labels.
 * Handwritten/sharpie aesthetic.
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface OrnamentGraffitiTagProps {
  text: string;
  color?: 'cyan' | 'magenta' | 'yellow';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

export function OrnamentGraffitiTag({
  text,
  color = 'cyan',
  position = 'top-right',
  className,
}: OrnamentGraffitiTagProps) {
  const colorClasses = {
    cyan: 'text-spray-cyan border-spray-cyan/30',
    magenta: 'text-spray-magenta border-spray-magenta/30',
    yellow: 'text-tape-yellow border-tape-yellow/30',
  };

  const positionClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
  };

  return (
    <div
      className={cn(
        "absolute pointer-events-none z-0",
        positionClasses[position],
        className
      )}
    >
      <div
        className={cn(
          "px-2 py-1 rounded border font-tag text-xs opacity-30 rotate-[-5deg]",
          "bg-workbench-steel/50",
          colorClasses[color]
        )}
        style={{
          fontFamily: 'var(--font-tag)',
          textShadow: '0 0 4px currentColor',
        }}
      >
        {text}
      </div>
    </div>
  );
}
