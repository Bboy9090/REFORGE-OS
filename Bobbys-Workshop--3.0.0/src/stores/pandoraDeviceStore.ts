/**
 * Pandora Codex Device Store
 * Hardware status for Chain-Breaker
 */

import { create } from 'zustand';

interface HardwareStatus {
  status: string;
  msg: string;
  mode: string | null;
  color: string;
  pid?: string;
}

interface PandoraDeviceState {
  hardwareStatus: HardwareStatus | null;
  setHardwareStatus: (status: HardwareStatus) => void;
  clearStatus: () => void;
}

export const usePandoraDeviceStore = create<PandoraDeviceState>((set) => ({
  hardwareStatus: null,

  setHardwareStatus: (status) => {
    set({ hardwareStatus: status });
  },

  clearStatus: () => {
    set({ hardwareStatus: null });
  },
}));
