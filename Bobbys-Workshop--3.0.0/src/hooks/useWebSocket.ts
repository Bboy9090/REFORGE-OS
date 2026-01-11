/**
 * useWebSocket - Generic WebSocket hook with auto-reconnect
 * 
 * Features:
 * - Auto-reconnect with exponential backoff
 * - Connection state management
 * - Message queue during disconnect
 * - Cleanup on unmount
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface UseWebSocketOptions {
  url: string;
  protocols?: string | string[];
  reconnect?: boolean;
  reconnectInterval?: number; // milliseconds
  maxReconnectAttempts?: number;
  onMessage?: (event: MessageEvent) => void;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}

export interface UseWebSocketReturn {
  status: WebSocketStatus;
  send: (data: string | ArrayBuffer | Blob) => void;
  lastMessage: MessageEvent | null;
  reconnect: () => void;
  disconnect: () => void;
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    url,
    protocols,
    reconnect: shouldReconnect = true,
    reconnectInterval = 1000,
    maxReconnectAttempts = 10,
    onMessage,
    onOpen,
    onClose,
    onError,
  } = options;

  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<Array<string | ArrayBuffer | Blob>>([]);
  const shouldReconnectRef = useRef(shouldReconnect);

  // Update shouldReconnect ref when prop changes
  useEffect(() => {
    shouldReconnectRef.current = shouldReconnect;
  }, [shouldReconnect]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      setStatus('connecting');
      const ws = new WebSocket(url, protocols);
      wsRef.current = ws;

      ws.onopen = (event) => {
        setStatus('connected');
        reconnectAttemptsRef.current = 0;
        
        // Send queued messages
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift();
          if (message && ws.readyState === WebSocket.OPEN) {
            ws.send(message);
          }
        }

        onOpen?.(event);
      };

      ws.onmessage = (event) => {
        setLastMessage(event);
        onMessage?.(event);
      };

      ws.onclose = (event) => {
        setStatus('disconnected');
        wsRef.current = null;
        onClose?.(event);

        // Auto-reconnect if enabled and not manually closed
        if (
          shouldReconnectRef.current &&
          reconnectAttemptsRef.current < maxReconnectAttempts &&
          event.code !== 1000 // Not a normal closure
        ) {
          const delay = Math.min(
            reconnectInterval * Math.pow(2, reconnectAttemptsRef.current),
            30000 // Max 30 seconds
          );

          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      ws.onerror = (event) => {
        setStatus('error');
        onError?.(event);
      };

    } catch (error) {
      console.error('[useWebSocket] Connection error:', error);
      setStatus('error');
    }
  }, [url, protocols, reconnectInterval, maxReconnectAttempts, onMessage, onOpen, onClose, onError]);

  const send = useCallback((data: string | ArrayBuffer | Blob) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    } else {
      // Queue message for when connection is restored
      messageQueueRef.current.push(data);
      
      // Try to reconnect if disconnected
      if (status === 'disconnected' && shouldReconnectRef.current) {
        connect();
      }
    }
  }, [status, connect]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    setStatus('disconnected');
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    shouldReconnectRef.current = true;
    connect();
  }, [disconnect, connect]);

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    status,
    send,
    lastMessage,
    reconnect,
    disconnect,
  };
}
