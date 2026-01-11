/**
 * React Hook for API Calls
 * Provides loading, error, and data states for API requests
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/apiClient';
import type { APIError } from '@/lib/apiClient';

export interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: APIError) => void;
  skipAuth?: boolean;
  timeout?: number;
  retries?: number;
}

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: APIError | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T = any>(
  endpoint: string | null,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  options: UseApiOptions = {}
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(options.immediate ?? false);
  const [error, setError] = useState<APIError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (payload?: any): Promise<T | null> => {
      if (!endpoint) {
        setError({ message: 'No endpoint provided' });
        return null;
      }

      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        let result: T;

        switch (method) {
          case 'GET':
            result = await api.get<T>(endpoint, { ...options, signal: controller.signal });
            break;
          case 'POST':
            result = await api.post<T>(endpoint, payload, { ...options, signal: controller.signal });
            break;
          case 'PUT':
            result = await api.put<T>(endpoint, payload, { ...options, signal: controller.signal });
            break;
          case 'DELETE':
            result = await api.delete<T>(endpoint, { ...options, signal: controller.signal });
            break;
          case 'PATCH':
            result = await api.patch<T>(endpoint, payload, { ...options, signal: controller.signal });
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        // Check if request was aborted
        if (controller.signal.aborted) {
          return null;
        }

        setData(result);
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        return result;
      } catch (err) {
        // Ignore abort errors
        if (controller.signal.aborted) {
          return null;
        }

        const apiError: APIError = err instanceof Error
          ? { message: err.message, details: err }
          : { message: String(err) };

        setError(apiError);
        if (options.onError) {
          options.onError(apiError);
        }
        return null;
      } finally {
        // Only set loading to false if this request wasn't aborted
        if (!controller.signal.aborted) {
          setLoading(false);
        }
        abortControllerRef.current = null;
      }
    },
    [endpoint, method, options]
  );

  const reset = useCallback(() => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (options.immediate && endpoint) {
      execute();
    }

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Only run on mount

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

/**
 * Hook for polling API endpoint
 */
export function useApiPoll<T = any>(
  endpoint: string | null,
  interval: number = 5000,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const result = useApi<T>(endpoint, 'GET', { ...options, immediate: true });
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (endpoint && interval > 0) {
      // Initial fetch
      result.execute();

      // Set up polling
      intervalRef.current = window.setInterval(() => {
        result.execute();
      }, interval);

      return () => {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [endpoint, interval]);

  return result;
}
