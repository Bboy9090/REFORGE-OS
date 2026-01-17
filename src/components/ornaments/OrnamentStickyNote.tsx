/**
 * OrnamentStickyNote
 * 
 * Sticky note for tips, warnings, annotations.
 * Tape yellow background, handwritten font.
 */

import React from 'react';
import { AlertTriangle, Info, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrnamentStickyNoteProps {
  text: string;
  variant?: 'tip' | 'warning' | 'info';
  position?: 'static' | 'absolute';
  className?: string;
}

export function OrnamentStickyNote({
  text,
  variant = 'tip',
  className,
  position = 'static',
}: OrnamentStickyNoteProps) {
  const variantClasses = {
    tip: 'bg-tape-yellow border-tape-yellow/50 text-ink-tape-text',
    warning: 'bg-tape-yellow/80 border-state-warning/50 text-ink-tape-text',
    info: 'bg-tape-yellow/60 border-spray-cyan/30 text-ink-tape-text',
  };

  const icons = {
    tip: <Lightbulb className="w-3 h-3" />,
    warning: <AlertTriangle className="w-3 h-3" />,
    info: <Info className="w-3 h-3" />,
  };

  return (
    <div
      className={cn(
        "p-3 rounded-sm border-2 shadow-workbench-heavy",
        "font-tag text-xs leading-relaxed",
        "rotate-[-2deg]",
        variantClasses[variant],
        position === 'absolute' && "absolute",
        className
      )}
      style={{
        fontFamily: 'var(--font-tag)',
      }}
    >
      <div className="flex items-start gap-1.5 mb-1">
        {icons[variant]}
        <span className="font-bold uppercase text-[10px] tracking-wider">
          {variant}
        </span>
      </div>
      <p>{text}</p>
    </div>
  );
}
