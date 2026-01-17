import { useState, useEffect, useCallback, useRef } from 'react';
import { useCorrelationTracking, type CorrelatedDevice } from './use-correlation-tracking';
import { toast } from 'sonner';

export interface CorrelationWebSocketMessage {
  type: 'correlation_update' | 'device_connected' | 'device_disconnected' | 'batch_update' | 'ping' | 'pong';
  deviceId?: string;
  device?: Partial<CorrelatedDevice>;
  devices?: Partial<CorrelatedDevice>[];
  timestamp: number;
}

export interface CorrelationWebSocketConfig {
  url: string;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  enableNotifications?: boolean;
  autoConnect?: boolean;
}

export function useCorrelationWebSocket(config: CorrelationWebSocketConfig) {
  const {
    url,
    reconnectDelay = 3000,
    maxReconnectAttempts = 5,
    enableNotifications = true,
    autoConnect = true,
  } = config;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { updateDevice, removeDevice } = useCorrelationTracking();

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const clearPingInterval = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  const handleMessage = useCallback((message: CorrelationWebSocketMessage) => {
    setLastMessageTime(Date.now());

    switch (message.type) {
      case 'correlation_update':
        if (message.deviceId && message.device) {
          updateDevice(message.deviceId, message.device);
          if (enableNotifications && message.device.correlationBadge) {
            const badge = message.device.correlationBadge;
            if (badge === 'CORRELATED') {
              toast.success(`Device ${message.deviceId} correlated`, {
                description: `Matched IDs: ${message.device.matchedIds?.join(', ') || 'N/A'}`,
              });
            } else if (badge === 'UNCONFIRMED') {
              toast.warning(`Device ${message.deviceId} unconfirmed`, {
                description: 'Unable to establish correlation',
              });
            }
          }
        }
        break;

      case 'device_connected':
        if (message.deviceId && message.device) {
          updateDevice(message.deviceId, message.device);
          if (enableNotifications) {
            toast.info(`Device connected: ${message.deviceId}`, {
              description: `Platform: ${message.device.platform || 'Unknown'}`,
            });
          }
        }
        break;

      case 'device_disconnected':
        if (message.deviceId) {
          removeDevice(message.deviceId);
          if (enableNotifications) {
            toast.info(`Device disconnected: ${message.deviceId}`);
          }
        }
        break;

      case 'batch_update':
        if (message.devices) {
          message.devices.forEach(device => {
            if (device.id) {
              updateDevice(device.id, device);
            }
          });
          if (enableNotifications) {
            toast.success('Batch update received', {
              description: `${message.devices.length} devices updated`,
            });
          }
        }
        break;

      case 'pong':
        break;

      default:
        console.warn('Unknown WebSocket message type:', message.type);
    }
  }, [updateDevice, removeDevice, enableNotifications]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    clearReconnectTimeout();
    setConnectionStatus('connecting');

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        setReconnectAttempts(0);
        
        if (enableNotifications) {
          toast.success('Connected to correlation server');
        }

        clearPingInterval();
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const message: CorrelationWebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };

      ws.onclose = () => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        clearPingInterval();

        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, reconnectDelay);
        } else {
          if (enableNotifications) {
            toast.error('Connection lost', {
              description: 'Max reconnection attempts reached',
            });
          }
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnectionStatus('error');
    }
  }, [url, reconnectAttempts, maxReconnectAttempts, reconnectDelay, enableNotifications, handleMessage, clearReconnectTimeout, clearPingInterval]);

  const disconnect = useCallback(() => {
    clearReconnectTimeout();
    clearPingInterval();
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setReconnectAttempts(0);
  }, [clearReconnectTimeout, clearPingInterval]);

  const send = useCallback((message: Partial<CorrelationWebSocketMessage>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        ...message,
        timestamp: Date.now(),
      }));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    connectionStatus,
    reconnectAttempts,
    lastMessageTime,
    connect,
    disconnect,
    send,
  };
}
