import React from "react";

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export default function ErrorAlert({ 
  message, 
  onDismiss,
  className = "" 
}: ErrorAlertProps) {
  return (
    <div className={`alert alert-error ${className}`} role="alert">
      <div className="flex-1">
        <strong className="font-semibold">Error:</strong>
        <span className="ml-2">{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-current opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}
