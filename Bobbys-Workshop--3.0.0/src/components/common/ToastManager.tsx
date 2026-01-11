/**
 * Toast Manager Component
 * Centralized toast notification management
 * Uses Sonner for consistent toast styling across the app
 */

import { useEffect } from 'react';
import { Toaster as SonnerToaster, toast } from 'sonner';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { useBackendConnectivity } from '@/hooks/useOfflineDetection';
import { logger } from '@/lib/logger';

export function ToastManager() {
  const { isOnline } = useOfflineDetection();
  const { isConnected } = useBackendConnectivity();

  // Show toast on connectivity changes
  useEffect(() => {
    if (!isOnline) {
      toast.warning('You are offline', {
        description: 'Some features may be unavailable',
        duration: 5000,
      });
      logger.warn('CONNECTIVITY', 'Application went offline');
    }
  }, [isOnline]);

  useEffect(() => {
    if (!isConnected && isOnline) {
      toast.warning('Backend unavailable', {
        description: 'Server may be starting or offline',
        duration: 5000,
      });
      logger.warn('CONNECTIVITY', 'Backend connection lost');
    }
  }, [isConnected, isOnline]);

  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      expand
      duration={4000}
      toastOptions={{
        className: 'font-mono text-sm',
        style: {
          background: '#0a0a0a',
          border: '1px solid #1f1f1f',
          color: '#ffffff',
        },
      }}
    />
  );
}

/**
 * Toast helper functions for consistent messaging
 */
export const toastHelpers = {
  success: (message: string, description?: string) => {
    toast.success(message, { description, duration: 3000 });
    logger.info('USER_ACTION', message, { description });
  },
  error: (message: string, description?: string, error?: Error) => {
    toast.error(message, { description, duration: 5000 });
    logger.error('USER_ACTION', message, error, { description });
  },
  warning: (message: string, description?: string) => {
    toast.warning(message, { description, duration: 4000 });
    logger.warn('USER_ACTION', message, { description });
  },
  info: (message: string, description?: string) => {
    toast.info(message, { description, duration: 3000 });
    logger.info('USER_ACTION', message, { description });
  },
  loading: (message: string) => {
    return toast.loading(message);
  },
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  },
};
