/**
 * Offline Indicator Component
 * Shows when the application is offline or backend is unavailable
 */

import React from 'react';
import { WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOfflineDetection, useBackendConnectivity } from '@/hooks/useOfflineDetection';
import { LoadingSpinner } from './LoadingSpinner';

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOfflineDetection();
  const { isConnected, isChecking, checkConnection } = useBackendConnectivity();

  // Don't show if everything is online and connected
  if (isOnline && isConnected && !wasOffline) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 p-3 sm:p-4 rounded-lg border shadow-lg transition-all",
        "bg-gray-900 border-gray-700 text-white",
        isOnline && isConnected && wasOffline && "bg-green-500/20 border-green-500/50",
        !isOnline && "bg-red-500/20 border-red-500/50",
        !isConnected && isOnline && "bg-amber-500/20 border-amber-500/50"
      )}
    >
      <div className="flex items-center gap-3">
        {isChecking ? (
          <>
            <LoadingSpinner size="sm" />
            <span className="text-sm">Checking connection...</span>
          </>
        ) : !isOnline ? (
          <>
            <WifiOff className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-sm font-semibold text-red-400">Offline</p>
              <p className="text-xs text-gray-400">No internet connection</p>
            </div>
          </>
        ) : !isConnected ? (
          <>
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-400">Backend Unavailable</p>
              <p className="text-xs text-gray-400">Some features may be limited</p>
            </div>
            <button
              onClick={checkConnection}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors touch-target-min"
              title="Retry connection"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </>
        ) : wasOffline ? (
          <>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <div>
              <p className="text-sm font-semibold text-green-400">Back Online</p>
              <p className="text-xs text-gray-400">Connection restored</p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
