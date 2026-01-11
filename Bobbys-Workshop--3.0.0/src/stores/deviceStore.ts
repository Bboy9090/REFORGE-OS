/**
 * Device Store
 * Shared device state across secret rooms
 */

import { create } from 'zustand';

interface Device {
  serial: string;
  brand: string;
  model: string;
  state: string;
  platform?: string;
  mode?: string; // DFU, Recovery, Normal
  status?: string;
}

interface DeviceState {
  activeDevice: Device | null;
  devices: Device[];
  setActiveDevice: (device: Device | null) => void;
  setDevices: (devices: Device[]) => void;
  updateDeviceStatus: (serial: string, status: Partial<Device>) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  activeDevice: null,
  devices: [],

  setActiveDevice: (device) => {
    set({ activeDevice: device });
  },

  setDevices: (devices) => {
    set({ devices });
  },

  updateDeviceStatus: (serial, status) => {
    set((state) => ({
      devices: state.devices.map((d) =>
        d.serial === serial ? { ...d, ...status } : d
      ),
      activeDevice:
        state.activeDevice?.serial === serial
          ? { ...state.activeDevice, ...status }
          : state.activeDevice,
    }));
  },
}));
