import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Stop, 
  ChartLine, 
  Cpu,
  HardDrive,
  Gauge,
  CircleNotch,
  DownloadSimple
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { API_CONFIG, getAPIUrl } from '@/lib/apiConfig';

interface PerformanceMetrics {
  speed: number | null;
  cpu: number | null;
  memory: number | null;
  usb: number | null;
  disk: number | null;
  timestamp: number;
}

export function PandoraMonitorPanel() {
  const [monitoring, setMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [history, setHistory] = useState<PerformanceMetrics[]>([]);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startMonitoring = async () => {
    try {
      const res = await fetch(getAPIUrl(API_CONFIG.ENDPOINTS.MONITOR_START), { method: 'POST' });
      if (res.ok) {
        setMonitoring(true);
        toast.success('Performance monitoring started');
        
        intervalRef.current = window.setInterval(async () => {
          try {
            const metricsRes = await fetch(getAPIUrl(API_CONFIG.ENDPOINTS.MONITOR_LIVE));
            if (metricsRes.ok) {
              const data = await metricsRes.json();
              if (data.status !== 'not monitoring') {
                const newMetrics: PerformanceMetrics = {
                  speed: typeof data.speed === 'number' ? data.speed : null,
                  cpu: typeof data.cpu === 'number' ? data.cpu : null,
                  memory: typeof data.memory === 'number' ? data.memory : null,
                  usb: typeof data.usb === 'number' ? data.usb : null,
                  disk: typeof data.disk === 'number' ? data.disk : null,
                  timestamp: Date.now()
                };
                setMetrics(newMetrics);
                setHistory(prev => [...prev.slice(-29), newMetrics]);
              }
            }
          } catch (_err) {
            console.error('Failed to fetch metrics:', _err);
          }
        }, 2000);
      }
    } catch (_err) {
      toast.error('Failed to start monitoring');
    }
  };

  const stopMonitoring = async () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    try {
      await fetch(getAPIUrl(API_CONFIG.ENDPOINTS.MONITOR_STOP), { method: 'POST' });
    } catch (_err) {
      console.error('Failed to stop monitoring:', _err);
    }

    setMonitoring(false);
    toast.info('Monitoring stopped');
  };

  const exportReport = () => {
    if (history.length === 0) {
      toast.warning('No data to export');
      return;
    }

    const report = {
      exportTime: new Date().toISOString(),
      metrics: history,
      summary: {
        avgSpeed: history.reduce((sum, m) => sum + m.speed, 0) / history.length,
        avgCpu: history.reduce((sum, m) => sum + m.cpu, 0) / history.length,
        avgMemory: history.reduce((sum, m) => sum + m.memory, 0) / history.length,
        avgUsb: history.reduce((sum, m) => sum + m.usb, 0) / history.length,
        avgDisk: history.reduce((sum, m) => sum + m.disk, 0) / history.length,
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-emerald-400';
    if (value <= thresholds.warning) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ChartLine className="w-5 h-5 text-primary" weight="duotone" />
                Performance Monitor
              </CardTitle>
              <CardDescription>Real-time system and flash performance metrics</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {!monitoring ? (
                <Button onClick={startMonitoring}>
                  <Play className="w-4 h-4" weight="fill" />
                  Start Monitoring
                </Button>
              ) : (
                <Button variant="destructive" onClick={stopMonitoring}>
                  <Stop className="w-4 h-4" weight="fill" />
                  Stop
                </Button>
              )}
              <Button variant="outline" onClick={exportReport} disabled={history.length === 0}>
                <DownloadSimple className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!metrics ? (
            <div className="text-center py-12 text-muted-foreground">
              <ChartLine className="w-12 h-12 mx-auto mb-3 opacity-50" weight="duotone" />
              <p className="font-medium">No monitoring data</p>
              <p className="text-sm mt-1">Start monitoring to see live performance metrics</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-primary/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-muted-foreground">Transfer Speed</div>
                      <Gauge className={`w-4 h-4 ${getStatusColor(metrics.speed ?? 0, { good: 30, warning: 50 })}`} weight="duotone" />
                    </div>
                    <div className="text-3xl font-bold">{typeof metrics.speed === 'number' ? metrics.speed.toFixed(2) : '--'}</div>
                    <div className="text-xs text-muted-foreground mt-1">MB/s</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Baseline: 21.25 MB/s
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-muted-foreground">CPU Usage</div>
                      <Cpu className={`w-4 h-4 ${getStatusColor(metrics.cpu ?? 0, { good: 50, warning: 80 })}`} weight="duotone" />
                    </div>
                    <div className="text-3xl font-bold">{typeof metrics.cpu === 'number' ? metrics.cpu : '--'}</div>
                    <div className="text-xs text-muted-foreground mt-1">%</div>
                  </CardContent>
                </Card>

                <Card className="border-primary/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-muted-foreground">Memory Usage</div>
                      <HardDrive className={`w-4 h-4 ${getStatusColor(metrics.memory ?? 0, { good: 50, warning: 80 })}`} weight="duotone" />
                    </div>
                    <div className="text-3xl font-bold">{typeof metrics.memory === 'number' ? metrics.memory : '--'}</div>
                    <div className="text-xs text-muted-foreground mt-1">%</div>
                  </CardContent>
                </Card>

                <Card className="border-primary/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-muted-foreground">USB Utilization</div>
                      <Badge variant="outline">{typeof metrics.usb === 'number' ? `${metrics.usb}%` : 'N/A'}</Badge>
                    </div>
                    <div className="text-3xl font-bold">{typeof metrics.usb === 'number' ? metrics.usb : '--'}</div>
                    <div className="text-xs text-muted-foreground mt-1">%</div>
                  </CardContent>
                </Card>

                <Card className="border-primary/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-muted-foreground">Disk I/O</div>
                      <Badge variant="outline">{typeof metrics.disk === 'number' ? `${metrics.disk}%` : 'N/A'}</Badge>
                    </div>
                    <div className="text-3xl font-bold">{typeof metrics.disk === 'number' ? metrics.disk : '--'}</div>
                    <div className="text-xs text-muted-foreground mt-1">%</div>
                  </CardContent>
                </Card>

                <Card className="border-primary/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-muted-foreground">Status</div>
                      {monitoring ? (
                        <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-500/30">
                          <CircleNotch className="w-3 h-3 mr-1 animate-spin" />
                          Live
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Stopped</Badge>
                      )}
                    </div>
                    <div className="text-sm font-medium mt-2">
                      {history.length} samples
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {monitoring ? 'Recording...' : 'Paused'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {history.length > 5 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Performance Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[120px] flex items-end gap-1">
                      {history.slice(-30).map((m, idx) => (
                        <div
                          key={idx}
                          className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors relative group"
                          style={{ height: `${(typeof m.speed === 'number' ? m.speed : 0) * 2}%` }}
                          title={typeof m.speed === 'number' ? `${m.speed.toFixed(2)} MB/s` : 'N/A'}
                        >
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover border border-border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {typeof m.speed === 'number' ? `${m.speed.toFixed(2)} MB/s` : 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
