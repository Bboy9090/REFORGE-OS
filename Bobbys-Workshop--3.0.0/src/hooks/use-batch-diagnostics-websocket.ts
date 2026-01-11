import { useEffect, useRef, useState, useCallback } from 'react';
import { getWSUrl } from '@/lib/apiConfig';

export interface BatchDiagnosticProgressEvent {
  type: 'progress' | 'complete' | 'error' | 'device_start' | 'device_complete' | 'operation_start' | 'operation_complete' | 'batch_start' | 'batch_complete';
  batchId: string;
  deviceId?: string;
  operation?: string;
  progress?: number;
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  data?: any;
  error?: string;
  timestamp: number;
  metadata?: {
    totalDevices?: number;
    completedDevices?: number;
    failedDevices?: number;
    currentOperation?: string;
    estimatedTimeRemaining?: number;
  };
}

export interface BatchDiagnosticConfig {
  wsUrl?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

const DEFAULT_CONFIG: Required<BatchDiagnosticConfig> = {
  wsUrl: getWSUrl('/ws/batch-diagnostics'),
  reconnectInterval: 3000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
};

export function useBatchDiagnosticsWebSocket(config?: BatchDiagnosticConfig) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [lastEvent, setLastEvent] = useState<BatchDiagnosticProgressEvent | null>(null);
  const [events, setEvents] = useState<BatchDiagnosticProgressEvent[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const eventHandlersRef = useRef<Map<string, ((event: BatchDiagnosticProgressEvent) => void)[]>>(new Map());

  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const clearHeartbeatInterval = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  const startHeartbeat = useCallback(() => {
    clearHeartbeatInterval();
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, fullConfig.heartbeatInterval);
  }, [fullConfig.heartbeatInterval]);

  const notifyEventHandlers = useCallback((event: BatchDiagnosticProgressEvent) => {
    const handlers = eventHandlersRef.current.get(event.type) || [];
    handlers.forEach(handler => handler(event));
    
    const allHandlers = eventHandlersRef.current.get('*') || [];
    allHandlers.forEach(handler => handler(event));
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    setConnectionStatus('connecting');
    clearReconnectTimeout();

    try {
      const ws = new WebSocket(fullConfig.wsUrl);

      ws.onopen = () => {
        console.log('[BatchDiagnosticsWS] Connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'pong') {
            return;
          }

          const progressEvent: BatchDiagnosticProgressEvent = {
            ...data,
            timestamp: data.timestamp || Date.now(),
          };

          setLastEvent(progressEvent);
          setEvents(prev => [...prev.slice(-99), progressEvent]);
          notifyEventHandlers(progressEvent);
        } catch (error) {
          console.error('[BatchDiagnosticsWS] Failed to parse message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[BatchDiagnosticsWS] Error:', error);
        setConnectionStatus('error');
      };

      ws.onclose = () => {
        console.log('[BatchDiagnosticsWS] Disconnected');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        clearHeartbeatInterval();
        wsRef.current = null;

        if (reconnectAttemptsRef.current < fullConfig.maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`[BatchDiagnosticsWS] Reconnecting... (attempt ${reconnectAttemptsRef.current}/${fullConfig.maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, fullConfig.reconnectInterval);
        } else {
          console.error('[BatchDiagnosticsWS] Max reconnect attempts reached');
          setConnectionStatus('error');
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[BatchDiagnosticsWS] Failed to create WebSocket:', error);
      setConnectionStatus('error');
    }
  }, [fullConfig.wsUrl, fullConfig.reconnectInterval, fullConfig.maxReconnectAttempts, startHeartbeat, notifyEventHandlers]);

  const disconnect = useCallback(() => {
    clearReconnectTimeout();
    clearHeartbeatInterval();
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
    reconnectAttemptsRef.current = 0;
  }, []);

  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('[BatchDiagnosticsWS] Cannot send message - not connected');
    return false;
  }, []);

  const subscribeToBatch = useCallback((batchId: string) => {
    send({
      type: 'subscribe',
      batchId,
    });
  }, [send]);

  const unsubscribeFromBatch = useCallback((batchId: string) => {
    send({
      type: 'unsubscribe',
      batchId,
    });
  }, [send]);

  const startBatch = useCallback((batchId: string, config: any) => {
    send({
      type: 'start_batch',
      batchId,
      config,
    });
  }, [send]);

  const pauseBatch = useCallback((batchId: string) => {
    send({
      type: 'pause_batch',
      batchId,
    });
  }, [send]);

  const resumeBatch = useCallback((batchId: string) => {
    send({
      type: 'resume_batch',
      batchId,
    });
  }, [send]);

  const stopBatch = useCallback((batchId: string) => {
    send({
      type: 'stop_batch',
      batchId,
    });
  }, [send]);

  const on = useCallback((eventType: string, handler: (event: BatchDiagnosticProgressEvent) => void) => {
    const handlers = eventHandlersRef.current.get(eventType) || [];
    handlers.push(handler);
    eventHandlersRef.current.set(eventType, handlers);

    return () => {
      const currentHandlers = eventHandlersRef.current.get(eventType) || [];
      const index = currentHandlers.indexOf(handler);
      if (index > -1) {
        currentHandlers.splice(index, 1);
        eventHandlersRef.current.set(eventType, currentHandlers);
      }
    };
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setLastEvent(null);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionStatus,
    lastEvent,
    events,
    connect,
    disconnect,
    send,
    subscribeToBatch,
    unsubscribeFromBatch,
    startBatch,
    pauseBatch,
    resumeBatch,
    stopBatch,
    on,
    clearEvents,
  };
}
