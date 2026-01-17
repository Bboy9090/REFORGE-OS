/**
 * Unified API Client for Bobby's Workshop
 * Single source of truth for all API calls
 * Handles authentication, error handling, and retry logic
 */

import { API_CONFIG, getAPIUrl, getWSUrl } from './apiConfig';
import { toast } from 'sonner';

// Re-export API_CONFIG and helpers for convenience
export { API_CONFIG, getAPIUrl, getWSUrl } from './apiConfig';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  requireAuth?: boolean;
  timeout?: number;
  showErrorToast?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

/**
 * Get authentication headers
 * Uses lazy import to avoid circular dependencies during build
 */
export async function getAuthHeaders(token?: string): Promise<Record<string, string>> {
  let authToken = token;
  if (!authToken) {
    try {
      // Lazy import to avoid build-time circular dependencies
      const authStore = await import('@/stores/authStore');
      authToken = authStore.useAuthStore.getState()?.token || null;
    } catch {
      // Store not available during build time or not imported
      authToken = null;
    }
  }
  
  if (!authToken) {
    return {};
  }

  return {
    'X-Secret-Room-Passcode': authToken,
    'X-Phoenix-Key': authToken,
  };
}

/**
 * Make API request with automatic error handling
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    headers = {},
    requireAuth = false,
    timeout = API_CONFIG.TIMEOUT,
    showErrorToast = true,
  } = options;

  // Build URL
  const fullEndpoint = endpoint.startsWith('/') 
    ? endpoint 
    : `/${endpoint}`;
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : getAPIUrl(fullEndpoint);

  // Build headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add auth if required
  if (requireAuth) {
    const authHeaders = await getAuthHeaders();
    if (!authHeaders['X-Secret-Room-Passcode'] && !authHeaders['X-Phoenix-Key']) {
      const error = 'Authentication required';
      if (showErrorToast) {
        toast.error(error);
      }
      return { success: false, error, status: 401 };
    }
    Object.assign(requestHeaders, authHeaders);
  }

  // Build request config
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: controller.signal,
    };

    if (body && method !== 'GET') {
      // Handle FormData (file uploads) - don't stringify
      if (body instanceof FormData) {
        fetchOptions.body = body;
        // Remove Content-Type header for FormData - browser will set it with boundary
        delete requestHeaders['Content-Type'];
      } else if (typeof body === 'string') {
        fetchOptions.body = body;
      } else {
        fetchOptions.body = JSON.stringify(body);
      }
    }

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: any;
    if (isJson) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { raw: text, contentType };
    }

    if (!response.ok) {
      const error = data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`;
      if (showErrorToast) {
        toast.error(error);
      }
      return {
        success: false,
        error,
        status: response.status,
        data: data,
      };
    }

    return {
      success: true,
      data: data,
      status: response.status,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    const errorMessage = error.name === 'AbortError'
      ? 'Request timeout - backend may be slow or offline'
      : error.message || 'Network error - backend may be offline';

    if (showErrorToast) {
      toast.error(errorMessage);
    }

    return {
      success: false,
      error: errorMessage,
      status: 0,
    };
  }
}

/**
 * WebSocket connection helper
 */
export function createWebSocket(
  path: string,
  token?: string,
  onMessage?: (data: any) => void,
  onError?: (error: Event) => void,
  onClose?: () => void
): WebSocket | null {
  try {
    const url = getWSUrl(path);
    const ws = new WebSocket(url);

    ws.onopen = () => {
      // Send auth token if provided
      if (token) {
        ws.send(JSON.stringify({ type: 'auth', token }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) {
          onMessage(data);
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    ws.onerror = (error) => {
      if (onError) {
        onError(error);
      }
    };

    ws.onclose = () => {
      if (onClose) {
        onClose();
      }
    };

    return ws;
  } catch (error) {
    console.error('Failed to create WebSocket:', error);
    if (onError) {
      onError(new Event('error'));
    }
    return null;
  }
}

/**
 * Health check
 */
export async function checkHealth(): Promise<boolean> {
  const response = await apiRequest(API_CONFIG.ENDPOINTS.HEALTH, {
    showErrorToast: false,
  });
  return response.success;
}

/**
 * Ready check (more comprehensive than health)
 */
export async function checkReady(): Promise<boolean> {
  const response = await apiRequest(API_CONFIG.ENDPOINTS.READY, {
    showErrorToast: false,
  });
  return response.success;
}

/**
 * Convenient API client object with common methods
 */
export const api = {
  get: <T = any>(endpoint: string, options?: Omit<ApiRequestOptions, 'method'>): Promise<ApiResponse<T>> => {
    return apiRequest<T>(endpoint, { ...options, method: 'GET' });
  },
  post: <T = any>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> => {
    return apiRequest<T>(endpoint, { ...options, method: 'POST', body });
  },
  put: <T = any>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> => {
    return apiRequest<T>(endpoint, { ...options, method: 'PUT', body });
  },
  patch: <T = any>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> => {
    return apiRequest<T>(endpoint, { ...options, method: 'PATCH', body });
  },
  delete: <T = any>(endpoint: string, options?: Omit<ApiRequestOptions, 'method'>): Promise<ApiResponse<T>> => {
    return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
