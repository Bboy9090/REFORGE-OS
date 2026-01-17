import { useEffect, useState } from 'react';
import { getWSUrl } from '@/lib/apiConfig';

export type CorrelationBadge = 'CORRELATED' | 'SYSTEM-CONFIRMED' | 'LIKELY' | 'UNCONFIRMED' | 'CORRELATED (WEAK)';

export type CorrelatedDevice = DeviceCorrelation;

export interface CorrelationData {
  badge: CorrelationBadge;
  matchedIds: string[];
  correlationNotes: string[];
  confidenceScore: number;
  lastUpdated: string;
  confidenceHistory: Array<{
    timestamp: string;
    score: number;
    trigger: string;
  }>;
}

export interface DeviceCorrelation {
  deviceId: string;
  id?: string;
  platform: string;
  mode: string;
  serial?: string;
  vendorId?: number;
  productId?: number;
  correlationBadge?: CorrelationBadge;
  matchedIds?: string[];
  correlationNotes?: string[];
  confidence?: number;
  timestamp?: number;
  correlation: CorrelationData;
}

interface CorrelationWebSocketMessage {
  type: 'correlation.update' | 'correlation.initial' | 'device.detected' | 'device.lost';
  deviceId?: string;
  payload?: any;
}

export function useCorrelationTracking(wsUrl: string = getWSUrl('/ws/correlation')) {
  const [devices, setDevices] = useState<Map<string, DeviceCorrelation>>(new Map());
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setConnected(true);
          setError(null);
          console.log('[Correlation] WebSocket connected');
        };

        ws.onmessage = (event) => {
          try {
            const message: CorrelationWebSocketMessage = JSON.parse(event.data);
            
            switch (message.type) {
              case 'correlation.initial':
                if (message.payload?.devices) {
                  const deviceMap = new Map<string, DeviceCorrelation>();
                  message.payload.devices.forEach((device: DeviceCorrelation) => {
                    deviceMap.set(device.deviceId, device);
                  });
                  setDevices(deviceMap);
                }
                break;

              case 'correlation.update':
                if (message.deviceId && message.payload) {
                  setDevices(prev => {
                    const updated = new Map(prev);
                    const existing = updated.get(message.deviceId!);
                    
                    if (existing) {
                      updated.set(message.deviceId!, {
                        ...existing,
                        correlation: {
                          ...existing.correlation,
                          ...message.payload,
                          lastUpdated: new Date().toISOString(),
                        }
                      });
                    }
                    
                    return updated;
                  });
                }
                break;

              case 'device.detected':
                if (message.deviceId && message.payload) {
                  setDevices(prev => {
                    const updated = new Map(prev);
                    updated.set(message.deviceId!, message.payload);
                    return updated;
                  });
                }
                break;

              case 'device.lost':
                if (message.deviceId) {
                  setDevices(prev => {
                    const updated = new Map(prev);
                    updated.delete(message.deviceId!);
                    return updated;
                  });
                }
                break;
            }
          } catch (err) {
            console.error('[Correlation] Failed to parse message:', err);
          }
        };

        ws.onerror = (event) => {
          console.error('[Correlation] WebSocket error:', event);
          setError('WebSocket connection error');
        };

        ws.onclose = () => {
          setConnected(false);
          console.log('[Correlation] WebSocket closed, reconnecting in 5s...');
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch (err) {
        console.error('[Correlation] Failed to create WebSocket:', err);
        setError('Failed to connect');
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [wsUrl]);

  const getDeviceCorrelation = (deviceId: string): DeviceCorrelation | undefined => {
    return devices.get(deviceId);
  };

  const getAllDevices = (): DeviceCorrelation[] => {
    return Array.from(devices.values());
  };

  const updateDevice = (deviceId: string, updates: Partial<DeviceCorrelation>) => {
    setDevices(prev => {
      const updated = new Map(prev);
      const existing = updated.get(deviceId);
      if (existing) {
        updated.set(deviceId, { ...existing, ...updates });
      }
      return updated;
    });
    setLastUpdate(new Date().toISOString());
  };

  const removeDevice = (deviceId: string) => {
    setDevices(prev => {
      const updated = new Map(prev);
      updated.delete(deviceId);
      return updated;
    });
  };

  const clearAllDevices = () => {
    setDevices(new Map());
  };

  const getStats = () => {
    const allDevices = getAllDevices();
    const correlatedCount = allDevices.filter(d => d.correlationBadge === 'CORRELATED' || d.correlation.badge === 'CORRELATED').length;
    const weakCorrelatedCount = allDevices.filter(d => d.correlationBadge === 'CORRELATED (WEAK)' || d.correlation.badge === 'CORRELATED (WEAK)').length;
    const systemConfirmedCount = allDevices.filter(d => d.correlationBadge === 'SYSTEM-CONFIRMED' || d.correlation.badge === 'SYSTEM-CONFIRMED').length;
    const likelyCount = allDevices.filter(d => d.correlationBadge === 'LIKELY' || d.correlation.badge === 'LIKELY').length;
    const unconfirmedCount = allDevices.filter(d => d.correlationBadge === 'UNCONFIRMED' || d.correlation.badge === 'UNCONFIRMED').length;
    
    const confidences = allDevices.map(d => d.confidence || d.correlation.confidenceScore || 0);
    const averageConfidence = confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;
    
    return {
      total: allDevices.length,
      correlated: correlatedCount,
      weakCorrelated: weakCorrelatedCount,
      systemConfirmed: systemConfirmedCount,
      likely: likelyCount,
      unconfirmed: unconfirmedCount,
      averageConfidence,
    };
  };

  const startTracking = () => {
    setIsTracking(true);
  };

  const stopTracking = () => {
    setIsTracking(false);
  };

  return {
    devices: getAllDevices(),
    getDeviceCorrelation,
    connected,
    error,
    isTracking,
    lastUpdate,
    updateDevice,
    removeDevice,
    clearAllDevices,
    getStats,
    startTracking,
    stopTracking,
  };
}
