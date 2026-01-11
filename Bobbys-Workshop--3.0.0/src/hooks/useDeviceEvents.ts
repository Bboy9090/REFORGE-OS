/**
 * useDeviceEvents - WebSocket hook for device connection/disconnection events
 * 
 * Connects to: ws://localhost:3001/ws/device-events
 */

import { useEffect, useState } from 'react';
import { useWebSocket, type WebSocketStatus } from './useWebSocket';

export interface DeviceEvent {
  type: 'connected' | 'disconnected' | 'state_changed';
  device: {
    serial: string;
    brand?: string;
    model?: string;
    state: string;
    platform?: string;
  };
  timestamp: string;
}

export interface UseDeviceEventsReturn {
  status: WebSocketStatus;
  events: DeviceEvent[];
  lastEvent: DeviceEvent | null;
  reconnect: () => void;
}

export function useDeviceEvents(): UseDeviceEventsReturn {
  const [events, setEvents] = useState<DeviceEvent[]>([]);
  const [lastEvent, setLastEvent] = useState<DeviceEvent | null>(null);

  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
  const { status, lastMessage, reconnect } = useWebSocket({
    url: `${wsUrl}/ws/device-events`,
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle envelope format
        const eventData = data.ok !== false ? (data.data || data) : null;
        
        if (eventData && eventData.type) {
          const deviceEvent: DeviceEvent = {
            type: eventData.type,
            device: eventData.device,
            timestamp: eventData.timestamp || new Date().toISOString(),
          };

          setLastEvent(deviceEvent);
          setEvents(prev => [deviceEvent, ...prev].slice(0, 100)); // Keep last 100
        }
      } catch (error) {
        console.error('[useDeviceEvents] Parse error:', error);
      }
    },
  });

  return {
    status,
    events,
    lastEvent,
    reconnect,
  };
}
