import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Gauge,
  TrendUp,
  TrendDown,
  Lightning,
  Pulse,
  Warning,
  CheckCircle,
  Cpu,
  HardDrive,
  ArrowsDownUp,
  Database,
  ChartLine,
  Play,
  Stop,
  DownloadSimple,
  Info,
  X
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { PerformanceOptimizer } from './PerformanceOptimizer';
import { PerformanceBenchmarking } from './PerformanceBenchmarking';
import { API_CONFIG, getAPIUrl } from '@/lib/apiConfig';

export interface RealtimeMetrics {
  timestamp: number;
  transferSpeed: number;
  cpuUsage: number;
  memoryUsage: number;
  usbUtilization: number | null;
  diskIO: number;
  bufferHealth: number | null;
}

export interface BottleneckDetection {
  id: string;
  type: 'usb' | 'cpu' | 'memory' | 'disk' | 'driver' | 'thermal';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  detectedAt: number;
  metrics: Partial<RealtimeMetrics>;
  recommendation: string;
  confidence: number;
}

export interface MonitoringSession {
  id: string;
  startTime: number;
  endTime?: number;
  deviceSerial: string;
  partition: string;
  fileSize: number;
  metrics: RealtimeMetrics[];
  bottlenecks: BottleneckDetection[];
  averageSpeed: number;
  peakSpeed: number;
  minSpeed: number;
  status: 'active' | 'completed' | 'failed';
}

