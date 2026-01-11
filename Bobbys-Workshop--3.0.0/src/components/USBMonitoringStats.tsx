import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartBar, Usb, PlugsConnected, Plug } from '@phosphor-icons/react';

interface MonitoringStats {
  totalConnections: number;
  totalDisconnections: number;
  uniqueDevices: Set<string>;
  activeDevices: number;
  lastEventTime: number | null;
  sessionStartTime: number;
}

export function USBMonitoringStats() {
  const sessionStartRef = useRef<number>();
  const [now, setNow] = useState<number>();
  
  // Initialize refs and state in useEffect to avoid calling impure functions during render
  useEffect(() => {
    const currentTime = Date.now();
    if (!sessionStartRef.current) {
      sessionStartRef.current = currentTime;
    }
    if (!now) {
      setNow(currentTime);
    }
    // Set sessionStartTime in stats
    setStats(prev => ({ ...prev, sessionStartTime: currentTime }));
  }, [now]);
  const [stats, setStats] = useState(() => ({
    activeDevices: 0,
    lastEventTime: null as number | null,
    sessionStartTime: 0, // Will be set in useEffect
  }));

  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    const nav = navigator as any;
    if (!nav.usb) {
      return;
    }

    setIsMonitoring(true);

    const updateActiveDevices = async () => {
      try {
        const devices = await nav.usb.getDevices();
        setStats(prev => ({
          ...prev,
          activeDevices: devices.length,
        }));
      } catch (error) {
        console.error('Failed to get active devices:', error);
      }
    };

    updateActiveDevices();

    const handleConnect = async (event: any) => {
      const device = event.device;
      const deviceId = `${device.vendorId}-${device.productId}`;
      
      setStats(prev => {
        const newUniqueDevices = new Set(prev.uniqueDevices);
        newUniqueDevices.add(deviceId);
        
        return {
          ...prev,
          totalConnections: prev.totalConnections + 1,
          uniqueDevices: newUniqueDevices,
          lastEventTime: Date.now(),
        };
      });

      await updateActiveDevices();
    };

    const handleDisconnect = async (event: any) => {
      const device = event.device;
      const deviceId = `${device.vendorId}-${device.productId}`;
      
      setStats(prev => {
        const newUniqueDevices = new Set(prev.uniqueDevices);
        newUniqueDevices.add(deviceId);
        
        return {
          ...prev,
          totalDisconnections: prev.totalDisconnections + 1,
          uniqueDevices: newUniqueDevices,
          lastEventTime: Date.now(),
        };
      });

      await updateActiveDevices();
    };

    nav.usb.addEventListener('connect', handleConnect);
    nav.usb.addEventListener('disconnect', handleDisconnect);

    return () => {
      setIsMonitoring(false);
      nav.usb?.removeEventListener('connect', handleConnect);
      nav.usb?.removeEventListener('disconnect', handleDisconnect);
    };
  }, []);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const sessionDuration = (now || 0) - stats.sessionStartTime;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ChartBar size={20} className="text-primary" />
          <CardTitle>Monitoring Statistics</CardTitle>
        </div>
        <CardDescription>
          Real-time USB connection monitoring session stats
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isMonitoring ? (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">WebUSB monitoring not available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center justify-center p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Usb size={20} className="text-primary" />
              </div>
              <div className="text-2xl font-bold">{stats.activeDevices}</div>
              <div className="text-xs text-muted-foreground text-center">Active Devices</div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <PlugsConnected size={20} className="text-green-600" />
              </div>
              <div className="text-2xl font-bold">{stats.totalConnections}</div>
              <div className="text-xs text-muted-foreground text-center">Connections</div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Plug size={20} className="text-red-600" />
              </div>
              <div className="text-2xl font-bold">{stats.totalDisconnections}</div>
              <div className="text-xs text-muted-foreground text-center">Disconnections</div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{stats.uniqueDevices.size}</Badge>
              </div>
              <div className="text-2xl font-bold">{stats.uniqueDevices.size}</div>
              <div className="text-xs text-muted-foreground text-center">Unique Devices</div>
            </div>
          </div>
        )}

        {isMonitoring && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Session Duration:</span>
              <span className="font-mono">{formatDuration(sessionDuration)}</span>
            </div>
            {stats.lastEventTime != null && (
              <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                <span>Last Event:</span>
                <span className="font-mono">
                  {formatDuration((now || 0) - stats.lastEventTime)} ago
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
