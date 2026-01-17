import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CorrelationBadgeDisplay } from './CorrelationBadgeDisplay';
import type { CorrelationBadge } from '@/types/correlation';
import {
  Broadcast,
  CheckCircle,
  XCircle,
  PlugsConnected,
  Plug,
  ArrowsClockwise,
  Trash,
  DeviceMobile,
  Info,
} from '@phosphor-icons/react';
import { useDeviceHotplug, DeviceHotplugEvent } from '@/hooks/use-device-hotplug';
import { formatDistanceToNow } from 'date-fns';

function getEventIcon(type: 'connected' | 'disconnected') {
  if (type === 'connected') {
    return <PlugsConnected className="w-4 h-4 text-emerald-400" weight="fill" />;
  }
  return <Plug className="w-4 h-4 text-rose-400" weight="fill" />;
}

function getEventBadgeClass(type: 'connected' | 'disconnected') {
  if (type === 'connected') {
    return 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30';
  }
  return 'bg-rose-600/20 text-rose-300 border-rose-500/30';
}

function getPlatformBadgeClass(platform: string) {
  switch (platform.toLowerCase()) {
    case 'ios':
      return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
    case 'android':
      return 'bg-green-600/20 text-green-300 border-green-500/30';
    default:
      return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
  }
}

function getConfidenceBadge(confidence: number) {
  if (confidence >= 0.90) {
    return (
      <Badge variant="outline" className="bg-emerald-600/20 text-emerald-300 border-emerald-500/30">
        {(confidence * 100).toFixed(0)}%
      </Badge>
    );
  } else if (confidence >= 0.75) {
    return (
      <Badge variant="outline" className="bg-amber-600/20 text-amber-300 border-amber-500/30">
        {(confidence * 100).toFixed(0)}%
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-rose-600/20 text-rose-300 border-rose-500/30">
      {(confidence * 100).toFixed(0)}%
    </Badge>
  );
}

function deriveCorrelationBadge(event: DeviceHotplugEvent): CorrelationBadge {
  if (event.correlation_badge) {
    return event.correlation_badge;
  }
  
  const hasMatchedIds = event.matched_tool_ids && event.matched_tool_ids.length > 0;
  const mode = event.mode.toLowerCase();
  const confidence = event.confidence;
  
  if (hasMatchedIds) {
    if (mode.includes('confirmed') && confidence >= 0.90) {
      return 'CORRELATED';
    }
    return 'CORRELATED (WEAK)';
  }
  
  if (mode.includes('confirmed') && confidence >= 0.90) {
    return 'SYSTEM-CONFIRMED';
  }
  
  if (mode.includes('likely')) {
    return 'LIKELY';
  }
  
  return 'UNCONFIRMED';
}

interface HotplugEventItemProps {
  event: DeviceHotplugEvent;
}

function HotplugEventItem({ event }: HotplugEventItemProps) {
  const timeAgo = formatDistanceToNow(new Date(event.timestamp), { addSuffix: true });
  const correlationBadge = deriveCorrelationBadge(event);

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/10 hover:bg-muted/20 transition-colors">
      <div className="mt-0.5">{getEventIcon(event.type)}</div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge variant="outline" className={getEventBadgeClass(event.type)}>
            {event.type}
          </Badge>
          <Badge variant="outline" className={getPlatformBadgeClass(event.platform_hint)}>
            {event.platform_hint}
          </Badge>
          {getConfidenceBadge(event.confidence)}
        </div>
        
        <div className="mb-2">
          <CorrelationBadgeDisplay 
            badge={correlationBadge}
            matchedIds={event.matched_tool_ids}
            className="text-xs"
          />
        </div>
        
        <div className="text-sm font-medium text-foreground mb-1 truncate">
          {event.display_name || event.device_uid}
        </div>
        
        <div className="text-xs text-muted-foreground font-mono truncate">
          {event.device_uid}
        </div>
        
        <div className="text-xs text-muted-foreground mt-1">
          {event.mode.replace(/_/g, ' ')} • {timeAgo}
        </div>
        
        {event.correlation_notes && event.correlation_notes.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
              {event.correlation_notes.map((note, idx) => (
                <div key={idx} className="flex items-start gap-1">
                  <span className="text-accent">•</span>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function LiveDeviceHotplugMonitor() {
  const {
    isConnected,
    events,
    stats,
    connect,
    disconnect,
    clearEvents,
    resetStats,
  } = useDeviceHotplug({
    autoConnect: true,
    showToasts: true,
  });

  return (
    <div className="grid gap-6">
      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Broadcast className="w-5 h-5 text-primary" weight="duotone" />
              Live Device Hotplug Monitor
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time USB device connection and disconnection events
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Badge variant="outline" className="bg-emerald-600/20 text-emerald-300 border-emerald-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" weight="fill" />
                  Connected
                </Badge>
                <Button onClick={disconnect} variant="outline" size="sm">
                  Disconnect
                </Button>
              </>
            ) : (
              <>
                <Badge variant="outline" className="bg-rose-600/20 text-rose-300 border-rose-500/30">
                  <XCircle className="w-3 h-3 mr-1" weight="fill" />
                  Disconnected
                </Badge>
                <Button onClick={connect} variant="outline" size="sm">
                  <ArrowsClockwise className="w-4 h-4" />
                  Reconnect
                </Button>
              </>
            )}
          </div>
        </div>

        <Alert className="mb-4 border-blue-500/30 bg-blue-600/10">
          <Info className="w-4 h-4 text-blue-400" />
          <AlertDescription className="text-blue-300">
            This monitor uses WebSocket connections to receive real-time device hotplug events.
            Backend server must be running on <code className="font-mono text-xs">localhost:3001</code>.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-border bg-muted/20">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Connected
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {stats.totalConnections}
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border bg-muted/20">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Disconnected
            </div>
            <div className="text-2xl font-bold font-mono text-rose-400">
              {stats.totalDisconnections}
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border bg-muted/20">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Current Devices
            </div>
            <div className="text-2xl font-bold font-mono text-primary">
              {stats.currentDevices}
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border bg-muted/20">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Total Events
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {events.length}
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
            <DeviceMobile className="w-5 h-5 text-primary" weight="duotone" />
            Event Stream
            <Badge variant="outline" className="ml-2">
              {events.length}
            </Badge>
          </h3>
          
          <Button
            onClick={() => {
              clearEvents();
              resetStats();
            }}
            disabled={events.length === 0}
            variant="outline"
            size="sm"
          >
            <Trash className="w-4 h-4" />
            Clear All
          </Button>
        </div>

        {events.length === 0 ? (
          <div className="py-12 text-center">
            <DeviceMobile className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" weight="duotone" />
            <p className="text-muted-foreground">
              {isConnected 
                ? 'Waiting for device events...' 
                : 'Connect to WebSocket to monitor device events'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Connect or disconnect USB devices to see events appear here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-2">
              {events.map((event, idx) => (
                <HotplugEventItem key={`${event.device_uid}-${event.timestamp}-${idx}`} event={event} />
              ))}
            </div>
          </ScrollArea>
        )}
      </Card>
    </div>
  );
}
