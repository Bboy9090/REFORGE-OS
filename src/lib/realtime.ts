import { getWSUrl } from '@/lib/apiConfig';
import { isTauri, tauriListen } from '@/lib/tauriBridge';

export type MessageEventLike = { data: string };

export interface RealtimeConnection {
  readyState: number;
  onopen: null | (() => void);
  onmessage: null | ((event: MessageEventLike) => void);
  onerror: null | ((event: unknown) => void);
  onclose: null | (() => void);
  close: () => void;
  send?: (data: string) => void;
}

const CONNECTING = 0;
const OPEN = 1;
const CLOSING = 2;
const CLOSED = 3;

function createWebSocketConnection(url: string): RealtimeConnection {
  const ws = new WebSocket(url);
  const conn: RealtimeConnection = {
    readyState: ws.readyState,
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null,
    close: () => ws.close(),
    send: (data: string) => ws.send(data),
  };

  ws.onopen = () => {
    conn.readyState = ws.readyState;
    conn.onopen?.();
  };
  ws.onmessage = (event) => {
    conn.onmessage?.({ data: String(event.data) });
  };
  ws.onerror = (event) => {
    conn.onerror?.(event);
  };
  ws.onclose = () => {
    conn.readyState = ws.readyState;
    conn.onclose?.();
  };

  return conn;
}

function createTauriEventConnection<T>(eventName: string, mapPayloadToMessageData: (payload: T) => string): RealtimeConnection {
  let unlisten: (() => void) | null = null;

  const conn: RealtimeConnection = {
    readyState: CONNECTING,
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null,
    close: () => {
      conn.readyState = CLOSING;
      try {
        unlisten?.();
      } finally {
        unlisten = null;
        conn.readyState = CLOSED;
        conn.onclose?.();
      }
    },
  };

  // Attach listener async; emulate WebSocket lifecycle.
  tauriListen<T>(eventName, (payload) => {
    try {
      const data = mapPayloadToMessageData(payload);
      conn.onmessage?.({ data });
    } catch (e) {
      conn.onerror?.(e);
    }
  })
    .then((u) => {
      unlisten = u;
      conn.readyState = OPEN;
      conn.onopen?.();
    })
    .catch((e) => {
      conn.readyState = CLOSED;
      conn.onerror?.(e);
      conn.onclose?.();
    });

  return conn;
}

export function connectDeviceEvents(wsUrl?: string): RealtimeConnection {
  if (isTauri()) {
    // Rust emits event payloads shaped like the backend WS messages.
    return createTauriEventConnection('device-events', (payload) => JSON.stringify(payload));
  }
  return createWebSocketConnection(wsUrl ?? getWSUrl('/ws/device-events'));
}

export function connectFlashProgress(jobId: string): RealtimeConnection {
  if (isTauri()) {
    return createTauriEventConnection(`flash-progress:${jobId}`, (payload) => JSON.stringify(payload));
  }
  return createWebSocketConnection(getWSUrl(`/ws/flash-progress/${encodeURIComponent(jobId)}`));
}
