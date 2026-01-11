/**
 * useCorrelation - WebSocket hook for device correlation tracking
 * 
 * Connects to: ws://localhost:3001/ws/correlation
 */

import { useEffect, useState } from 'react';
import { useWebSocket, type WebSocketStatus } from './useWebSocket';

export interface CorrelationEvent {
  deviceSerial: string;
  correlation: 'CORRELATED' | 'LIKELY' | 'UNKNOWN';
  confidence: number;
  matchedDevices?: string[];
  timestamp: string;
}

export interface UseCorrelationReturn {
  status: WebSocketStatus;
  correlations: Map<string, CorrelationEvent>;
  getCorrelation: (serial: string) => CorrelationEvent | null;
  reconnect: () => void;
}

export function useCorrelation(): UseCorrelationReturn {
  const [correlations, setCorrelations] = useState<Map<string, CorrelationEvent>>(new Map());

  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
  const { status, lastMessage, reconnect } = useWebSocket({
    url: `${wsUrl}/ws/correlation`,
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle envelope format
        const correlationData = data.ok !== false ? (data.data || data) : null;
        
        if (correlationData && correlationData.deviceSerial) {
          const correlationEvent: CorrelationEvent = {
            deviceSerial: correlationData.deviceSerial,
            correlation: correlationData.correlation || 'UNKNOWN',
            confidence: correlationData.confidence || 0,
            matchedDevices: correlationData.matchedDevices,
            timestamp: correlationData.timestamp || new Date().toISOString(),
          };

          setCorrelations(prev => {
            const next = new Map(prev);
            next.set(correlationEvent.deviceSerial, correlationEvent);
            return next;
          });
        }
      } catch (error) {
        console.error('[useCorrelation] Parse error:', error);
      }
    },
  });

  const getCorrelation = (serial: string): CorrelationEvent | null => {
    return correlations.get(serial) || null;
  };

  return {
    status,
    correlations,
    getCorrelation,
    reconnect,
  };
}
