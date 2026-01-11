/**
 * Error Boundary Component
 * Catches React component errors and displays a fallback UI
 */

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { toast } from 'sonner';
import { AppErrorHandler } from '@/lib/error-handler';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error
    AppErrorHandler.handleError(error, 'React Error Boundary', {
      showToast: true,
      logToConsole: true,
      logToServer: false,
    });

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    toast.success('Error boundary reset - page reloaded');
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-gray-900 border border-red-500/30 rounded-lg p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
              <h1 className="text-2xl font-bold text-red-400">Something Went Wrong</h1>
            </div>

            <p className="text-gray-300 mb-6">
              An unexpected error occurred. Don't worry, your data is safe. You can try reloading the page or returning to the home page.
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <p className="text-sm font-mono text-red-400 mb-2">Error Details:</p>
                <p className="text-sm text-gray-300 break-words">{this.state.error.message}</p>
                {process.env.NODE_ENV === 'development' && this.state.error.stack && (
                  <details className="mt-4">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                      Stack Trace (dev only)
                    </summary>
                    <pre className="mt-2 text-xs text-gray-500 overflow-auto max-h-64 p-2 bg-black rounded border border-gray-700">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-6 py-3 bg-cyan-500 text-black rounded-lg font-bold hover:bg-cyan-400 active:bg-cyan-600 transition-colors touch-target-min flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 active:bg-gray-600 transition-colors touch-target-min flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 active:bg-gray-600 transition-colors touch-target-min flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to manually trigger error boundary (for testing)
 */
export function useErrorBoundary() {
  return (error: Error) => {
    throw error;
  };
}
