/**
 * Unified API Client for Bobby's Workshop
 * Handles all API calls with proper error handling, retries, and timeouts
 */

import { API_CONFIG } from './apiConfig';

// Re-export API_CONFIG for convenience
export { API_CONFIG } from './apiConfig';

export interface APIError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  skipAuth?: boolean;
}

class APIClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultRetries: number;
  private defaultRetryDelay: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultTimeout = API_CONFIG.TIMEOUT || 30000;
    this.defaultRetries = 3;
    this.defaultRetryDelay = 1000;
  }

  /**
   * Get authentication token from store
   */
  private getAuthToken(): string | null {
    try {
      // Check for Phoenix Key token
      const phoenixToken = localStorage.getItem('phoenix_key_token');
      if (phoenixToken) return phoenixToken;

      // Check for Secret Room passcode
      const secretPasscode = localStorage.getItem('bobbysWorkshop.secretRoomPasscode');
      if (secretPasscode) return secretPasscode;

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Build full URL from endpoint
   */
  private buildURL(endpoint: string): string {
    // If endpoint is already a full URL, return as-is
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }

    // Remove leading slash if present (we'll add it)
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Combine base URL with endpoint
    const base = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
    return `${base}${cleanEndpoint}`;
  }

  /**
   * Create error from response
   */
  private async createError(response: Response): Promise<APIError> {
    let errorData: any = {};
    try {
      const text = await response.text();
      if (text) {
        errorData = JSON.parse(text);
      }
    } catch {
      // If parsing fails, use status text
    }

    return {
      message: errorData.message || errorData.error || response.statusText || 'Request failed',
      status: response.status,
      code: errorData.code || `HTTP_${response.status}`,
      details: errorData,
    };
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry(
    url: string,
    options: RequestOptions,
    retries: number,
    retryDelay: number
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.defaultTimeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // If successful, return response
        if (response.ok) {
          return response;
        }

        // Don't retry on client errors (4xx) except 408, 429
        if (response.status >= 400 && response.status < 500) {
          if (response.status === 408 || response.status === 429) {
            // Request timeout or rate limit - retry
            if (attempt < retries) {
              await this.sleep(retryDelay * (attempt + 1));
              continue;
            }
          }
          // Other 4xx errors - don't retry
          throw await this.createError(response);
        }

        // Server errors (5xx) - retry
        if (response.status >= 500) {
          if (attempt < retries) {
            await this.sleep(retryDelay * (attempt + 1));
            continue;
          }
        }

        throw await this.createError(response);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on abort (timeout) or network errors on last attempt
        if (error instanceof Error && error.name === 'AbortError') {
          if (attempt === retries) {
            throw new Error(`Request timeout after ${options.timeout || this.defaultTimeout}ms`);
          }
        }

        // If not last attempt, wait and retry
        if (attempt < retries) {
          await this.sleep(retryDelay * (attempt + 1));
          continue;
        }
      }
    }

    throw lastError || new Error('Request failed after all retries');
  }

  /**
   * Make API request
   */
  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = this.buildURL(endpoint);
    const retries = options.retries ?? this.defaultRetries;
    const retryDelay = options.retryDelay ?? this.defaultRetryDelay;

    // Set default headers
    const headers = new Headers(options.headers);
    
    // Add content type if not present and body exists
    if (options.body && !headers.has('Content-Type')) {
      if (options.body instanceof FormData) {
        // Don't set Content-Type for FormData, browser will set it with boundary
      } else if (typeof options.body === 'string') {
        headers.set('Content-Type', 'application/json');
      } else {
        headers.set('Content-Type', 'application/json');
        options.body = JSON.stringify(options.body);
      }
    }

    // Add authentication if not skipped
    if (!options.skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        // Use Phoenix Key header format
        headers.set('X-Secret-Room-Passcode', token);
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    // Execute request with retry logic
    try {
      const response = await this.executeWithRetry(url, { ...options, headers }, retries, retryDelay);

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return (text ? text : {}) as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data,
    });
  }

  /**
   * Upload file
   */
  async upload<T = any>(endpoint: string, file: File | Blob, options: RequestOptions = {}): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
    });
  }

  /**
   * Check if backend is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get<{ status: string }>('/api/v1/ready', {
        timeout: 5000,
        retries: 1,
        skipAuth: true,
      });
      return response?.status === 'ready';
    } catch {
      return false;
    }
  }

  /**
   * Create WebSocket URL
   */
  createWebSocketURL(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    try {
      const base = new URL(this.baseURL);
      const wsProtocol = base.protocol === 'https:' ? 'wss:' : 'ws:';
      const basePath = base.pathname && base.pathname !== '/' ? base.pathname.replace(/\/+$/g, '') : '';
      return `${wsProtocol}//${base.host}${basePath}${normalizedPath}`;
    } catch {
      // Fallback to localhost:8000
      return `ws://localhost:8000${normalizedPath}`;
    }
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export convenience functions
export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) => apiClient.get<T>(endpoint, options),
  post: <T = any>(endpoint: string, data?: any, options?: RequestOptions) => apiClient.post<T>(endpoint, data, options),
  put: <T = any>(endpoint: string, data?: any, options?: RequestOptions) => apiClient.put<T>(endpoint, data, options),
  delete: <T = any>(endpoint: string, options?: RequestOptions) => apiClient.delete<T>(endpoint, options),
  patch: <T = any>(endpoint: string, data?: any, options?: RequestOptions) => apiClient.patch<T>(endpoint, data, options),
  upload: <T = any>(endpoint: string, file: File | Blob, options?: RequestOptions) => apiClient.upload<T>(endpoint, file, options),
  healthCheck: () => apiClient.healthCheck(),
  ws: (path: string) => apiClient.createWebSocketURL(path),
};
