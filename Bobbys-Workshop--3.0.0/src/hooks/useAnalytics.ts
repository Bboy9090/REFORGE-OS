/**
 * useAnalytics - WebSocket hook for real-time analytics streaming
 * 
 * Connects to: ws://localhost:3001/ws/analytics
 */

import { useEffect, useState } from 'react';
import { useWebSocket, type WebSocketStatus } from './useWebSocket';

export interface AnalyticsEvent {
  type: 'metric' | 'performance' | 'diagnostic';
  deviceSerial?: string;
  metric: string;
  value: number | string;
  unit?: string;
  timestamp: string;
}

export interface UseAnalyticsReturn {
  status: WebSocketStatus;
  metrics: AnalyticsEvent[];
  getLatestMetric: (deviceSerial: string, metric: string) => AnalyticsEvent | null;
  reconnect: () => void;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [metrics, setMetrics] = useState<AnalyticsEvent[]>([]);

  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
  const { status, lastMessage, reconnect } = useWebSocket({
    url: `${wsUrl}/ws/analytics`,
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle envelope format
        const analyticsData = data.ok !== false ? (data.data || data) : null;
        
        if (analyticsData && analyticsData.metric) {
          const analyticsEvent: AnalyticsEvent = {
            type: analyticsData.type || 'metric',
            deviceSerial: analyticsData.deviceSerial,
            metric: analyticsData.metric,
            value: analyticsData.value,
            unit: analyticsData.unit,
            timestamp: analyticsData.timestamp || new Date().toISOString(),
          };

          setMetrics(prev => {
            // Keep last 500 metrics
            const next = [analyticsEvent, ...prev].slice(0, 500);
            return next;
          });
        }
      } catch (error) {
        console.error('[useAnalytics] Parse error:', error);
      }
    },
  });

  const getLatestMetric = (deviceSerial: string, metric: string): AnalyticsEvent | null => {
    return metrics.find(
      m => m.deviceSerial === deviceSerial && m.metric === metric
    ) || null;
  };

  return {
    status,
    metrics,
    getLatestMetric,
    reconnect,
  };
}
