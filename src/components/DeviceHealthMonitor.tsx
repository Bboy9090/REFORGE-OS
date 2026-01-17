import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Heart,
  Warning,
  CheckCircle,
  XCircle,
  Clock,
  Gauge,
  CircleNotch
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { getUSBVendorName } from '@/lib/deviceDetection';

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
  };
}

interface DeviceHealth {
  deviceId: string;
  deviceName: string;
  vendorName: string;
  healthScore: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  totalConnections: number;
  successfulConnections: number;
  failureRate: number;
  avgConnectionDuration: number;
  lastSeen: number;
  issues: string[];
  recommendations: string[];
}

export function DeviceHealthMonitor() {
  const [connectionHistory] = useKV<ConnectionEvent[]>('device-connection-history', []);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const deviceHealthData: DeviceHealth[] = useMemo(() => {
    const history = connectionHistory || [];
    const deviceMap = new Map<string, {
      connects: ConnectionEvent[];
      disconnects: ConnectionEvent[];
      durations: number[];
    }>();

    history.forEach(event => {
      const deviceKey = `${event.deviceInfo.vendorId}-${event.deviceInfo.productId}`;
      
      if (!deviceMap.has(deviceKey)) {
        deviceMap.set(deviceKey, { connects: [], disconnects: [], durations: [] });
      }
      
      const device = deviceMap.get(deviceKey)!;
      
      if (event.type === 'connect') {
        device.connects.push(event);
      } else {
        device.disconnects.push(event);
        if (event.duration) {
          device.durations.push(event.duration);
        }
      }
    });

    const healthData: DeviceHealth[] = [];

    deviceMap.forEach((data, deviceKey) => {
      const lastConnect = data.connects[0];
      if (!lastConnect) return;

      const deviceName = lastConnect.deviceInfo.productName || 
        `Device (VID: 0x${lastConnect.deviceInfo.vendorId.toString(16).padStart(4, '0')})`;
      const vendorName = getUSBVendorName(lastConnect.deviceInfo.vendorId);

      const totalConnections = data.connects.length;
      const totalDisconnects = data.disconnects.length;
      
      const unexpectedDisconnects = Math.max(0, totalDisconnects - totalConnections);
      const successfulConnections = totalConnections - unexpectedDisconnects;
      const failureRate = totalConnections > 0 ? (unexpectedDisconnects / totalConnections) * 100 : 0;

      const avgDuration = data.durations.length > 0
        ? data.durations.reduce((sum, d) => sum + d, 0) / data.durations.length
        : 0;

      const lastSeen = lastConnect.timestamp;
      const timeSinceLastSeen = Date.now() - lastSeen;
      const daysSinceLastSeen = timeSinceLastSeen / (1000 * 60 * 60 * 24);

      const veryShortSessions = data.durations.filter(d => d < 5000).length;
      const veryShortRate = data.durations.length > 0 
        ? (veryShortSessions / data.durations.length) * 100 
        : 0;

      let healthScore = 100;
      const issues: string[] = [];
      const recommendations: string[] = [];

      if (failureRate > 20) {
        healthScore -= 30;
        issues.push('High failure rate detected');
        recommendations.push('Check USB cable and port quality');
      } else if (failureRate > 10) {
        healthScore -= 15;
        issues.push('Moderate connection instability');
      }

      if (veryShortRate > 50) {
        healthScore -= 20;
        issues.push('Frequent very short sessions');
        recommendations.push('Device may be experiencing power issues');
      }

      if (daysSinceLastSeen > 30) {
        healthScore -= 10;
        issues.push('Device not used recently');
      } else if (daysSinceLastSeen > 14) {
        healthScore -= 5;
      }

      if (avgDuration < 10000 && data.durations.length > 5) {
        healthScore -= 10;
        issues.push('Consistently short connection times');
        recommendations.push('Verify device drivers are up to date');
      }

      if (totalConnections < 3) {
        healthScore -= 5;
        issues.push('Limited usage data');
      }

      if (issues.length === 0) {
        issues.push('No issues detected');
      }

      if (recommendations.length === 0) {
        recommendations.push('Device is operating normally');
      }

      healthScore = Math.max(0, Math.min(100, healthScore));

      let status: 'excellent' | 'good' | 'fair' | 'poor';
      if (healthScore >= 90) status = 'excellent';
      else if (healthScore >= 70) status = 'good';
      else if (healthScore >= 50) status = 'fair';
      else status = 'poor';

      healthData.push({
        deviceId: deviceKey,
        deviceName,
        vendorName,
        healthScore,
        status,
        totalConnections,
        successfulConnections,
        failureRate,
        avgConnectionDuration: avgDuration,
        lastSeen,
        issues,
        recommendations,
      });
    });

    return healthData.sort((a, b) => b.healthScore - a.healthScore);
  }, [connectionHistory, refreshKey]);

  const overallHealth = useMemo(() => {
    if (deviceHealthData.length === 0) return { score: 100, status: 'excellent' as const };
    
    const avgScore = deviceHealthData.reduce((sum, d) => sum + d.healthScore, 0) / deviceHealthData.length;
    
    let status: 'excellent' | 'good' | 'fair' | 'poor';
    if (avgScore >= 90) status = 'excellent';
    else if (avgScore >= 70) status = 'good';
    else if (avgScore >= 50) status = 'fair';
    else status = 'poor';
    
    return { score: avgScore, status };
  }, [deviceHealthData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'fair': return 'outline';
      case 'poor': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle size={20} weight="fill" className="text-green-600" />;
      case 'good': return <CheckCircle size={20} weight="duotone" className="text-blue-600" />;
      case 'fair': return <Warning size={20} weight="duotone" className="text-yellow-600" />;
      case 'poor': return <XCircle size={20} weight="fill" className="text-red-600" />;
      default: return <CircleNotch size={20} className="text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-primary" weight="duotone" />
            <CardTitle>Device Health Monitor</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Overall Health</div>
              <div className={`text-lg font-bold ${getStatusColor(overallHealth.status)}`}>
                {overallHealth.score.toFixed(0)}%
              </div>
            </div>
            <Badge variant={getStatusBadgeVariant(overallHealth.status) as any}>
              {overallHealth.status.toUpperCase()}
            </Badge>
          </div>
        </div>
        <CardDescription>
          Real-time health monitoring and diagnostics for connected devices
        </CardDescription>
      </CardHeader>
      <CardContent>
        {deviceHealthData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Heart size={48} className="mx-auto mb-3 opacity-50" weight="duotone" />
            <p>No device health data available</p>
            <p className="text-xs mt-1">Connect devices to start monitoring their health</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {deviceHealthData.map((device) => (
                <Card key={device.deviceId} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getStatusIcon(device.status)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-base truncate">
                              {device.deviceName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {device.vendorName}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getStatusColor(device.status)}`}>
                              {device.healthScore}
                            </div>
                            <Badge 
                              variant={getStatusBadgeVariant(device.status) as any}
                              className="text-xs"
                            >
                              {device.status}
                            </Badge>
                          </div>
                        </div>

                        <Progress value={device.healthScore} className="h-2" />

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <div className="text-muted-foreground">Connections</div>
                            <div className="font-semibold">{device.totalConnections}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Success Rate</div>
                            <div className="font-semibold">
                              {(100 - device.failureRate).toFixed(0)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Avg Duration</div>
                            <div className="font-semibold">
                              {(device.avgConnectionDuration / 1000).toFixed(0)}s
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Last Seen</div>
                            <div className="font-semibold">
                              {formatTimestamp(device.lastSeen)}
                            </div>
                          </div>
                        </div>

                        {device.issues.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="text-xs font-semibold text-muted-foreground">Issues</div>
                            {device.issues.map((issue, index) => (
                              <div 
                                key={index}
                                className="flex items-start gap-2 text-xs"
                              >
                                <Warning size={12} className="mt-0.5 text-yellow-600 flex-shrink-0" />
                                <span>{issue}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {device.recommendations.length > 0 && device.recommendations[0] !== 'Device is operating normally' && (
                          <div className="space-y-1.5">
                            <div className="text-xs font-semibold text-muted-foreground">Recommendations</div>
                            {device.recommendations.map((rec, index) => (
                              <div 
                                key={index}
                                className="flex items-start gap-2 text-xs text-blue-600"
                              >
                                <Gauge size={12} className="mt-0.5 flex-shrink-0" />
                                <span>{rec}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
