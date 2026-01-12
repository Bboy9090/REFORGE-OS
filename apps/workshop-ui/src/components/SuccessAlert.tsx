import React from "react";

interface SuccessAlertProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export default function SuccessAlert({ 
  message, 
  onDismiss,
  className = "" 
}: SuccessAlertProps) {
  return (
    <div className={`alert alert-success ${className}`} role="alert">
      <div className="flex-1">
        <strong className="font-semibold">Success:</strong>
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
