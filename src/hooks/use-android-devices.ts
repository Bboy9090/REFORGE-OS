import { useState, useEffect, useCallback } from 'react';
import type { AndroidDevicesResponse } from '@/types/android-devices';

const API_BASE_URL = 'http://localhost:3001/api';

export function useAndroidDevices(autoRefresh: boolean = false, refreshInterval: number = 3000) {
  const [data, setData] = useState<AndroidDevicesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/android-devices/all`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch Android devices';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchDevices, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchDevices]);

  return {
    data,
    devices: data?.devices || [],
    loading,
    error,
    refresh: fetchDevices,
    adbAvailable: data?.sources.adb.available || false,
    fastbootAvailable: data?.sources.fastboot.available || false,
    adbCount: data?.sources.adb.count || 0,
    fastbootCount: data?.sources.fastboot.count || 0,
  };
}

export function useADBDevices() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/adb/devices`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('ADB not installed on system');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setDevices(result.devices || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch ADB devices';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return {
    devices,
    loading,
    error,
    refresh: fetchDevices,
  };
}

export function useFastbootDevices() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/fastboot/devices`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Fastboot not installed on system');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setDevices(result.devices || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch Fastboot devices';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return {
    devices,
    loading,
    error,
    refresh: fetchDevices,
  };
}
