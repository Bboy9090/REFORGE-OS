/**
 * Comprehensive Error Handling System
 * Centralized error handling, logging, and user feedback
 */

import { toast } from 'sonner';

export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  stack?: string;
}

export class AppErrorHandler {
  private static errorLog: AppError[] = [];
  private static maxLogSize = 100;

  /**
   * Handle and log application errors
   */
  static handleError(
    error: unknown,
    context: string,
    options: {
      showToast?: boolean;
      logToConsole?: boolean;
      logToServer?: boolean;
    } = {}
  ): AppError {
    const {
      showToast = true,
      logToConsole = true,
      logToServer = false,
    } = options;

    // Extract error information
    let errorMessage = 'An unexpected error occurred';
    let errorCode = 'UNKNOWN_ERROR';
    let stack: string | undefined;
    let details: Record<string, unknown> = {};

    if (error instanceof Error) {
      errorMessage = error.message;
      stack = error.stack;
      
      // Try to extract error code from common patterns
      if (error.name) {
        errorCode = error.name.toUpperCase().replace(/\s+/g, '_');
      }
      
      // Extract details from common error types
      if ('status' in error) {
        details.status = (error as any).status;
      }
      if ('response' in error) {
        details.response = (error as any).response;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
      errorCode = 'STRING_ERROR';
    } else if (error && typeof error === 'object') {
      errorMessage = (error as any).message || JSON.stringify(error);
      errorCode = (error as any).code || 'OBJECT_ERROR';
      details = error as Record<string, unknown>;
    }

    const appError: AppError = {
      code: errorCode,
      message: errorMessage,
      details: {
        ...details,
        context,
      },
      timestamp: new Date().toISOString(),
      stack,
    };

    // Log to console if enabled
    if (logToConsole) {
      console.error(`[${context}]`, appError);
    }

    // Add to error log
    this.errorLog.push(appError);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Show toast notification if enabled
    if (showToast) {
      toast.error(errorMessage, {
        description: context,
        duration: 5000,
      });
    }

    // Log to server if enabled (future implementation)
    if (logToServer) {
      // TODO: Send error to logging service
      this.sendErrorToServer(appError);
    }

    return appError;
  }

  /**
   * Handle network errors specifically
   */
  static handleNetworkError(
    error: unknown,
    endpoint: string,
    options: {
      showToast?: boolean;
      retryable?: boolean;
    } = {}
  ): AppError {
    const {
      showToast = true,
      retryable = true,
    } = options;

    let errorMessage = 'Network request failed';
    let errorCode = 'NETWORK_ERROR';

    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.name === 'TimeoutError') {
        errorMessage = 'Request timeout - backend may be slow or offline';
        errorCode = 'TIMEOUT_ERROR';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Network error - backend may be offline';
        errorCode = 'OFFLINE_ERROR';
      } else {
        errorMessage = error.message;
      }
    }

    const appError = this.handleError(
      error,
      `Network request to ${endpoint}`,
      {
        showToast,
        logToConsole: true,
        logToServer: false,
      }
    );

    return {
      ...appError,
      code: errorCode,
      message: errorMessage,
      details: {
        ...appError.details,
        endpoint,
        retryable,
      },
    };
  }

  /**
   * Handle API errors with status codes
   */
  static handleAPIError(
    status: number,
    response: unknown,
    endpoint: string
  ): AppError {
    let errorMessage = `HTTP ${status} Error`;
    const errorCode = `HTTP_${status}`;

    // Extract error message from response
    if (response && typeof response === 'object') {
      const resp = response as Record<string, unknown>;
      if (resp.message) {
        errorMessage = String(resp.message);
      } else if (resp.error) {
        errorMessage = String(resp.error);
      } else if (resp.detail) {
        errorMessage = String(resp.detail);
      }
    }

    // Map common status codes to user-friendly messages
    const statusMessages: Record<number, string> = {
      400: 'Invalid request - please check your input',
      401: 'Authentication required - please log in',
      403: 'Access forbidden - insufficient permissions',
      404: 'Resource not found',
      500: 'Server error - please try again later',
      503: 'Service unavailable - backend may be starting',
    };

    if (statusMessages[status]) {
      errorMessage = statusMessages[status];
    }

    const appError: AppError = {
      code: errorCode,
      message: errorMessage,
      details: {
        status,
        endpoint,
        response,
      },
      timestamp: new Date().toISOString(),
    };

    toast.error(errorMessage, {
      description: `Request to ${endpoint} failed`,
      duration: 5000,
    });

    this.errorLog.push(appError);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    console.error(`[API Error]`, appError);

    return appError;
  }

  /**
   * Get error log for debugging
   */
  static getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  static clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Send error to logging service (future implementation)
   */
  private static async sendErrorToServer(error: AppError): Promise<void> {
    // TODO: Implement server-side error logging
    // This could send errors to a logging service like Sentry, LogRocket, etc.
    try {
      // Example implementation:
      // await fetch('/api/v1/logs/error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(error),
      // });
    } catch {
      // Fail silently - don't let error logging cause more errors
    }
  }
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
  } = options;

  let delay = initialDelay;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if we've exceeded max retries or shouldRetry returns false
      if (attempt >= maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    // Network errors are retryable
    if (
      error.message.includes('timeout') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.name === 'AbortError'
    ) {
      return true;
    }
  }

  // 5xx errors are retryable (server errors)
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as any).status;
    if (status >= 500 && status < 600) {
      return true;
    }
  }

  return false;
}

/**
 * Format error for user display
 */
export function formatErrorForUser(error: unknown): string {
  if (error instanceof Error) {
    // Don't show stack traces to users
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }
  return 'An unexpected error occurred';
}
