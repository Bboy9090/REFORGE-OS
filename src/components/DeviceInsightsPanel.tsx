import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendUp, 
  TrendDown,
  Clock,
  Calendar,
  ChartLine,
  Lightning,
  Target
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';

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
}

export function DeviceInsightsPanel() {
  const [connectionHistory] = useKV<ConnectionEvent[]>('device-connection-history', []);

  const insights = useMemo(() => {
    const history = connectionHistory || [];
    const now = Date.now();
    
    const last24h = history.filter(e => now - e.timestamp < 24 * 60 * 60 * 1000);
    const prev24h = history.filter(e => 
      now - e.timestamp >= 24 * 60 * 60 * 1000 && 
      now - e.timestamp < 48 * 60 * 60 * 1000
    );
    
    const last7d = history.filter(e => now - e.timestamp < 7 * 24 * 60 * 60 * 1000);
    const prev7d = history.filter(e => 
      now - e.timestamp >= 7 * 24 * 60 * 60 * 1000 && 
      now - e.timestamp < 14 * 24 * 60 * 60 * 1000
    );
    
    const connectionsLast24h = last24h.filter(e => e.type === 'connect').length;
    const connectionsPrev24h = prev24h.filter(e => e.type === 'connect').length;
    const change24h = connectionsPrev24h > 0 
      ? ((connectionsLast24h - connectionsPrev24h) / connectionsPrev24h) * 100 
      : connectionsLast24h > 0 ? 100 : 0;
    
    const connectionsLast7d = last7d.filter(e => e.type === 'connect').length;
    const connectionsPrev7d = prev7d.filter(e => e.type === 'connect').length;
    const change7d = connectionsPrev7d > 0 
      ? ((connectionsLast7d - connectionsPrev7d) / connectionsPrev7d) * 100 
      : connectionsLast7d > 0 ? 100 : 0;
    
    const hourlyDistribution = new Array(24).fill(0);
    history.forEach(event => {
      if (event.type === 'connect') {
        const hour = new Date(event.timestamp).getHours();
        hourlyDistribution[hour]++;
      }
    });
    
    const peakHour = hourlyDistribution.indexOf(Math.max(...hourlyDistribution));
    const peakHourConnections = Math.max(...hourlyDistribution);
    
    const durationsWithData = history.filter(e => e.duration && e.duration > 0);
    const avgDuration = durationsWithData.length > 0
      ? durationsWithData.reduce((sum, e) => sum + (e.duration || 0), 0) / durationsWithData.length
      : 0;
    
    const shortSessions = durationsWithData.filter(e => (e.duration || 0) < 60000).length;
    const mediumSessions = durationsWithData.filter(e => {
      const d = e.duration || 0;
      return d >= 60000 && d < 600000;
    }).length;
    const longSessions = durationsWithData.filter(e => (e.duration || 0) >= 600000).length;
    
    const deviceUsageMap = new Map<string, number>();
    history.forEach(event => {
      if (event.type === 'connect') {
        const key = `${event.deviceInfo.vendorId}-${event.deviceInfo.productId}`;
        deviceUsageMap.set(key, (deviceUsageMap.get(key) || 0) + 1);
      }
    });
    
    const mostUsedDeviceCount = Math.max(0, ...Array.from(deviceUsageMap.values()));
    const totalDeviceConnections = Array.from(deviceUsageMap.values()).reduce((sum, count) => sum + count, 0);
    const usageConcentration = totalDeviceConnections > 0 
      ? (mostUsedDeviceCount / totalDeviceConnections) * 100 
      : 0;
    
    return {
      connectionsLast24h,
      change24h,
      change7d,
      peakHour,
      peakHourConnections,
      avgDuration,
      shortSessions,
      mediumSessions,
      longSessions,
      usageConcentration,
    };
  }, [connectionHistory]);

  const formatTime = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}${period}`;
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightning size={20} className="text-primary" weight="duotone" />
          <CardTitle>Smart Insights</CardTitle>
        </div>
        <CardDescription>
          AI-powered analytics on your device usage patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">24h Activity</span>
              <div className="flex items-center gap-1">
                {insights.change24h >= 0 ? (
                  <TrendUp size={16} className="text-green-600" weight="bold" />
                ) : (
                  <TrendDown size={16} className="text-red-600" weight="bold" />
                )}
                <span className={`text-sm font-semibold ${
                  insights.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(insights.change24h).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold">{insights.connectionsLast24h}</div>
            <p className="text-xs text-muted-foreground">connections in the last 24 hours</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">7d Trend</span>
              <div className="flex items-center gap-1">
                {insights.change7d >= 0 ? (
                  <TrendUp size={16} className="text-green-600" weight="bold" />
                ) : (
                  <TrendDown size={16} className="text-red-600" weight="bold" />
                )}
                <span className={`text-sm font-semibold ${
                  insights.change7d >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(insights.change7d).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold">
              {insights.change7d >= 0 ? 'Growing' : 'Declining'}
            </div>
            <p className="text-xs text-muted-foreground">compared to previous week</p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-3">
            <Clock size={20} className="text-primary mt-0.5" weight="duotone" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Peak Usage Time</span>
                <Badge variant="secondary">
                  {formatTime(insights.peakHour)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Most device connections occur at {formatTime(insights.peakHour)} with {insights.peakHourConnections} connections
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ChartLine size={20} className="text-primary mt-0.5" weight="duotone" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Avg Session Duration</span>
                <Badge variant="secondary">
                  {formatDuration(insights.avgDuration)}
                </Badge>
              </div>
              <div className="space-y-1.5 mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Quick (&lt;1min)</span>
                  <span className="font-medium">{insights.shortSessions}</span>
                </div>
                <Progress value={(insights.shortSessions / Math.max(1, insights.shortSessions + insights.mediumSessions + insights.longSessions)) * 100} className="h-1.5" />
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Medium (1-10min)</span>
                  <span className="font-medium">{insights.mediumSessions}</span>
                </div>
                <Progress value={(insights.mediumSessions / Math.max(1, insights.shortSessions + insights.mediumSessions + insights.longSessions)) * 100} className="h-1.5" />
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Extended (10min+)</span>
                  <span className="font-medium">{insights.longSessions}</span>
                </div>
                <Progress value={(insights.longSessions / Math.max(1, insights.shortSessions + insights.mediumSessions + insights.longSessions)) * 100} className="h-1.5" />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Target size={20} className="text-primary mt-0.5" weight="duotone" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Usage Concentration</span>
                <Badge variant="secondary">
                  {insights.usageConcentration.toFixed(0)}%
                </Badge>
              </div>
              <Progress value={insights.usageConcentration} className="mb-1.5" />
              <p className="text-xs text-muted-foreground">
                {insights.usageConcentration > 70 
                  ? 'You primarily use one device' 
                  : insights.usageConcentration > 40 
                  ? 'Usage is moderately distributed' 
                  : 'Usage is well distributed across devices'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
