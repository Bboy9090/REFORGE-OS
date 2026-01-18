/**
 * Backend Health Gate Component
 * Blocks UI until Python backend is healthy
 * Uses REFORGE OS Professional Theme
 */

import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import ErrorAlert from "./ErrorAlert";

interface BackendHealthGateProps {
  children: React.ReactNode;
}

export default function BackendHealthGate({ children }: BackendHealthGateProps) {
  const [status, setStatus] = useState<"booting" | "ready" | "failed">("booting");
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    checkBackendHealth();
    
    // Poll health every 2 seconds until ready
    const interval = setInterval(() => {
      if (status === "booting") {
        checkBackendHealth();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [status]);

  const checkBackendHealth = async () => {
    try {
      // Check if backend is available
      const response = await fetch("http://localhost:8001/health");
      
      if (response.ok) {
        setStatus("ready");
        setError(null);
      } else {
        setStatus("failed");
        setError("Backend API is not responding");
      }
    } catch (err: any) {
      setRetryCount(prev => prev + 1);
      if (retryCount >= 5) {
        setStatus("failed");
        setError(err.message || "Failed to connect to backend");
      }
    }
  };

  if (status === "booting") {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: 'var(--surface-primary)' }}
      >
        <div className="text-center space-y-6">
          {/* Animated Logo */}
          <div 
            className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl font-bold animate-pulse"
            style={{ 
              background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-bronze) 100%)',
              color: 'var(--ink-inverse)',
              boxShadow: 'var(--glow-gold-strong)'
            }}
          >
            R
          </div>
          
          <div>
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--accent-gold)' }}
            >
              Initializing REFORGE OS
            </h2>
            <p style={{ color: 'var(--ink-muted)' }}>
              Connecting to backend services...
            </p>
          </div>
          
          <LoadingSpinner size="lg" />
          
          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((dot) => (
              <div
                key={dot}
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: retryCount >= dot ? 'var(--accent-gold)' : 'var(--surface-tertiary)',
                  transition: 'background-color 300ms ease'
                }}
              />
            ))}
          </div>
          
          <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
            Attempt {retryCount + 1} of 6
          </p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: 'var(--surface-primary)' }}
      >
        <div className="max-w-md w-full px-6 space-y-6">
          {/* Error Logo */}
          <div 
            className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl"
            style={{ 
              backgroundColor: 'var(--surface-secondary)',
              border: '2px solid var(--state-error)',
              color: 'var(--state-error)'
            }}
          >
            ⚠️
          </div>
          
          <div className="text-center">
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--ink-primary)' }}
            >
              Connection Failed
            </h2>
            <p style={{ color: 'var(--ink-muted)' }}>
              Unable to connect to the backend services
            </p>
          </div>
          
          <ErrorAlert 
            message={error || "Backend service failed to start"} 
            onDismiss={() => {}}
          />
          
          <div 
            className="rounded-lg p-4 space-y-3"
            style={{ 
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--ink-secondary)' }}>
              Troubleshooting:
            </p>
            <ul className="text-sm space-y-2" style={{ color: 'var(--ink-muted)' }}>
              <li>• Ensure the backend server is running on port 8001</li>
              <li>• Check your network connection</li>
              <li>• Verify firewall settings allow local connections</li>
            </ul>
          </div>
          
          <button
            onClick={() => {
              setRetryCount(0);
              setStatus("booting");
              checkBackendHealth();
            }}
            className="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-gold-dark) 100%)',
              color: 'var(--ink-inverse)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Backend is ready - render children
  return <>{children}</>;
}
