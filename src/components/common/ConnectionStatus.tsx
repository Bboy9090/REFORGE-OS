/**
 * Connection Status Indicator
 * Shows backend connection status
 */

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';

interface ConnectionStatusProps {
  className?: string;
  showLabel?: boolean;
  pollInterval?: number;
}

export function ConnectionStatus({ 
  className, 
  showLabel = true,
  pollInterval = 5000 
}: ConnectionStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const healthy = await apiClient.healthCheck();
      setIsConnected(healthy);
    } catch {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkConnection();

    // Poll periodically
    const interval = setInterval(checkConnection, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval]);

  if (isConnected === null && !isChecking) {
    return null; // Don't show until first check
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
        isConnected === true && "bg-green-500/20 text-green-400 border border-green-500/30",
        isConnected === false && "bg-red-500/20 text-red-400 border border-red-500/30",
        isConnected === null && "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
        className
      )}
      title={isConnected === true ? "Backend connected" : isConnected === false ? "Backend disconnected" : "Checking connection"}
    >
      {isChecking ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isConnected === true ? (
        <Wifi className="w-4 h-4" />
      ) : isConnected === false ? (
        <WifiOff className="w-4 h-4" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      )}
      
      {showLabel && (
        <span>
          {isChecking
            ? "Checking..."
            : isConnected === true
            ? "Connected"
            : isConnected === false
            ? "Disconnected"
            : "Unknown"}
        </span>
      )}
    </div>
  );
}
