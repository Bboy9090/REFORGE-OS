import { useState, useEffect, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
import { checkDeviceFirmware, checkMultipleDevicesFirmware } from '../lib/firmware-api';
import type { FirmwareCheckResult, FirmwareInfo } from '../types/firmware';

interface UseFirmwareCheckOptions {
  autoCheck?: boolean;
  checkInterval?: number;
  cacheResults?: boolean;
}

export function useFirmwareCheck(deviceSerials: string[], options: UseFirmwareCheckOptions = {}) {
  const { autoCheck = false, checkInterval = 0, cacheResults = true } = options;
  
  const [firmwareData, setFirmwareData] = useKV<Record<string, FirmwareInfo>>('firmware-check-cache', {});
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const checkFirmware = useCallback(async (serials: string[]) => {
    if (serials.length === 0) return;

    setIsChecking(true);
    setErrors({});

    try {
      const results = await checkMultipleDevicesFirmware(serials);
      
      const newFirmwareData: Record<string, FirmwareInfo> = {};
      const newErrors: Record<string, string> = {};

      results.forEach((result: FirmwareCheckResult) => {
        if (result.success && result.firmware) {
          newFirmwareData[result.deviceSerial] = result.firmware;
        } else if (result.error) {
          newErrors[result.deviceSerial] = result.error;
        }
      });

      if (cacheResults) {
        setFirmwareData(current => ({ ...current, ...newFirmwareData }));
      } else {
        setFirmwareData(newFirmwareData);
      }

      setErrors(newErrors);
      setLastChecked(Date.now());
    } catch (error) {
      console.error('Failed to check firmware:', error);
      setErrors({ _global: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsChecking(false);
    }
  }, [cacheResults, setFirmwareData]);

  const checkSingleDevice = useCallback(async (serial: string) => {
    setIsChecking(true);
    
    try {
      const result = await checkDeviceFirmware(serial);
      
      if (result.success && result.firmware) {
        setFirmwareData(current => ({
          ...current,
          [serial]: result.firmware!
        }));
        setErrors(current => {
          const updated = { ...current };
          delete updated[serial];
          return updated;
        });
      } else if (result.error) {
        setErrors(current => ({
          ...current,
          [serial]: result.error!
        }));
      }
      
      setLastChecked(Date.now());
    } catch (error) {
      console.error(`Failed to check firmware for ${serial}:`, error);
      setErrors(current => ({
        ...current,
        [serial]: error instanceof Error ? error.message : 'Unknown error'
      }));
    } finally {
      setIsChecking(false);
    }
  }, [setFirmwareData]);

  const clearCache = useCallback(() => {
    setFirmwareData({});
    setErrors({});
    setLastChecked(0);
  }, [setFirmwareData]);

  const getFirmwareForDevice = useCallback((serial: string): FirmwareInfo | null => {
    return firmwareData?.[serial] || null;
  }, [firmwareData]);

  useEffect(() => {
    if (autoCheck && deviceSerials.length > 0) {
      checkFirmware(deviceSerials);
    }
  }, [autoCheck, deviceSerials, checkFirmware]);

  useEffect(() => {
    if (checkInterval > 0 && deviceSerials.length > 0) {
      const intervalId = setInterval(() => {
        checkFirmware(deviceSerials);
      }, checkInterval);

      return () => clearInterval(intervalId);
    }
  }, [checkInterval, deviceSerials, checkFirmware]);

  return {
    firmwareData,
    isChecking,
    lastChecked,
    errors,
    checkFirmware: () => checkFirmware(deviceSerials),
    checkSingleDevice,
    clearCache,
    getFirmwareForDevice,
  };
}
