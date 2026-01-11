/**
 * Authentication Utilities
 * Unified authentication helpers for Phoenix Key across all secret rooms
 */

import { useAuthStore } from '@/stores/authStore';
import { API_CONFIG, apiRequest } from './api-client';
import { toast } from 'sonner';
import { logger } from './logger';

export interface PhoenixKeyToken {
  token: string;
  expires_at: string;
  status: 'active' | 'expired' | 'revoked';
}

/**
 * Validate Phoenix Key token
 */
export async function validatePhoenixToken(token: string): Promise<boolean> {
  try {
    const response = await apiRequest<{ valid: boolean; expires_at?: string }>(
      API_CONFIG.ENDPOINTS.PHOENIX_VALIDATE,
      {
        method: 'POST',
        body: { token },
        requireAuth: false,
        showErrorToast: false,
      }
    );

    if (response.success && response.data?.valid) {
      // Check expiration
      if (response.data.expires_at) {
        const expiresAt = new Date(response.data.expires_at);
        if (expiresAt < new Date()) {
          logger.warn('AUTH', 'Phoenix token expired', { expires_at: response.data.expires_at });
          return false;
        }
      }
      return true;
    }

    return false;
  } catch (error) {
    logger.error('AUTH', 'Failed to validate Phoenix token', error);
    return false;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  try {
    const state = useAuthStore.getState();
    if (!state?.token) return false;

    // Check if session expired
    if (state.checkExpired()) {
      return false;
    }

    return state.isAuthenticated && !!state.token;
  } catch {
    return false;
  }
}

/**
 * Require authentication - throws if not authenticated
 */
export function requireAuth(): void {
  if (!isAuthenticated()) {
    throw new Error('Authentication required. Please unlock with Phoenix Key first.');
  }
}

/**
 * Get auth token or throw
 */
export function getAuthToken(): string {
  const state = useAuthStore.getState();
  const token = state?.token;
  if (!token || !state?.isAuthenticated) {
    throw new Error('Authentication required. Please unlock with Phoenix Key first.');
  }
  
  // Check expiration
  if (state.checkExpired()) {
    throw new Error('Session expired. Please authenticate again.');
  }
  
  // Update activity
  state.updateActivity();
  
  return token;
}

/**
 * Refresh token if needed
 */
export async function refreshTokenIfNeeded(): Promise<boolean> {
  if (!isAuthenticated()) {
    return false;
  }

  const token = useAuthStore.getState()?.token;
  if (!token) {
    return false;
  }

  try {
    const valid = await validatePhoenixToken(token);
    if (!valid) {
      logger.warn('AUTH', 'Token validation failed, clearing auth');
      useAuthStore.getState()?.clearAuth();
      toast.error('Session expired. Please authenticate again.');
      return false;
    }
    return true;
  } catch (error) {
    logger.error('AUTH', 'Failed to refresh token', error);
    return false;
  }
}

/**
 * Auto-refresh token periodically
 */
export function setupTokenAutoRefresh(intervalMs: number = 5 * 60 * 1000): () => void {
  const interval = setInterval(async () => {
    if (isAuthenticated()) {
      await refreshTokenIfNeeded();
    }
  }, intervalMs);

  return () => clearInterval(interval);
}
