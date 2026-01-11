import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DeviceMobile, 
  Plug,
  PlugsConnected,
  TrashSimple,
  Circle,
  ArrowsClockwise
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { getWSUrl } from '@/lib/apiConfig';

interface HotplugEvent {
  type: 'connected' | 'disconnected';
  deviceId: string;
  timestamp: number;
  vendorId?: string;
  productId?: string;
}

// Server exposes device events at /ws/device-events
const WS_URL = getWSUrl('/ws/device-events');

export function PandoraHotplugPanel() {
  const [events, setEvents] = useState<HotplugEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(true);

  const connectedDevices = events.filter(e => e.type === 'connected').length;
  const disconnectedDevices = events.filter(e => e.type === 'disconnected').length;

  const connectWebSocket = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);
      
      ws.onopen = () => {
        setConnected(true);
        setReconnecting(false);
        toast.success('Connected to hotplug monitor');
      };

      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);

          // Normalize server payloads (server uses device_uid + type).
          const event: HotplugEvent = {
            type: data.type,
            deviceId: data.device_uid || data.deviceId || 'unknown',
            timestamp: data.timestamp || Date.now(),
            vendorId: data.vendorId ? String(data.vendorId) : undefined,
            productId: data.productId ? String(data.productId) : undefined,
          };
          
          setEvents(prev => [event, ...prev].slice(0, 100));
          
          if (data.type === 'connected') {
            toast.success(`Device connected: ${data.deviceId}`);
          } else if (data.type === 'disconnected') {
            toast.info(`Device disconnected: ${data.deviceId}`);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      };

      ws.onclose = () => {
        setConnected(false);
        setReconnecting(true);
        
        reconnectTimeoutRef.current = window.setTimeout(() => {
          if (shouldReconnectRef.current) {
            connectWebSocket();
          }
        }, 3000);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
      setConnected(false);
      setReconnecting(true);
      
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connectWebSocket();
      }, 3000);
    }
  }, []);

  useEffect(() => {
    shouldReconnectRef.current = true;
    connectWebSocket();

    return () => {
      shouldReconnectRef.current = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  const reconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    connectWebSocket();
  };

  const clearAll = () => {
    setEvents([]);
    toast.info('Event history cleared');
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DeviceMobile className="w-5 h-5 text-primary" weight="duotone" />
                Live Device Hotplug Monitor
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                Real-time USB device connection and disconnection events
                {connected && (
                  <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-500/30 text-xs">
                    <Circle size={8} weight="fill" className="mr-1 animate-pulse" />
                    Connected
                  </Badge>
                )}
                {reconnecting && (
                  <Badge className="bg-amber-600/20 text-amber-300 border-amber-500/30 text-xs">
                    Reconnecting...
                  </Badge>
                )}
                {!connected && !reconnecting && (
                  <Badge className="bg-rose-600/20 text-rose-300 border-rose-500/30 text-xs">
                    Disconnected
                  </Badge>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={reconnect}
                disabled={connected}
              >
                <ArrowsClockwise className="w-4 h-4" />
                Reconnect
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={clearAll}
                disabled={events.length === 0}
              >
                <TrashSimple className="w-4 h-4" />
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="border-primary/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Plug className="w-8 h-8 text-primary" weight="duotone" />
                  <div>
                    <div className="text-2xl font-bold">{events.length}</div>
                    <div className="text-xs text-muted-foreground">Total Events</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <PlugsConnected className="w-8 h-8 text-emerald-400" weight="duotone" />
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">{connectedDevices}</div>
                    <div className="text-xs text-muted-foreground">Connected</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-rose-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Plug className="w-8 h-8 text-rose-400" weight="duotone" />
                  <div>
                    <div className="text-2xl font-bold text-rose-400">{disconnectedDevices}</div>
                    <div className="text-xs text-muted-foreground">Disconnected</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm">Event Stream</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {events.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <DeviceMobile className="w-12 h-12 mx-auto mb-3 opacity-50" weight="duotone" />
                    <p className="font-medium">No events recorded</p>
                    <p className="text-sm mt-1">
                      {connected 
                        ? 'Waiting for device connections...' 
                        : 'Connect to WebSocket to monitor devices'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {events.map((event, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          event.type === 'connected'
                            ? 'border-l-4 border-l-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10'
                            : 'border-l-4 border-l-rose-500 bg-rose-500/5 hover:bg-rose-500/10'
                        }`}
                      >
                        <div className={event.type === 'connected' ? 'text-emerald-400' : 'text-rose-400'}>
                          <Plug className="w-5 h-5" weight="duotone" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{event.deviceId}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {event.type === 'connected' ? 'Device connected' : 'Device disconnected'}
                            {(event.vendorId || event.productId) && (
                              <span className="ml-2 font-mono">
                                {event.vendorId && `VID: ${event.vendorId}`}
                                {event.productId && ` PID: ${event.productId}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant={event.type === 'connected' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {event.type === 'connected' ? 'CONNECTED' : 'DISCONNECTED'}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {!connected && (
            <Card className="mt-4 border-amber-500/30 bg-amber-600/5">
              <CardContent className="pt-4">
                <div className="text-xs text-amber-300/80">
                  <p className="font-semibold text-amber-300 mb-2">WebSocket Connection Required</p>
                  <p>The hotplug monitor requires a WebSocket connection to <code className="bg-black/20 px-1 rounded">{WS_URL}</code></p>
                  <p className="mt-2">Ensure the Pandora backend server is running and click "Reconnect" to establish the connection.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
