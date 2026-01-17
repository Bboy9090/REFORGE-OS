import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { CorrelationBadgeDisplay } from './CorrelationBadgeDisplay';
import type { CorrelationBadge } from '@/types/correlation';
import { 
  ChartBar, 
  Clock, 
  Usb, 
  DeviceMobile,
  Cpu,
  HardDrive,
  ArrowClockwise,
  TrendUp,
  Circle,
  Plug,
  PlugsConnected
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { getUSBVendorName, getUSBClassName } from '@/lib/deviceDetection';

interface ConnectionEvent {
  id: string;
  type: 'connect' | 'disconnect';
  timestamp: number;
  duration?: number;
  deviceInfo: {
    vendorId: number;
    productId: number;
    productName?: string;
    manufacturerName?: string;
    serialNumber?: string;
    deviceClass?: number;
  };
  matchedToolIds?: string[];
  correlationBadge?: CorrelationBadge;
  platformHint?: string;
  mode?: string;
  confidence?: number;
}

interface DeviceSessionStats {
  deviceId: string;
  vendorId: number;
  productId: number;
  productName?: string;
  manufacturerName?: string;
  totalConnections: number;
  totalDuration: number;
  lastConnected: number;
  firstConnected: number;
  averageSessionDuration: number;
  matchedToolIds?: string[];
  correlationBadge?: CorrelationBadge;
  lastMode?: string;
  lastConfidence?: number;
}

export function DeviceAnalyticsDashboard() {
  const [connectionHistory, setConnectionHistory] = useKV<ConnectionEvent[]>('device-connection-history', []);
  const [activeConnections, setActiveConnections] = useState<Map<string, ConnectionEvent>>(new Map());
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const deviceStats: DeviceSessionStats[] = useMemo(() => {
    const statsMap = new Map<string, DeviceSessionStats>();
    
    const history = connectionHistory || [];
    
    history.forEach(event => {
      const deviceKey = `${event.deviceInfo.vendorId}-${event.deviceInfo.productId}`;
      
      if (!statsMap.has(deviceKey)) {
        statsMap.set(deviceKey, {
          deviceId: deviceKey,
          vendorId: event.deviceInfo.vendorId,
          productId: event.deviceInfo.productId,
          productName: event.deviceInfo.productName,
          manufacturerName: event.deviceInfo.manufacturerName,
          totalConnections: 0,
          totalDuration: 0,
          lastConnected: event.timestamp,
          firstConnected: event.timestamp,
          averageSessionDuration: 0,
          matchedToolIds: event.matchedToolIds,
          correlationBadge: event.correlationBadge,
          lastMode: event.mode,
          lastConfidence: event.confidence,
        });
      }
      
      const stats = statsMap.get(deviceKey)!;
      
      if (event.type === 'connect') {
        stats.totalConnections++;
        stats.lastConnected = Math.max(stats.lastConnected, event.timestamp);
        stats.firstConnected = Math.min(stats.firstConnected, event.timestamp);
        
        if (event.timestamp === stats.lastConnected) {
          stats.matchedToolIds = event.matchedToolIds;
          stats.correlationBadge = event.correlationBadge;
          stats.lastMode = event.mode;
          stats.lastConfidence = event.confidence;
        }
      }
      
      if (event.duration) {
        stats.totalDuration += event.duration;
      }
    });
    
    statsMap.forEach(stats => {
      if (stats.totalConnections > 0) {
        stats.averageSessionDuration = stats.totalDuration / stats.totalConnections;
      }
    });
    
    return Array.from(statsMap.values()).sort((a, b) => b.lastConnected - a.lastConnected);
  }, [connectionHistory, refreshKey]);

  const analytics = useMemo(() => {
    const history = connectionHistory || [];
    const totalConnections = history.filter(e => e.type === 'connect').length;
    const totalDisconnections = history.filter(e => e.type === 'disconnect').length;
    const uniqueDevices = new Set(history.map(e => `${e.deviceInfo.vendorId}-${e.deviceInfo.productId}`)).size;
    
    const now = Date.now();
    const last24h = history.filter(e => now - e.timestamp < 24 * 60 * 60 * 1000);
    const last7d = history.filter(e => now - e.timestamp < 7 * 24 * 60 * 60 * 1000);
    
    const totalDuration = history
      .filter(e => e.duration)
      .reduce((sum, e) => sum + (e.duration || 0), 0);
    
    const avgDuration = totalConnections > 0 ? totalDuration / totalConnections : 0;
    
    const vendorCounts = new Map<number, number>();
    history.forEach(e => {
      if (e.type === 'connect') {
        vendorCounts.set(e.deviceInfo.vendorId, (vendorCounts.get(e.deviceInfo.vendorId) || 0) + 1);
      }
    });
    
    const topVendors = Array.from(vendorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([vendorId, count]) => ({
        vendorId,
        vendorName: getUSBVendorName(vendorId),
        count
      }));
    
    return {
      totalConnections,
      totalDisconnections,
      uniqueDevices,
      currentlyConnected: activeConnections.size,
      last24hEvents: last24h.length,
      last7dEvents: last7d.length,
      averageSessionDuration: avgDuration,
      totalSessionDuration: totalDuration,
      topVendors
    };
  }, [connectionHistory, activeConnections.size, refreshKey]);

  useEffect(() => {
    const nav = navigator as any;
    if (!nav.usb) {
      return;
    }

    setIsMonitoring(true);

    const handleConnect = (event: any) => {
      const device = event.device;
      const deviceKey = `${device.vendorId}-${device.productId}-${device.serialNumber || 'unknown'}`;
      
      const connectEvent: ConnectionEvent = {
        id: `${Date.now()}-connect-${deviceKey}`,
        type: 'connect',
        timestamp: Date.now(),
        deviceInfo: {
          vendorId: device.vendorId,
          productId: device.productId,
          productName: device.productName,
          manufacturerName: device.manufacturerName,
          serialNumber: device.serialNumber,
          deviceClass: device.deviceClass,
        }
      };

      setActiveConnections(prev => new Map(prev).set(deviceKey, connectEvent));
      
      setConnectionHistory((prevHistory) => {
        const newHistory = [connectEvent, ...(prevHistory || [])];
        return newHistory.slice(0, 1000);
      });
      
      setRefreshKey(prev => prev + 1);
    };

    const handleDisconnect = (event: any) => {
      const device = event.device;
      const deviceKey = `${device.vendorId}-${device.productId}-${device.serialNumber || 'unknown'}`;
      
      const connectEvent = activeConnections.get(deviceKey);
      const duration = connectEvent ? Date.now() - connectEvent.timestamp : undefined;
      
      const disconnectEvent: ConnectionEvent = {
        id: `${Date.now()}-disconnect-${deviceKey}`,
        type: 'disconnect',
        timestamp: Date.now(),
        duration,
        deviceInfo: {
          vendorId: device.vendorId,
          productId: device.productId,
          productName: device.productName,
          manufacturerName: device.manufacturerName,
          serialNumber: device.serialNumber,
          deviceClass: device.deviceClass,
        }
      };

      setActiveConnections(prev => {
        const newMap = new Map(prev);
        newMap.delete(deviceKey);
        return newMap;
      });
      
      setConnectionHistory((prevHistory) => {
        const newHistory = [disconnectEvent, ...(prevHistory || [])];
        return newHistory.slice(0, 1000);
      });
      
      setRefreshKey(prev => prev + 1);
    };

    nav.usb.addEventListener('connect', handleConnect);
    nav.usb.addEventListener('disconnect', handleDisconnect);

    return () => {
      setIsMonitoring(false);
      nav.usb?.removeEventListener('connect', handleConnect);
      nav.usb?.removeEventListener('disconnect', handleDisconnect);
    };
  }, [setConnectionHistory]);

  const clearHistory = () => {
    setConnectionHistory([]);
    setRefreshKey(prev => prev + 1);
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChartBar size={24} className="text-primary" weight="duotone" />
            <div>
              <CardTitle>Device Analytics Dashboard</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                Comprehensive connection history and usage statistics
                {isMonitoring && (
                  <div className="flex items-center gap-1.5 text-xs text-green-600">
                    <Circle size={8} weight="fill" className="animate-pulse" />
                    <span>Live Tracking</span>
                  </div>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefreshKey(prev => prev + 1)}
            >
              <ArrowClockwise size={16} />
              Refresh
            </Button>
            {(connectionHistory?.length || 0) > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={clearHistory}
              >
                Clear History
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Total Connections</CardDescription>
                  <CardTitle className="text-3xl font-bold flex items-center gap-2">
                    <PlugsConnected size={24} className="text-green-600" weight="duotone" />
                    {analytics.totalConnections}
                  </CardTitle>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Unique Devices</CardDescription>
                  <CardTitle className="text-3xl font-bold flex items-center gap-2">
                    <DeviceMobile size={24} className="text-blue-600" weight="duotone" />
                    {analytics.uniqueDevices}
                  </CardTitle>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Currently Connected</CardDescription>
                  <CardTitle className="text-3xl font-bold flex items-center gap-2">
                    <Plug size={24} className="text-emerald-600" weight="duotone" />
                    {analytics.currentlyConnected}
                  </CardTitle>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Avg Session</CardDescription>
                  <CardTitle className="text-3xl font-bold flex items-center gap-2">
                    <Clock size={24} className="text-purple-600" weight="duotone" />
                    <span className="text-2xl">{formatDuration(analytics.averageSessionDuration)}</span>
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last 24 Hours</span>
                      <Badge>{analytics.last24hEvents} events</Badge>
                    </div>
                    <Progress value={(analytics.last24hEvents / Math.max(analytics.last7dEvents, 1)) * 100} />
                    
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm text-muted-foreground">Last 7 Days</span>
                      <Badge>{analytics.last7dEvents} events</Badge>
                    </div>
                    <Progress value={100} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Top Vendors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topVendors.map((vendor, index) => (
                      <div key={vendor.vendorId} className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{vendor.vendorName}</div>
                          <div className="text-xs text-muted-foreground">
                            VID: 0x{vendor.vendorId.toString(16).padStart(4, '0')}
                          </div>
                        </div>
                        <Badge variant="secondary">{vendor.count}</Badge>
                      </div>
                    ))}
                    {analytics.topVendors.length === 0 && (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        No vendor data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="devices" className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {deviceStats.map((stats) => {
                  const deviceName = stats.productName || `Device (VID: 0x${stats.vendorId.toString(16).padStart(4, '0')})`;
                  const vendorName = getUSBVendorName(stats.vendorId);
                  
                  return (
                    <Card key={stats.deviceId}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="relative">
                              <Usb size={24} className="text-primary" weight="duotone" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-base">{deviceName}</div>
                              {stats.manufacturerName && (
                                <div className="text-sm text-muted-foreground">
                                  {stats.manufacturerName}
                                </div>
                              )}
                              <div className="flex gap-2 mt-2 text-xs text-muted-foreground font-mono">
                                <span>VID: 0x{stats.vendorId.toString(16).padStart(4, '0')}</span>
                                <span>PID: 0x{stats.productId.toString(16).padStart(4, '0')}</span>
                              </div>
                              <div className="flex gap-2 mt-2 flex-wrap">
                                <Badge variant="outline">
                                  {vendorName}
                                </Badge>
                                {stats.correlationBadge && (
                                  <CorrelationBadgeDisplay 
                                    badge={stats.correlationBadge}
                                    matchedIds={stats.matchedToolIds}
                                    className="text-xs"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-right">
                            <div>
                              <div className="text-2xl font-bold">{stats.totalConnections}</div>
                              <div className="text-xs text-muted-foreground">Connections</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold">{formatDuration(stats.totalDuration)}</div>
                              <div className="text-xs text-muted-foreground">Total Time</div>
                            </div>
                            <div className="col-span-2">
                              <div className="text-sm font-medium">{formatDuration(stats.averageSessionDuration)}</div>
                              <div className="text-xs text-muted-foreground">Avg Session</div>
                            </div>
                            <div className="col-span-2">
                              <div className="text-xs text-muted-foreground">
                                Last seen: {formatTimestamp(stats.lastConnected)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {deviceStats.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <DeviceMobile size={48} className="mx-auto mb-3 opacity-50" weight="duotone" />
                    <p>No device statistics available</p>
                    <p className="text-xs mt-1">Connect devices to start tracking usage data</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {(connectionHistory || []).map((event) => {
                  const deviceName = event.deviceInfo.productName || 
                    `Device (VID: 0x${event.deviceInfo.vendorId.toString(16).padStart(4, '0')})`;
                  const vendorName = getUSBVendorName(event.deviceInfo.vendorId);
                  const className = event.deviceInfo.deviceClass !== undefined 
                    ? getUSBClassName(event.deviceInfo.deviceClass)
                    : 'Unknown Class';

                  return (
                    <div
                      key={event.id}
                      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 ${
                        event.type === 'connect' 
                          ? 'border-l-4 border-l-green-500' 
                          : 'border-l-4 border-l-red-500'
                      }`}
                    >
                      <div className={`mt-0.5 ${
                        event.type === 'connect' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <Usb size={20} weight="duotone" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{deviceName}</div>
                            {event.deviceInfo.manufacturerName && (
                              <div className="text-xs text-muted-foreground">
                                {event.deviceInfo.manufacturerName}
                              </div>
                            )}
                            <div className="flex gap-2 mt-1 text-xs text-muted-foreground font-mono">
                              <span>VID: 0x{event.deviceInfo.vendorId.toString(16).padStart(4, '0')}</span>
                              <span>PID: 0x{event.deviceInfo.productId.toString(16).padStart(4, '0')}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <Badge 
                              variant={event.type === 'connect' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {event.type === 'connect' ? 'Connected' : 'Disconnected'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(event.timestamp)}
                            </span>
                            {event.duration && (
                              <span className="text-xs text-muted-foreground">
                                Duration: {formatDuration(event.duration)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {vendorName}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {className}
                          </Badge>
                          {event.correlationBadge && (
                            <CorrelationBadgeDisplay 
                              badge={event.correlationBadge}
                              matchedIds={event.matchedToolIds}
                              className="text-xs"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {(!connectionHistory || connectionHistory.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock size={48} className="mx-auto mb-3 opacity-50" weight="duotone" />
                    <p>No connection events recorded</p>
                    <p className="text-xs mt-1">Connect or disconnect devices to populate the timeline</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="insights" className="mt-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendUp size={16} weight="duotone" />
                    Usage Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Connection Rate</span>
                      <span className="text-sm font-semibold">
                        {((analytics.last24hEvents / 24) || 0).toFixed(1)} per hour
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Session Time</span>
                      <span className="text-sm font-semibold">
                        {formatDuration(analytics.totalSessionDuration)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Most Active Device</span>
                      <span className="text-sm font-semibold">
                        {deviceStats[0]?.productName || 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Cpu size={16} weight="duotone" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">WebUSB Support</span>
                    <Badge variant="default">
                      <Circle size={8} weight="fill" className="mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Real-time Monitoring</span>
                    <Badge variant={isMonitoring ? "default" : "secondary"}>
                      {isMonitoring ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">History Size</span>
                    <Badge variant="outline">
                      {connectionHistory?.length || 0} / 1000 events
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
