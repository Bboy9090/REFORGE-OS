import { useState, useEffect, useCallback, useRef } from 'react';
import { flashAPI, type FlashDevice, type FlashJobConfig, type FlashOperationStatus, type FlashHistoryEntry } from '@/lib/flash-api';
import { toast } from 'sonner';

export interface UseFlashOperationsReturn {
  devices: FlashDevice[];
  activeOperations: FlashOperationStatus[];
  flashHistory: FlashHistoryEntry[];
  isScanning: boolean;
  isLoading: boolean;
  error: string | null;
  scanDevices: () => Promise<void>;
  startFlash: (config: FlashJobConfig) => Promise<string | null>;
  pauseFlash: (jobId: string) => Promise<void>;
  resumeFlash: (jobId: string) => Promise<void>;
  cancelFlash: (jobId: string) => Promise<void>;
  getDeviceInfo: (serial: string) => Promise<any>;
  getDevicePartitions: (serial: string) => Promise<string[]>;
  validateImage: (filePath: string) => Promise<{ valid: boolean; type?: string; size?: number; error?: string }>;
  refreshHistory: () => Promise<void>;
  refreshActiveOperations: () => Promise<void>;
}

export function useFlashOperations(): UseFlashOperationsReturn {
  const [devices, setDevices] = useState<FlashDevice[]>([]);
  const [activeOperations, setActiveOperations] = useState<FlashOperationStatus[]>([]);
  const [flashHistory, setFlashHistory] = useState<FlashHistoryEntry[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsConnections = useRef<Map<string, WebSocket>>(new Map());
  const refreshInterval = useRef<NodeJS.Timeout | undefined>(undefined);

  const scanDevices = useCallback(async () => {
    setIsScanning(true);
    setError(null);
    
    try {
      const scannedDevices = await flashAPI.scanDevices();
      setDevices(scannedDevices);
      
      if (scannedDevices.length === 0) {
        toast.info('No devices found', {
          description: 'Connect a device in bootloader/recovery mode'
        });
      } else {
        toast.success(`Found ${scannedDevices.length} device(s)`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to scan devices';
      setError(errorMsg);
      toast.error('Device scan failed', {
        description: errorMsg
      });
      setDevices([]);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const startFlash = useCallback(async (config: FlashJobConfig): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await flashAPI.startFlash(config);
      
      toast.success('Flash operation started', {
        description: `Job ID: ${response.jobId}`
      });

      const ws = flashAPI.connectProgressWebSocket(
        response.jobId,
        (data) => {
          if (data.type === 'progress') {
            setActiveOperations((prev) => {
              const existing = prev.find(op => op.jobId === response.jobId);
              if (existing) {
                return prev.map(op => 
                  op.jobId === response.jobId 
                    ? { ...op, ...data.status }
                    : op
                );
              } else {
                return [...prev, data.status];
              }
            });
          } else if (data.type === 'completed') {
            toast.success('Flash completed', {
              description: `Device: ${config.deviceSerial}`
            });
            
            setActiveOperations((prev) => 
              prev.filter(op => op.jobId !== response.jobId)
            );
            
            refreshHistory();
            
            const ws = wsConnections.current.get(response.jobId);
            if (ws) {
              ws.close();
              wsConnections.current.delete(response.jobId);
            }
          } else if (data.type === 'failed') {
            toast.error('Flash failed', {
              description: data.error || 'Unknown error'
            });
            
            setActiveOperations((prev) => 
              prev.filter(op => op.jobId !== response.jobId)
            );
            
            const ws = wsConnections.current.get(response.jobId);
            if (ws) {
              ws.close();
              wsConnections.current.delete(response.jobId);
            }
          }
        },
        (error) => {
          console.error('[useFlashOperations] WebSocket error:', error);
          toast.error('Connection lost', {
            description: 'Progress updates unavailable'
          });
        }
      );

      wsConnections.current.set(response.jobId, ws);

      await refreshActiveOperations();

      return response.jobId;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start flash';
      setError(errorMsg);
      toast.error('Flash failed to start', {
        description: errorMsg
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pauseFlash = useCallback(async (jobId: string) => {
    try {
      await flashAPI.pauseFlash(jobId);
      toast.success('Flash operation paused');
      await refreshActiveOperations();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to pause flash';
      toast.error('Pause failed', {
        description: errorMsg
      });
      throw err;
    }
  }, []);

  const resumeFlash = useCallback(async (jobId: string) => {
    try {
      await flashAPI.resumeFlash(jobId);
      toast.success('Flash operation resumed');
      await refreshActiveOperations();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to resume flash';
      toast.error('Resume failed', {
        description: errorMsg
      });
      throw err;
    }
  }, []);

  const cancelFlash = useCallback(async (jobId: string) => {
    try {
      await flashAPI.cancelFlash(jobId);
      toast.success('Flash operation cancelled');
      
      setActiveOperations((prev) => 
        prev.filter(op => op.jobId !== jobId)
      );
      
      const ws = wsConnections.current.get(jobId);
      if (ws) {
        ws.close();
        wsConnections.current.delete(jobId);
      }
      
      await refreshActiveOperations();
      await refreshHistory();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to cancel flash';
      toast.error('Cancel failed', {
        description: errorMsg
      });
      throw err;
    }
  }, []);

  const getDeviceInfo = useCallback(async (serial: string) => {
    try {
      return await flashAPI.getDeviceInfo(serial);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get device info';
      toast.error('Device info unavailable', {
        description: errorMsg
      });
      throw err;
    }
  }, []);

  const getDevicePartitions = useCallback(async (serial: string): Promise<string[]> => {
    try {
      return await flashAPI.getDevicePartitions(serial);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get partitions';
      toast.error('Partition list unavailable', {
        description: errorMsg
      });
      return [];
    }
  }, []);

  const validateImage = useCallback(async (filePath: string) => {
    try {
      return await flashAPI.validateImage(filePath);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to validate image';
      toast.error('Image validation failed', {
        description: errorMsg
      });
      return { valid: false, error: errorMsg };
    }
  }, []);

  const refreshHistory = async () => {
    try {
      const history = await flashAPI.getFlashHistory(50);
      setFlashHistory(history);
    } catch (err) {
      console.error('[useFlashOperations] Failed to refresh history:', err);
    }
  };

  const refreshActiveOperations = async () => {
    try {
      const operations = await flashAPI.getActiveOperations();
      setActiveOperations(operations);
    } catch (err) {
      console.error('[useFlashOperations] Failed to refresh active operations:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await scanDevices();
      await refreshHistory();
      await refreshActiveOperations();
    };

    init();

    refreshInterval.current = setInterval(() => {
      refreshActiveOperations();
    }, 5000);

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }

      wsConnections.current.forEach((ws) => {
        ws.close();
      });
      wsConnections.current.clear();
    };
  }, []);

  return {
    devices,
    activeOperations,
    flashHistory,
    isScanning,
    isLoading,
    error,
    scanDevices,
    startFlash,
    pauseFlash,
    resumeFlash,
    cancelFlash,
    getDeviceInfo,
    getDevicePartitions,
    validateImage,
    refreshHistory,
    refreshActiveOperations,
  };
}
