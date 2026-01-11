/**
 * ToolboxDangerLever
 * 
 * Hold-to-confirm lever for destructive operations.
 * Physical, deliberate interaction - no accidental clicks.
 */

import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolboxDangerLeverProps {
  onConfirm: () => void;
  disabled?: boolean;
  holdDuration?: number; // milliseconds
  label?: string;
  warning?: string;
}

export function ToolboxDangerLever({
  onConfirm,
  disabled = false,
  holdDuration = 2000,
  label = "HOLD TO CONFIRM",
  warning
}: ToolboxDangerLeverProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = () => {
    if (disabled || isHolding) return;
    
    setIsHolding(true);
    setProgress(0);
    
    // Progress animation
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / holdDuration) * 100, 100);
      setProgress(newProgress);
    }, 16); // ~60fps
    
    // Completion timer
    holdTimerRef.current = setTimeout(() => {
      setIsHolding(false);
      setProgress(0);
      onConfirm();
    }, holdDuration);
  };

  const cancelHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsHolding(false);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  return (
    <div className="space-y-3">
      {warning && (
        <div className="p-3 rounded-lg bg-state-danger/10 border border-state-danger/30">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-state-danger flex-shrink-0 mt-0.5" />
            <p className="text-xs text-ink-primary">{warning}</p>
          </div>
        </div>
      )}
      
      <button
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        disabled={disabled}
        className={cn(
          "relative w-full h-16 rounded-lg border-2 transition-all motion-snap",
          "bg-state-danger/10 border-state-danger",
          "hover:bg-state-danger/20 hover:glow-danger",
          "active:scale-[0.98]",
          disabled && "opacity-50 cursor-not-allowed",
          isHolding && "glow-danger"
        )}
      >
        {/* Progress ring */}
        {isHolding && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 44 44">
                <circle
                  cx="22"
                  cy="22"
                  r="20"
                  fill="none"
                  stroke="rgba(225, 29, 72, 0.2)"
                  strokeWidth="2"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="20"
                  fill="none"
                  stroke="#E11D48"
                  strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
                  className="transition-all duration-75"
                />
              </svg>
            </div>
          </div>
        )}
        
        {/* Label */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <span className={cn(
            "font-mono text-sm font-bold uppercase tracking-wider",
            isHolding ? "text-state-danger" : "text-state-danger/80"
          )}>
            {isHolding ? "HOLDING..." : label}
          </span>
        </div>
      </button>
      
      {isHolding && (
        <p className="text-xs text-center text-ink-muted font-mono">
          {Math.round(progress)}% — Keep holding
        </p>
      )}
    </div>
  );
}

