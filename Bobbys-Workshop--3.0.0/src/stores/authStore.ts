/**
 * Phoenix Key Authentication Store
 * Zustand store for authentication state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  lastActivity: number;
  setToken: (token: string) => void;
  clearAuth: () => void;
  updateActivity: () => void;
  checkExpired: () => boolean;
}

const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      lastActivity: Date.now(),

      setToken: (token: string) => {
        set({
          token,
          isAuthenticated: true,
          lastActivity: Date.now(),
        });
      },

      clearAuth: () => {
        set({
          token: null,
          isAuthenticated: false,
          lastActivity: 0,
        });
      },

      updateActivity: () => {
        set({ lastActivity: Date.now() });
      },

      checkExpired: () => {
        const { lastActivity } = get();
        const now = Date.now();
        const expired = now - lastActivity > SESSION_TIMEOUT;
        
        if (expired) {
          get().clearAuth();
        }
        
        return expired;
      },
    }),
    {
      name: 'phoenix-key-auth',
    }
  )
);
