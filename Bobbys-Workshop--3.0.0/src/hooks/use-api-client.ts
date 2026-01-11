/**
 * Unified API Client Hook
 * 
 * Provides a consistent way to make API calls with automatic envelope parsing,
 * error handling, and correlation ID tracking.
 */

import { useCallback, useMemo } from 'react';
import { fetchEnvelope, ApiResponse, ApiError } from '../lib/api-envelope';
import { getAPIUrl } from '../lib/apiConfig';
import { toast } from 'sonner';

export interface UseApiClientOptions {
  /**
   * Show toast notifications on errors (default: true)
   */
  showErrors?: boolean;
  
  /**
   * Show toast notifications on success (default: false)
   */
  showSuccess?: boolean;
  
  /**
   * Custom correlation ID (auto-generated if not provided)
   */
  correlationId?: string;
}

export interface ApiClientResult<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
}

/**
 * Unified API client hook
 */
export function useApiClient(options: UseApiClientOptions = {}) {
  const {
    showErrors = true,
    showSuccess = false,
    correlationId: providedCorrelationId
  } = options;

  /**
   * Generate correlation ID
   */
  const generateCorrelationId = useCallback(() => {
    if (providedCorrelationId) return providedCorrelationId;
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, [providedCorrelationId]);

  /**
   * GET request
   */
  const get = useCallback(async <T = any>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> => {
    const correlationId = generateCorrelationId();
    
    try {
      const response = await fetchEnvelope<T>(
        getAPIUrl(endpoint),
        {
          ...options,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-Id': correlationId,
            ...options?.headers,
          },
        }
      );

      if (isErrorResponse(response)) {
        if (showErrors) {
          toast.error(response.error.message || 'Request failed', {
            description: response.error.code,
          });
        }
      }

      return response;
    } catch (error) {
      const errorResponse: ApiError = {
        ok: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
        },
        meta: {
          ts: new Date().toISOString(),
          correlationId,
          apiVersion: 'v1',
        },
      };

      if (showErrors) {
        toast.error('Network error', {
          description: errorResponse.error.message,
        });
      }

      return errorResponse;
    }
  }, [generateCorrelationId, showErrors]);

  /**
   * POST request
   */
  const post = useCallback(async <T = any>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> => {
    const correlationId = generateCorrelationId();
    
    try {
      const response = await fetchEnvelope<T>(
        getAPIUrl(endpoint),
        {
          ...options,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-Id': correlationId,
            ...options?.headers,
          },
          body: body ? JSON.stringify(body) : undefined,
        }
      );

      if (isErrorResponse(response)) {
        if (showErrors) {
          toast.error(response.error.message || 'Request failed', {
            description: response.error.code,
          });
        }
      } else if (showSuccess) {
        toast.success('Request completed');
      }

      return response;
    } catch (error) {
      const errorResponse: ApiError = {
        ok: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
        },
        meta: {
          ts: new Date().toISOString(),
          correlationId,
          apiVersion: 'v1',
        },
      };

      if (showErrors) {
        toast.error('Network error', {
          description: errorResponse.error.message,
        });
      }

      return errorResponse;
    }
  }, [generateCorrelationId, showErrors, showSuccess]);

  /**
   * PUT request
   */
  const put = useCallback(async <T = any>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> => {
    const correlationId = generateCorrelationId();
    
    try {
      const response = await fetchEnvelope<T>(
        getAPIUrl(endpoint),
        {
          ...options,
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-Id': correlationId,
            ...options?.headers,
          },
          body: body ? JSON.stringify(body) : undefined,
        }
      );

      if (isErrorResponse(response)) {
        if (showErrors) {
          toast.error(response.error.message || 'Request failed', {
            description: response.error.code,
          });
        }
      } else if (showSuccess) {
        toast.success('Request completed');
      }

      return response;
    } catch (error) {
      const errorResponse: ApiError = {
        ok: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
        },
        meta: {
          ts: new Date().toISOString(),
          correlationId,
          apiVersion: 'v1',
        },
      };

      if (showErrors) {
        toast.error('Network error', {
          description: errorResponse.error.message,
        });
      }

      return errorResponse;
    }
  }, [generateCorrelationId, showErrors, showSuccess]);

  /**
   * DELETE request
   */
  const del = useCallback(async <T = any>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> => {
    const correlationId = generateCorrelationId();
    
    try {
      const response = await fetchEnvelope<T>(
        getAPIUrl(endpoint),
        {
          ...options,
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-Id': correlationId,
            ...options?.headers,
          },
        }
      );

      if (isErrorResponse(response)) {
        if (showErrors) {
          toast.error(response.error.message || 'Request failed', {
            description: response.error.code,
          });
        }
      } else if (showSuccess) {
        toast.success('Request completed');
      }

      return response;
    } catch (error) {
      const errorResponse: ApiError = {
        ok: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
        },
        meta: {
          ts: new Date().toISOString(),
          correlationId,
          apiVersion: 'v1',
        },
      };

      if (showErrors) {
        toast.error('Network error', {
          description: errorResponse.error.message,
        });
      }

      return errorResponse;
    }
  }, [generateCorrelationId, showErrors, showSuccess]);

  return useMemo(() => ({
    get,
    post,
    put,
    delete: del,
    generateCorrelationId,
  }), [get, post, put, del, generateCorrelationId]);
}

/**
 * Helper to check if response is an error
 */
function isErrorResponse<T>(response: ApiResponse<T>): response is ApiError {
  return response.ok === false;
}

