/**
 * Backend Health Gate Component
 * Blocks UI until Python backend is healthy
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
      // In production, this would check the Python worker health endpoint
      // For now, check the FastAPI backend
      const response = await fetch("http://localhost:8001/health");
      
      if (response.ok) {
        setStatus("ready");
        setError(null);
      } else {
        setStatus("failed");
        setError("Backend API is not responding");
      }
    } catch (err: any) {
      setStatus("failed");
      setError(err.message || "Failed to connect to backend");
    }
  };

  if (status === "booting") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-dark">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <h2 className="text-xl font-semibold text-primary-light">
            Initializing REFORGE OS...
          </h2>
          <p className="text-text-secondary">
            Starting Python worker service
          </p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-dark">
        <div className="max-w-md w-full space-y-4">
          <ErrorAlert 
            message={error || "Backend service failed to start"} 
            onDismiss={() => setStatus("booting")}
          />
          <div className="text-center space-y-2">
            <p className="text-text-secondary">
              The Python worker service could not be started.
            </p>
            <button
              onClick={() => {
                setStatus("booting");
                checkBackendHealth();
              }}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Backend is ready - render children
  return <>{children}</>;
}
