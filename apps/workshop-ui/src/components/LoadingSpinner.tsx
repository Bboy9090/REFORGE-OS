/**
 * Loading Spinner Component
 * Professional theme-integrated loading indicator
 */

import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  className?: string;
  variant?: "gold" | "bronze" | "steel" | "default";
}

export default function LoadingSpinner({ 
  size = "md", 
  text,
  className = "",
  variant = "gold"
}: LoadingSpinnerProps) {
  const sizeConfig = {
    sm: { spinner: "w-4 h-4", border: "2px", text: "text-xs" },
    md: { spinner: "w-6 h-6", border: "2px", text: "text-sm" },
    lg: { spinner: "w-10 h-10", border: "3px", text: "text-base" },
    xl: { spinner: "w-16 h-16", border: "4px", text: "text-lg" }
  };

  const variantColors = {
    gold: 'var(--accent-gold)',
    bronze: 'var(--accent-bronze)',
    steel: 'var(--accent-steel)',
    default: 'var(--ink-muted)'
  };

  const { spinner, border, text: textSize } = sizeConfig[size];
  const accentColor = variantColors[variant];

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div 
        className={`${spinner} rounded-full animate-spin`}
        style={{
          borderWidth: border,
          borderStyle: 'solid',
          borderColor: 'var(--surface-tertiary)',
          borderTopColor: accentColor,
        }}
      />
      {text && (
        <p className={textSize} style={{ color: 'var(--ink-muted)' }}>
          {text}
        </p>
      )}
    </div>
  );
}
