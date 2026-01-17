/**
 * OrnamentCableRun
 * 
 * Exposed wire/cable as subtle divider or connector.
 * SVG paths with stroke animations.
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface OrnamentCableRunProps {
  variant?: 'horizontal' | 'vertical' | 'diagonal' | 'curved';
  color?: 'cyan' | 'magenta' | 'yellow' | 'steel';
  animated?: boolean;
  className?: string;
}

export function OrnamentCableRun({
  variant = 'curved',
  color = 'cyan',
  animated = false,
  className,
}: OrnamentCableRunProps) {
  const colorValue = {
    cyan: '#2DD4FF',
    magenta: '#FF3DBB',
    yellow: '#FFD400',
    steel: '#8B949E',
  }[color];

  const getPath = () => {
    switch (variant) {
      case 'horizontal':
        return 'M 0 0 L 100 0';
      case 'vertical':
        return 'M 0 0 L 0 100';
      case 'diagonal':
        return 'M 0 0 L 100 100';
      case 'curved':
        return 'M 0 50 Q 50 20, 100 50 T 200 50';
      default:
        return 'M 0 50 Q 50 20, 100 50 T 200 50';
    }
  };

  return (
    <svg
      className={cn(
        "w-full h-full opacity-20",
        animated && "animate-pulse",
        className
      )}
      viewBox="0 0 200 100"
      preserveAspectRatio="none"
    >
      <path
        d={getPath()}
        fill="none"
        stroke={colorValue}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={animated ? "5 5" : "none"}
      />
    </svg>
  );
}
