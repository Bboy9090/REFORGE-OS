/**
 * OrnamentBugsGreeting - "What's up, doc?" Startup Greeting
 * 
 * Bugs Bunny tone, never blocks UI.
 * Once per session (default), auto-fade after 3-5s.
 * Suppressed during flashing, unlocking, destructive ops, Secret Room rituals.
 */

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface OrnamentBugsGreetingProps {
  variant?: 'clean' | 'devices' | 'warning' | 'secret-room';
  onDismiss?: () => void;
  autoHide?: boolean;
  autoHideDuration?: number;
}

const GREETING_COPIES = {
  clean: "What's up, doc?",
  devices: "What's up, doc? You're wired in.",
  warning: "Ehhh… what's up, doc? Something's off.",
  'secret-room': "What's up, doc… tread carefully.",
};

export function OrnamentBugsGreeting({
  variant = 'clean',
  onDismiss,
  autoHide = true,
  autoHideDuration = 4000,
}: OrnamentBugsGreetingProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!autoHide) return;

    const timer = setTimeout(() => {
      setVisible(false);
      // Call onDismiss after fade animation completes
      const dismissTimer = setTimeout(() => {
        onDismiss?.();
      }, 300);
      
      // Cleanup dismiss timer if component unmounts
      return () => {
        clearTimeout(dismissTimer);
      };
    }, autoHideDuration);

    return () => {
      clearTimeout(timer);
    };
  }, [autoHide, autoHideDuration, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-md",
        "bg-workbench-steel/80 border border-spray-cyan/20",
        "text-ink-primary font-tag text-sm",
        "transition-opacity motion-snap",
        !visible && "opacity-0"
      )}
      style={{
        fontFamily: 'var(--font-tag)',
      }}
    >
      <span className="text-spray-cyan">🐰</span>
      <span>{GREETING_COPIES[variant]}</span>
    </div>
  );
}
