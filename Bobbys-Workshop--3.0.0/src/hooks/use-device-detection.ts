import { useState, useEffect, useCallback, useRef } from 'react';
import { detectSystemTools, detectUSBDevices, scanLocalNetwork, requestUSBDevice, getUSBVendorName, type SystemTool, type USBDeviceInfo, type NetworkDevice } from '@/lib/deviceDetection';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';

interface NotificationSettings {
  enableConnectionNotifications: boolean;
  enableDisconnectionNotifications: boolean;
  notificationDuration: number;
  enableSound: boolean;
  enableVibration: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enableConnectionNotifications: true,
  enableDisconnectionNotifications: true,
  notificationDuration: 4000,
  enableSound: false,
  enableVibration: false,
};

export function useSystemTools() {
  const [tools, setTools] = useState<SystemTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const detected = await detectSystemTools();
      setTools(detected);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect system tools');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { tools, loading, error, refresh };
}

export function useUSBDevices() {
  const [devices, setDevices] = useState<USBDeviceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const previousDevicesRef = useRef<Map<string, USBDeviceInfo>>(new Map());
  const [settings, setSettings] = useKV<NotificationSettings>('usb-monitoring-settings', DEFAULT_SETTINGS);

  const refresh = useCallback(async () => {
    const nav = navigator as any;
    if (!nav.usb) {
      setSupported(false);
      setLoading(false);
      return;
    }

    setError(null);
    try {
      const detected = await detectUSBDevices();
      setDevices(detected);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect USB devices');
    } finally {
      setLoading(false);
    }
  }, []);

  const requestDevice = useCallback(async () => {
    const nav = navigator as any;
    if (!nav.usb) {
      setError('WebUSB not supported in this browser');
      return null;
    }

    try {
      const device = await requestUSBDevice();
      if (device) {
        await refresh();
      }
      return device;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request USB device');
      return null;
    }
  }, [refresh]);

  useEffect(() => {
    refresh();

    const nav = navigator as any;
    if (nav.usb) {
      setIsMonitoring(true);

      const handleConnect = async (event: any) => {
        const device = event.device;
        const deviceInfo: USBDeviceInfo = {
          id: `${device.vendorId}-${device.productId}-${device.serialNumber || 'unknown'}`,
          vendorId: device.vendorId,
          productId: device.productId,
          manufacturerName: device.manufacturerName,
          productName: device.productName,
          serialNumber: device.serialNumber
        };

        const deviceName = deviceInfo.productName || `Device (VID: 0x${deviceInfo.vendorId.toString(16).padStart(4, '0')})`;
        const vendorName = getUSBVendorName(deviceInfo.vendorId);

        const currentSettings = settings || DEFAULT_SETTINGS;

        if (currentSettings.enableConnectionNotifications) {
          toast.success('USB Device Connected', {
            description: `${deviceName} - ${vendorName}`,
            duration: currentSettings.notificationDuration,
          });
        }

        if (currentSettings.enableVibration && navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }

        await refresh();
      };

      const handleDisconnect = async (event: any) => {
        const device = event.device;
        const deviceInfo: USBDeviceInfo = {
          id: `${device.vendorId}-${device.productId}-${device.serialNumber || 'unknown'}`,
          vendorId: device.vendorId,
          productId: device.productId,
          manufacturerName: device.manufacturerName,
          productName: device.productName,
          serialNumber: device.serialNumber
        };

        const deviceName = deviceInfo.productName || `Device (VID: 0x${deviceInfo.vendorId.toString(16).padStart(4, '0')})`;
        const vendorName = getUSBVendorName(deviceInfo.vendorId);

        const currentSettings = settings || DEFAULT_SETTINGS;

        if (currentSettings.enableDisconnectionNotifications) {
          toast.error('USB Device Disconnected', {
            description: `${deviceName} - ${vendorName}`,
            duration: currentSettings.notificationDuration,
          });
        }

        if (currentSettings.enableVibration && navigator.vibrate) {
          navigator.vibrate([100]);
        }

        await refresh();
      };

      nav.usb.addEventListener('connect', handleConnect);
      nav.usb.addEventListener('disconnect', handleDisconnect);

      return () => {
        setIsMonitoring(false);
        nav.usb?.removeEventListener('connect', handleConnect);
        nav.usb?.removeEventListener('disconnect', handleDisconnect);
      };
    }
  }, [refresh]);

  useEffect(() => {
    const currentDeviceMap = new Map(devices.map(d => [d.id, d]));
    const previousDeviceMap = previousDevicesRef.current;

    if (previousDeviceMap.size > 0 && !loading) {
      currentDeviceMap.forEach((device, id) => {
        if (!previousDeviceMap.has(id)) {
          const deviceName = device.productName || `Device (VID: 0x${device.vendorId.toString(16).padStart(4, '0')})`;
          const vendorName = getUSBVendorName(device.vendorId);
          console.log(`New device detected: ${deviceName} - ${vendorName}`);
        }
      });

      previousDeviceMap.forEach((device, id) => {
        if (!currentDeviceMap.has(id)) {
          const deviceName = device.productName || `Device (VID: 0x${device.vendorId.toString(16).padStart(4, '0')})`;
          const vendorName = getUSBVendorName(device.vendorId);
          console.log(`Device removed: ${deviceName} - ${vendorName}`);
        }
      });
    }

    previousDevicesRef.current = currentDeviceMap;
  }, [devices, loading]);

  return { devices, loading, error, supported, isMonitoring, refresh, requestDevice };
}

export function useNetworkDevices() {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const scan = useCallback(async () => {
    setScanning(true);
    setLoading(true);
    setError(null);
    try {
      const detected = await scanLocalNetwork();
      setDevices(detected);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan network');
    } finally {
      setLoading(false);
      setScanning(false);
    }
  }, []);

  return { devices, loading, error, scanning, scan };
}

export function useAllDevices() {
  const systemTools = useSystemTools();
  const usbDevices = useUSBDevices();
  const networkDevices = useNetworkDevices();

  const refreshAll = useCallback(async () => {
    await Promise.all([
      systemTools.refresh(),
      usbDevices.refresh(),
      networkDevices.scan()
    ]);
  }, [systemTools, usbDevices, networkDevices]);

  const isLoading = systemTools.loading || usbDevices.loading || networkDevices.loading;
  const hasError = systemTools.error || usbDevices.error || networkDevices.error;

  return {
    systemTools,
    usbDevices,
    networkDevices,
    isLoading,
    hasError,
    refreshAll
  };
}
