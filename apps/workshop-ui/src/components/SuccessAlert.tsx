/**
 * Success Alert Component
 * Displays success messages with professional styling
 */

import React from "react";

interface SuccessAlertProps {
  message: string;
  title?: string;
  onDismiss?: () => void;
}

export default function SuccessAlert({ 
  message, 
  title,
  onDismiss 
}: SuccessAlertProps) {
  return (
    <div 
      className="rounded-lg p-4 flex items-start gap-3 fade-in"
      style={{
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        border: '1px solid rgba(76, 175, 80, 0.3)'
      }}
    >
      <span className="text-lg flex-shrink-0">✅</span>
      
      <div className="flex-1 min-w-0">
        {title && (
          <h4 
            className="font-semibold mb-1"
            style={{ color: 'var(--state-success)' }}
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
