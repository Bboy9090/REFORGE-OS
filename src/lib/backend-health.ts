/**
 * Backend Health - Monitor backend API health status
 */

import { useState, useEffect } from 'react';
import { getAPIUrl } from './apiConfig';

export interface BackendHealthStatus {
  isHealthy: boolean;
  lastCheck: number;
  error?: string;
}

export async function checkBackendHealth(): Promise<BackendHealthStatus> {
  try {
    // Use shorter timeout for faster failure detection during startup
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    try {
      const response = await fetch(getAPIUrl('/api/v1/ready'), {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        return {
          isHealthy: false,
          lastCheck: Date.now(),
          error: `HTTP ${response.status}`,
        };
      }
      
      const data = await response.json();
      // Handle envelope format
      const envelope = data.ok !== undefined ? data : { ok: true, data };
      
      return {
        isHealthy: envelope.ok === true,
        lastCheck: Date.now(),
        error: envelope.ok === false ? envelope.error?.message : undefined,
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    return {
      isHealthy: false,
      lastCheck: Date.now(),
      error: error instanceof Error && error.name === 'AbortError' 
        ? 'Connection timeout' 
        : error instanceof Error 
        ? error.message 
        : 'Backend unavailable',
    };
  }
}

export function useBackendHealth(checkInterval: number = 30000): BackendHealthStatus {
  const [health, setHealth] = useState<BackendHealthStatus>({
    isHealthy: false,
    lastCheck: 0,
  });

  useEffect(() => {
    let isMounted = true;
    let consecutiveFailures = 0;
    const MAX_SILENT_FAILURES = 3; // Only log errors after 3 consecutive failures

    const checkHealth = async () => {
      try {
        const response = await fetch(getAPIUrl('/api/v1/ready'), {
          signal: AbortSignal.timeout(5000),
        });
        
        if (!isMounted) return;
        
        if (!response.ok) {
          consecutiveFailures++;
          setHealth({
            isHealthy: false,
            lastCheck: Date.now(),
            error: consecutiveFailures > MAX_SILENT_FAILURES ? `HTTP ${response.status}` : undefined,
          });
          return;
        }
        
        const data = await response.json();
        // Handle envelope format
        const envelope = data.ok !== undefined ? data : { ok: true, data };
        
        if (envelope.ok === true) {
          consecutiveFailures = 0; // Reset on success
        }
        
        if (!isMounted) return;
        
        setHealth({
          isHealthy: envelope.ok === true,
          lastCheck: Date.now(),
          error: envelope.ok === false && consecutiveFailures > MAX_SILENT_FAILURES 
            ? envelope.error?.message 
            : undefined,
        });
      } catch (error) {
        if (!isMounted) return;
        
        consecutiveFailures++;
        setHealth({
          isHealthy: false,
          lastCheck: Date.now(),
          // Only show error after multiple failures to reduce noise
          error: consecutiveFailures > MAX_SILENT_FAILURES 
            ? (error instanceof Error ? error.message : 'Backend unavailable')
            : undefined,
        });
      }
    };

    // Check immediately
    checkHealth();

    // Set up interval - longer interval to reduce noise
    const interval = setInterval(checkHealth, Math.max(checkInterval, 30000));

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [checkInterval]);

  return health;
}