export function RealTimeFlashMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentSession, setCurrentSession] = useState<MonitoringSession | null>(null);
  const [sessions, setSessions] = useKV<MonitoringSession[]>('monitoring-sessions', []);
  const [activeBottlenecks, setActiveBottlenecks] = useState<BottleneckDetection[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<RealtimeMetrics | null>(null);
  const [historicalBaseline, setHistoricalBaseline] = useState<{ avgSpeed: number; avgCpu: number } | null>(null);
  
  const metricsHistoryRef = useRef<RealtimeMetrics[]>([]);
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      calculateBaseline();
    }
  }, [sessions]);

  useEffect(() => {
    if (isMonitoring && currentSession) {
      startMetricsCollection();
      drawRealtimeGraph();
    } else {
      stopMetricsCollection();
    }

    return () => stopMetricsCollection();
  }, [isMonitoring]);

  useEffect(() => {
    if (currentMetrics && isMonitoring) {
      detectBottlenecks(currentMetrics);
      drawRealtimeGraph();
    }
  }, [currentMetrics]);

  const calculateBaseline = () => {
    if (!sessions || sessions.length === 0) return;

    const completedSessions = sessions.filter(s => s.status === 'completed');
    if (completedSessions.length === 0) return;

    const totalSpeed = completedSessions.reduce((sum, s) => sum + s.averageSpeed, 0);
    const totalCpu = completedSessions.reduce((sum, s) => {
      const avgCpu = s.metrics.reduce((cpuSum, m) => cpuSum + m.cpuUsage, 0) / s.metrics.length;
      return sum + avgCpu;
    }, 0);

    setHistoricalBaseline({
      avgSpeed: totalSpeed / completedSessions.length,
      avgCpu: totalCpu / completedSessions.length
    });
  };

  const startMonitoring = async () => {
    try {
      const response = await fetch(getAPIUrl(API_CONFIG.ENDPOINTS.MONITOR_START), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to start monitoring');
      }

      const newSession: MonitoringSession = {
        id: `session-${Date.now()}`,
        startTime: Date.now(),
        deviceSerial: 'N/A',
        partition: 'N/A',
        fileSize: 0,
        metrics: [],
        bottlenecks: [],
        averageSpeed: 0,
        peakSpeed: 0,
        minSpeed: Infinity,
        status: 'active'
      };

      setCurrentSession(newSession);
      setIsMonitoring(true);
      metricsHistoryRef.current = [];
      setActiveBottlenecks([]);
      toast.success('Real-time monitoring started');
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      toast.error('Failed to start monitoring - backend may be offline');
    }
  };

  const stopMonitoring = async () => {
    if (!currentSession) return;

    try {
      await fetch(getAPIUrl(API_CONFIG.ENDPOINTS.MONITOR_STOP), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
    }

    const completedSession: MonitoringSession = {
      ...currentSession,
      endTime: Date.now(),
      metrics: metricsHistoryRef.current,
      bottlenecks: activeBottlenecks,
      status: 'completed'
    };

    setSessions(prev => [completedSession, ...(prev || [])].slice(0, 50));
    setIsMonitoring(false);
    setCurrentSession(null);
    setActiveBottlenecks([]);
    toast.success('Monitoring session completed');
  };

  const startMetricsCollection = () => {
    monitoringIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(getAPIUrl(API_CONFIG.ENDPOINTS.MONITOR_LIVE));
        if (!response.ok) {
          console.error('Failed to fetch metrics');
          return;
        }
        
        const data = await response.json();
        
        if (!data.active) {
          return;
        }

        if (typeof data.speed !== 'number') return;
        if (typeof data.cpu !== 'number') return;
        if (typeof data.memory !== 'number') return;
        if (typeof data.disk !== 'number') return;

        const transferSpeed = data.speed * 1024 * 1024;
        const metrics: RealtimeMetrics = {
          timestamp: Date.now(),
          transferSpeed,
          cpuUsage: data.cpu,
          memoryUsage: data.memory,
          usbUtilization: typeof data.usb === 'number' ? data.usb : null,
          diskIO: data.disk,
          bufferHealth: null
        };

        metricsHistoryRef.current.push(metrics);
        if (metricsHistoryRef.current.length > 300) {
          metricsHistoryRef.current.shift();
        }

        setCurrentMetrics(metrics);

        if (currentSession) {
          setCurrentSession(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              averageSpeed: metricsHistoryRef.current.reduce((sum, m) => sum + m.transferSpeed, 0) / metricsHistoryRef.current.length,
              peakSpeed: Math.max(prev.peakSpeed, metrics.transferSpeed),
              minSpeed: Math.min(prev.minSpeed, metrics.transferSpeed)
            };
          });
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    }, 2000);
  };

  const stopMetricsCollection = () => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
  };

  const detectBottlenecks = (metrics: RealtimeMetrics) => {
    const newBottlenecks: BottleneckDetection[] = [];

    if (metrics.transferSpeed < 5 * 1024 * 1024) {
      newBottlenecks.push({
        id: `bottleneck-usb-${Date.now()}`,
        type: 'usb',
        severity: 'high',
        title: 'USB Bandwidth Limitation',
        description: `Transfer speed at ${formatSpeed(metrics.transferSpeed)} indicates USB 2.0 connection or poor cable quality`,
        detectedAt: Date.now(),
        metrics: metrics.usbUtilization === null
          ? { transferSpeed: metrics.transferSpeed }
          : { transferSpeed: metrics.transferSpeed, usbUtilization: metrics.usbUtilization },
        recommendation: 'Switch to USB 3.0 cable and port for 5-10x speed improvement',
        confidence: 0.92
      });
    }

    if (metrics.cpuUsage > 85) {
      newBottlenecks.push({
        id: `bottleneck-cpu-${Date.now()}`,
        type: 'cpu',
        severity: 'critical',
        title: 'CPU Throttling Detected',
        description: `CPU usage at ${metrics.cpuUsage.toFixed(1)}% is limiting transfer performance`,
        detectedAt: Date.now(),
        metrics: { cpuUsage: metrics.cpuUsage },
        recommendation: 'Close background applications or upgrade to faster CPU',
        confidence: 0.88
      });
    }

    if (metrics.memoryUsage > 90) {
      newBottlenecks.push({
        id: `bottleneck-memory-${Date.now()}`,
        type: 'memory',
        severity: 'high',
        title: 'Memory Pressure',
        description: `System memory at ${metrics.memoryUsage.toFixed(1)}% capacity causing buffer starvation`,
        detectedAt: Date.now(),
        metrics: { memoryUsage: metrics.memoryUsage },
        recommendation: 'Close memory-intensive applications or add more RAM',
        confidence: 0.85
      });
    }

    if (metrics.diskIO > 90) {
      newBottlenecks.push({
        id: `bottleneck-disk-${Date.now()}`,
        type: 'disk',
        severity: 'medium',
        title: 'Disk I/O Saturation',
        description: `Disk I/O at ${metrics.diskIO.toFixed(1)}% limiting read speeds`,
        detectedAt: Date.now(),
        metrics: { diskIO: metrics.diskIO },
        recommendation: 'Move firmware files to SSD or close disk-intensive applications',
        confidence: 0.79
      });
    }

    if (historicalBaseline && metrics.transferSpeed < historicalBaseline.avgSpeed * 0.6) {
      newBottlenecks.push({
        id: `bottleneck-degradation-${Date.now()}`,
        type: 'driver',
        severity: 'medium',
        title: 'Performance Degradation',
        description: `Current speed ${formatSpeed(metrics.transferSpeed)} is 40% below your baseline ${formatSpeed(historicalBaseline.avgSpeed)}`,
        detectedAt: Date.now(),
        metrics: { transferSpeed: metrics.transferSpeed },
        recommendation: 'Check for driver updates or system issues',
        confidence: 0.75
      });
    }

    const recentBottlenecks = activeBottlenecks.filter(b => Date.now() - b.detectedAt < 5000);
    const uniqueNewBottlenecks = newBottlenecks.filter(nb => 
      !recentBottlenecks.some(rb => rb.type === nb.type)
    );

    if (uniqueNewBottlenecks.length > 0) {
      setActiveBottlenecks(prev => [...uniqueNewBottlenecks, ...recentBottlenecks].slice(0, 5));
    }
  };

  const drawRealtimeGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const metrics = metricsHistoryRef.current;

    ctx.clearRect(0, 0, width, height);

    if (metrics.length < 2) return;

    const maxSpeed = Math.max(...metrics.map(m => m.transferSpeed), 50 * 1024 * 1024);
    const xStep = width / Math.max(metrics.length - 1, 1);

    ctx.strokeStyle = '#4A9EFF';
    ctx.lineWidth = 2;
    ctx.beginPath();

    metrics.forEach((m, i) => {
      const x = width - (i * xStep);
      const y = height - (m.transferSpeed / maxSpeed) * height;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    if (historicalBaseline) {
      const baselineY = height - (historicalBaseline.avgSpeed / maxSpeed) * height;
      ctx.strokeStyle = '#3DD68C';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, baselineY);
      ctx.lineTo(width, baselineY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [historicalBaseline]);

  const exportDiagnostics = () => {
    if (!currentSession && metricsHistoryRef.current.length === 0) {
      toast.error('No data to export');
      return;
    }

    const diagnostics = {
      session: currentSession,
      metrics: metricsHistoryRef.current,
      bottlenecks: activeBottlenecks,
      baseline: historicalBaseline,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(diagnostics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flash-diagnostics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Diagnostics exported');
  };

  const dismissBottleneck = (id: string) => {
    setActiveBottlenecks(prev => prev.filter(b => b.id !== id));
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    const mbps = bytesPerSecond / (1024 * 1024);
    return `${mbps.toFixed(2)} MB/s`;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getBottleneckIcon = (type: string) => {
    switch (type) {
      case 'usb': return <ArrowsDownUp className="w-5 h-5" />;
      case 'cpu': return <Cpu className="w-5 h-5" />;
      case 'memory': return <Database className="w-5 h-5" />;
      case 'disk': return <HardDrive className="w-5 h-5" />;
      default: return <Warning className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Pulse className={`w-6 h-6 ${isMonitoring ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                Real-Time Flash Performance Monitor
              </CardTitle>
              <CardDescription className="mt-2">
                Active bottleneck detection with live performance metrics
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={exportDiagnostics}
                variant="outline"
                size="sm"
                disabled={!currentSession && metricsHistoryRef.current.length === 0}
              >
                <DownloadSimple className="w-4 h-4 mr-2" />
                Export
              </Button>
              {!isMonitoring ? (
                <Button onClick={startMonitoring} size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Start Monitoring
                </Button>
              ) : (
                <Button onClick={stopMonitoring} variant="destructive" size="sm">
                  <Stop className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {activeBottlenecks.length > 0 && (
        <div className="space-y-3">
          {activeBottlenecks.map(bottleneck => (
            <Alert key={bottleneck.id} className={`${getSeverityColor(bottleneck.severity)} border animate-in fade-in slide-in-from-top-2`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getBottleneckIcon(bottleneck.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <AlertTitle className="text-base font-semibold flex items-center gap-2">
                      {bottleneck.title}
                      <Badge variant="outline" className="text-xs">
                        {bottleneck.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {(bottleneck.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    </AlertTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissBottleneck(bottleneck.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <AlertDescription className="text-sm mb-2">
                    {bottleneck.description}
                  </AlertDescription>
                  <div className="flex items-center gap-2 text-xs">
                    <Lightning className="w-3 h-3" />
                    <span className="font-medium">{bottleneck.recommendation}</span>
                  </div>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      <Tabs defaultValue="realtime" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="realtime">Real-Time</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="optimizer">Optimizer</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs uppercase tracking-wider">Transfer Speed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono">
                    {currentMetrics ? formatSpeed(currentMetrics.transferSpeed) : '0.00 MB/s'}
                  </span>
                  {historicalBaseline && currentMetrics && (
                    currentMetrics.transferSpeed > historicalBaseline.avgSpeed ? (
                      <TrendUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <TrendDown className="w-5 h-5 text-red-500" />
                    )
                  )}
                </div>
                {currentSession && (
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    <div>Peak: {formatSpeed(currentSession.peakSpeed)}</div>
                    <div>Avg: {formatSpeed(currentSession.averageSpeed)}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs uppercase tracking-wider">CPU Usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold font-mono">
                    {currentMetrics ? `${currentMetrics.cpuUsage.toFixed(1)}%` : '0%'}
                  </div>
                  <Progress 
                    value={currentMetrics?.cpuUsage || 0} 
                    className={currentMetrics && currentMetrics.cpuUsage > 85 ? 'bg-red-900' : ''}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs uppercase tracking-wider">Memory Usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold font-mono">
                    {currentMetrics ? `${currentMetrics.memoryUsage.toFixed(1)}%` : '0%'}
                  </div>
                  <Progress 
                    value={currentMetrics?.memoryUsage || 0}
                    className={currentMetrics && currentMetrics.memoryUsage > 90 ? 'bg-red-900' : ''}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ChartLine className="w-5 h-5" />
                Transfer Speed Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-black/20 rounded-lg p-4">
                <canvas 
                  ref={canvasRef} 
                  width={800} 
                  height={200}
                  className="w-full h-[200px]"
                />
                {!isMonitoring && metricsHistoryRef.current.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    Start monitoring to see live data
                  </div>
                )}
              </div>
              {historicalBaseline && (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-8 h-0.5 bg-cyan-500"></div>
                  <span>Baseline: {formatSpeed(historicalBaseline.avgSpeed)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs uppercase tracking-wider flex items-center gap-2">
                  <ArrowsDownUp className="w-4 h-4" />
                  USB Utilization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold font-mono">
                    {currentMetrics
                      ? (typeof currentMetrics.usbUtilization === 'number' ? `${currentMetrics.usbUtilization.toFixed(1)}%` : 'N/A')
                      : 'N/A'}
                  </div>
                  <Progress value={typeof currentMetrics?.usbUtilization === 'number' ? currentMetrics.usbUtilization : 0} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs uppercase tracking-wider flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  Disk I/O
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold font-mono">
                    {currentMetrics ? `${currentMetrics.diskIO.toFixed(1)}%` : '0%'}
                  </div>
                  <Progress value={currentMetrics?.diskIO || 0} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6 mt-6">
          {currentSession && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Session Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Duration</div>
                    <div className="text-lg font-semibold">
                      {Math.floor((Date.now() - currentSession.startTime) / 1000)}s
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Partition</div>
                    <div className="text-lg font-semibold">{currentSession.partition}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">File Size</div>
                    <div className="text-lg font-semibold">{formatBytes(currentSession.fileSize)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Status</div>
                    <Badge variant={currentSession.status === 'active' ? 'default' : 'secondary'}>
                      {currentSession.status}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    Performance Comparison
                  </h4>
                  {historicalBaseline ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Current vs Baseline Speed</span>
                        <span className="text-sm font-mono">
                          {formatSpeed(currentSession.averageSpeed)} / {formatSpeed(historicalBaseline.avgSpeed)}
                        </span>
                      </div>
                      <Progress 
                        value={(currentSession.averageSpeed / historicalBaseline.avgSpeed) * 100}
                        className="h-2"
                      />
                      <div className="text-xs text-muted-foreground">
                        {currentSession.averageSpeed > historicalBaseline.avgSpeed ? (
                          <span className="text-green-500 flex items-center gap-1">
                            <TrendUp className="w-3 h-3" />
                            {((currentSession.averageSpeed / historicalBaseline.avgSpeed - 1) * 100).toFixed(1)}% faster than baseline
                          </span>
                        ) : (
                          <span className="text-red-500 flex items-center gap-1">
                            <TrendDown className="w-3 h-3" />
                            {((1 - currentSession.averageSpeed / historicalBaseline.avgSpeed) * 100).toFixed(1)}% slower than baseline
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No historical baseline available yet
                    </div>
                  )}
                </div>

                {activeBottlenecks.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Lightning className="w-4 h-4" />
                        Detected Bottlenecks ({activeBottlenecks.length})
                      </h4>
                      <div className="space-y-2">
                        {activeBottlenecks.map(b => (
                          <div key={b.id} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                            <div className="flex items-center gap-2">
                              {getBottleneckIcon(b.type)}
                              <span>{b.title}</span>
                            </div>
                            <Badge variant="outline" className={getSeverityColor(b.severity)}>
                              {b.severity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {!currentSession && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-8">
                  <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Start a monitoring session to see analysis data</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6 mt-6">
          <PerformanceBenchmarking
            currentMetrics={currentMetrics || undefined}
            isActive={isMonitoring}
          />
        </TabsContent>

        <TabsContent value="optimizer" className="space-y-6 mt-6">
          <PerformanceOptimizer
            sessions={sessions || []}
            currentMetrics={currentMetrics}
            activeBottlenecks={activeBottlenecks}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          {sessions && sessions.length > 0 ? (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {sessions.map((session) => (
                  <Card key={session.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {session.partition} - {session.deviceSerial}
                        </CardTitle>
                        <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                          {session.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Avg Speed</div>
                          <div className="font-mono">{formatSpeed(session.averageSpeed)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Peak Speed</div>
                          <div className="font-mono">{formatSpeed(session.peakSpeed)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Duration</div>
                          <div className="font-mono">
                            {session.endTime ? Math.floor((session.endTime - session.startTime) / 1000) : '-'}s
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Bottlenecks</div>
                          <div className="font-mono">{session.bottlenecks.length}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Timestamp</div>
                          <div className="font-mono text-xs">
                            {new Date(session.startTime).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-8">
                  <ChartLine className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No monitoring sessions yet</p>
                  <p className="text-sm mt-2">Start your first monitoring session to build history</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
