/**
 * Offline Detection Hook
 * Detects when the application goes offline/online and manages graceful degradation
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface OfflineStatus {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnlineTime: Date | null;
  lastOfflineTime: Date | null;
}

/**
 * Hook to detect online/offline status
 */
export function useOfflineDetection() {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    wasOffline: false,
    lastOnlineTime: navigator.onLine ? new Date() : null,
    lastOfflineTime: navigator.onLine ? null : new Date(),
  });

  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({
        isOnline: true,
        wasOffline: !prev.isOnline,
        lastOnlineTime: new Date(),
        lastOfflineTime: prev.lastOfflineTime,
      }));
      toast.success('Connection restored', {
        description: 'You are back online',
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setStatus(prev => ({
        isOnline: false,
        wasOffline: false,
        lastOnlineTime: prev.lastOnlineTime,
        lastOfflineTime: new Date(),
      }));
      toast.warning('You are offline', {
        description: 'Some features may be unavailable',
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return status;
}

/**
 * Hook to check backend connectivity specifically
 */
export function useBackendConnectivity() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      // Use API_CONFIG for proper backend URL
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      const connected = response.ok;
      setIsConnected(connected);
      setLastCheck(new Date());
      return connected;
    } catch {
      setIsConnected(false);
      setLastCheck(new Date());
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Periodic health check
  useEffect(() => {
    if (navigator.onLine) {
      checkConnection();
      const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [checkConnection]);

  return {
    isConnected,
    isChecking,
    lastCheck,
    checkConnection,
  };
}
