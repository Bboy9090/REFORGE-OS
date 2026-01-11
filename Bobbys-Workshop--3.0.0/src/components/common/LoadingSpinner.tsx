/**
 * Loading Spinner Component
 * Reusable loading spinner with multiple sizes and variants
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
  text?: string;
  variant?: 'spinner' | 'dots' | 'pulse';
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'text-cyan-500', 
  className,
  text,
  variant = 'spinner'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-3',
    lg: 'w-8 h-8 border-4',
    xl: 'w-12 h-12 border-4',
  };

  const spinnerContent = variant === 'spinner' ? (
    <div
      className={cn(
        'inline-block rounded-full animate-spin border-t-transparent',
        sizeClasses[size],
        color,
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  ) : variant === 'dots' ? (
    <div className={cn('flex items-center gap-1', className)} role="status" aria-label="Loading">
      <div className={cn('w-2 h-2 rounded-full animate-bounce', color)} style={{ animationDelay: '0ms' }} />
      <div className={cn('w-2 h-2 rounded-full animate-bounce', color)} style={{ animationDelay: '150ms' }} />
      <div className={cn('w-2 h-2 rounded-full animate-bounce', color)} style={{ animationDelay: '300ms' }} />
      <span className="sr-only">Loading...</span>
    </div>
  ) : (
    <div className={cn('w-6 h-6 rounded-full animate-pulse bg-current', color, className)} role="status" aria-label="Loading">
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (text) {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        {spinnerContent}
        <p className="text-sm text-gray-400">{text}</p>
      </div>
    );
  }

  return spinnerContent;
}

/**
 * Progress Bar Component
 */
interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  className?: string;
  color?: string;
}

export function ProgressBar({ 
  progress, 
  label, 
  showPercentage = false, 
  className,
  color = 'bg-cyan-500'
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-400">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-400">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-800 rounded-full h-2 sm:h-3 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300 ease-out', color)}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label || 'Progress'}
        />
      </div>
    </div>
  );
}
