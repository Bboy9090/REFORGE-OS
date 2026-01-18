/**
 * Error Alert Component
 * Displays error messages with professional styling
 */

import React from "react";

interface ErrorAlertProps {
  message: string;
  title?: string;
  onDismiss?: () => void;
  variant?: "error" | "warning" | "info";
}

export default function ErrorAlert({ 
  message, 
  title,
  onDismiss,
  variant = "error"
}: ErrorAlertProps) {
  const variants = {
    error: {
      bg: 'rgba(244, 67, 54, 0.1)',
      border: 'rgba(244, 67, 54, 0.3)',
      icon: '❌',
      iconColor: 'var(--state-error)',
      titleColor: 'var(--state-error)'
    },
    warning: {
      bg: 'rgba(255, 152, 0, 0.1)',
      border: 'rgba(255, 152, 0, 0.3)',
      icon: '⚠️',
      iconColor: 'var(--state-warning)',
      titleColor: 'var(--state-warning)'
    },
    info: {
      bg: 'rgba(33, 150, 243, 0.1)',
      border: 'rgba(33, 150, 243, 0.3)',
      icon: 'ℹ️',
      iconColor: 'var(--state-info)',
      titleColor: 'var(--state-info)'
    }
  };

  const style = variants[variant];

  return (
    <div 
      className="rounded-lg p-4 flex items-start gap-3 fade-in"
      style={{
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`
      }}
    >
      <span className="text-lg flex-shrink-0">{style.icon}</span>
      
      <div className="flex-1 min-w-0">
        {title && (
          <h4 
            className="font-semibold mb-1"
            style={{ color: style.titleColor }}
          >
            {title}
          </h4>
        )}
        <p 
          className="text-sm break-words"
          style={{ color: 'var(--ink-secondary)' }}
        >
          {message}
        </p>
      </div>
      
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded transition-colors duration-200"
          style={{ color: 'var(--ink-muted)' }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}
