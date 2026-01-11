/**
 * Ghost Codex Alert Store
 * Cache for canary token alerts
 */

import { create } from 'zustand';

interface CanaryAlert {
  token: string;
  ip: string;
  device_info: string;
  time: string;
  status: string;
}

interface GhostAlertState {
  alerts: CanaryAlert[];
  setAlerts: (alerts: CanaryAlert[]) => void;
  addAlert: (alert: CanaryAlert) => void;
  clearAlerts: () => void;
}

export const useGhostAlertStore = create<GhostAlertState>((set) => ({
  alerts: [],

  setAlerts: (alerts) => {
    set({ alerts });
  },

  addAlert: (alert) => {
    set((state) => ({
      alerts: [alert, ...state.alerts],
    }));
  },

  clearAlerts: () => {
    set({ alerts: [] });
  },
}));
