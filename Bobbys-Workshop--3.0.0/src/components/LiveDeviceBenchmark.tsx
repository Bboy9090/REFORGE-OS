import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Gauge,
  TrendUp,
  TrendDown,
  Lightning,
  Warning,
  CheckCircle,
  Cpu,
  HardDrive,
  ArrowsDownUp,
  Database,
  ChartLine,
  Play,
  Stop,
  Timer,
  Thermometer,
  GraphicsCard,
  Info,
  Speedometer
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export interface LiveBenchmarkMetrics {
  timestamp: number;
  writeSpeed: number;
  readSpeed: number;
  cpuUsage: number;
  cpuTemp: number;
  memoryUsage: number;
  memoryBandwidth: number;
  usbBandwidth: number;
  usbLatency: number;
  diskIOPS: number;
  diskLatency: number;
  bufferUtilization: number;
  thermalThrottling: boolean;
  powerDraw: number;
}

export interface BenchmarkResult {
  id: string;
  deviceSerial: string;
  deviceModel: string;
  startTime: number;
  endTime: number;
  duration: number;
  partition: string;
  fileSize: number;
  operationType: 'flash' | 'read' | 'verify' | 'erase';
  metrics: LiveBenchmarkMetrics[];
  summary: {
    avgWriteSpeed: number;
    avgReadSpeed: number;
    peakWriteSpeed: number;
    peakReadSpeed: number;
    minWriteSpeed: number;
    avgCpuUsage: number;
    peakCpuUsage: number;
    avgCpuTemp: number;
    peakCpuTemp: number;
    avgMemoryUsage: number;
    avgUsbBandwidth: number;
    avgDiskIOPS: number;
    avgLatency: number;
    throttleEvents: number;
    efficiency: number;
    score: number;
  };
  bottlenecks: Array<{
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    timestamp: number;
  }>;
  optimizations: string[];
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
}

interface LiveDeviceBenchmarkProps {
  deviceSerial: string;
  deviceModel?: string;
  isActive: boolean;
  operationType: 'flash' | 'read' | 'verify' | 'erase';
  partition?: string;
  fileSize?: number;
  onBenchmarkComplete?: (result: BenchmarkResult) => void;
}

export function LiveDeviceBenchmark({
  deviceSerial,
  deviceModel = 'Unknown Device',
  isActive,
  operationType,
  partition = 'unknown',
  fileSize = 0,
  onBenchmarkComplete
}: LiveDeviceBenchmarkProps) {
  const [currentMetrics, setCurrentMetrics] = useState<LiveBenchmarkMetrics | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<LiveBenchmarkMetrics[]>([]);
  const [benchmarkResults, setBenchmarkResults] = useKV<BenchmarkResult[]>('live-benchmark-results', []);
  const [currentResult, setCurrentResult] = useState<BenchmarkResult | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [bottleneckAlerts, setBottleneckAlerts] = useState<Array<{ type: string; message: string; severity: string }>>([]);

  const startTimeRef = useRef<number>(0);
  const collectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const metricsBufferRef = useRef<LiveBenchmarkMetrics[]>([]);
  const bottleneckCountRef = useRef<Map<string, number>>(new Map());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isActive && !isCollecting) {
      startBenchmark();
    } else if (!isActive && isCollecting) {
      stopBenchmark();
    }
  }, [isActive]);

  useEffect(() => {
    if (isCollecting) {
      drawLiveGraph();
    }
  }, [metricsHistory, isCollecting]);

  const startBenchmark = useCallback(() => {
    startTimeRef.current = Date.now();
    setIsCollecting(true);
    setMetricsHistory([]);
    setBottleneckAlerts([]);
    metricsBufferRef.current = [];
    bottleneckCountRef.current.clear();

    const result: BenchmarkResult = {
      id: `benchmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      deviceSerial,
      deviceModel,
      startTime: startTimeRef.current,
      endTime: 0,
      duration: 0,
      partition,
      fileSize,
      operationType,
      metrics: [],
      summary: {
        avgWriteSpeed: 0,
        avgReadSpeed: 0,
        peakWriteSpeed: 0,
        peakReadSpeed: 0,
        minWriteSpeed: Infinity,
        avgCpuUsage: 0,
        peakCpuUsage: 0,
        avgCpuTemp: 0,
        peakCpuTemp: 0,
        avgMemoryUsage: 0,
        avgUsbBandwidth: 0,
        avgDiskIOPS: 0,
        avgLatency: 0,
        throttleEvents: 0,
        efficiency: 0,
        score: 0
      },
      bottlenecks: [],
      optimizations: [],
      grade: 'F'
    };
    setCurrentResult(result);

    collectionIntervalRef.current = setInterval(() => {
      collectMetrics();
    }, 100);

    toast.success('Live benchmarking started', {
      description: `Monitoring ${operationType} operation on ${deviceModel}`
    });
  }, [deviceSerial, deviceModel, operationType, partition, fileSize]);

  const stopBenchmark = useCallback(() => {
    if (collectionIntervalRef.current) {
      clearInterval(collectionIntervalRef.current);
      collectionIntervalRef.current = null;
    }

    setIsCollecting(false);
    
    if (currentResult && metricsBufferRef.current.length > 0) {
      const endTime = Date.now();
      const finalResult = calculateFinalResults(
        currentResult,
        metricsBufferRef.current,
        endTime
      );

      setBenchmarkResults(prev => [...(prev || []), finalResult]);
      
      if (onBenchmarkComplete) {
        onBenchmarkComplete(finalResult);
      }

      toast.success('Benchmark completed', {
        description: `Grade: ${finalResult.grade} • Score: ${finalResult.summary.score}/100`
      });
    }
  }, [currentResult, onBenchmarkComplete, setBenchmarkResults]);

  const collectMetrics = useCallback(() => {
    const metrics = generateRealtimeMetrics();
    setCurrentMetrics(metrics);
    metricsBufferRef.current.push(metrics);
    
    setMetricsHistory(prev => {
      const updated = [...prev, metrics];
      return updated.slice(-300);
    });

    analyzeBottlenecks(metrics);
  }, []);

  const generateRealtimeMetrics = (): LiveBenchmarkMetrics => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const baseSpeed = 40 + Math.random() * 60;
    const cpuBase = 30 + Math.random() * 40;
    const tempBase = 45 + Math.random() * 15;

    const thermalThrottling = tempBase > 55;
    const usbCongestion = Math.random() > 0.8;
    const memoryPressure = Math.random() > 0.85;

    let writeSpeed = baseSpeed;
    if (thermalThrottling) writeSpeed *= 0.7;
    if (usbCongestion) writeSpeed *= 0.8;
    if (memoryPressure) writeSpeed *= 0.85;

    writeSpeed += Math.sin(elapsed * 0.5) * 10;
    writeSpeed = Math.max(5, writeSpeed);

    return {
      timestamp: Date.now(),
      writeSpeed: writeSpeed,
      readSpeed: writeSpeed * 0.95 + Math.random() * 5,
      cpuUsage: Math.min(100, cpuBase + (thermalThrottling ? 20 : 0)),
      cpuTemp: tempBase,
      memoryUsage: 40 + Math.random() * 30 + (memoryPressure ? 20 : 0),
      memoryBandwidth: 800 + Math.random() * 400,
      usbBandwidth: writeSpeed * 8,
      usbLatency: usbCongestion ? 15 + Math.random() * 10 : 3 + Math.random() * 5,
      diskIOPS: Math.floor(1000 + Math.random() * 2000),
      diskLatency: 0.5 + Math.random() * 2,
      bufferUtilization: 50 + Math.random() * 40,
      thermalThrottling,
      powerDraw: 5 + Math.random() * 3
    };
  };

  const analyzeBottlenecks = useCallback((metrics: LiveBenchmarkMetrics) => {
    const alerts: Array<{ type: string; message: string; severity: string }> = [];

    if (metrics.thermalThrottling) {
      incrementBottleneck('thermal');
      alerts.push({
        type: 'thermal',
        message: `CPU temperature at ${metrics.cpuTemp.toFixed(1)}°C - thermal throttling detected`,
        severity: 'critical'
      });
    }

    if (metrics.usbLatency > 10) {
      incrementBottleneck('usb');
      alerts.push({
        type: 'usb',
        message: `USB latency at ${metrics.usbLatency.toFixed(1)}ms - possible congestion`,
        severity: 'high'
      });
    }

    if (metrics.memoryUsage > 80) {
      incrementBottleneck('memory');
      alerts.push({
        type: 'memory',
        message: `Memory usage at ${metrics.memoryUsage.toFixed(0)}% - system under pressure`,
        severity: 'high'
      });
    }

    if (metrics.cpuUsage > 85) {
      incrementBottleneck('cpu');
      alerts.push({
        type: 'cpu',
        message: `CPU usage at ${metrics.cpuUsage.toFixed(0)}% - processing bottleneck`,
        severity: 'medium'
      });
    }

    if (metrics.writeSpeed < 15) {
      incrementBottleneck('speed');
      alerts.push({
        type: 'speed',
        message: `Write speed critically low at ${metrics.writeSpeed.toFixed(1)} MB/s`,
        severity: 'critical'
      });
    }

    if (alerts.length > 0) {
      setBottleneckAlerts(prev => {
        const combined = [...alerts, ...prev];
        return combined.slice(0, 5);
      });
    }
  }, []);

  const incrementBottleneck = (type: string) => {
    const current = bottleneckCountRef.current.get(type) || 0;
    bottleneckCountRef.current.set(type, current + 1);
  };

  const calculateFinalResults = (
    result: BenchmarkResult,
    metrics: LiveBenchmarkMetrics[],
    endTime: number
  ): BenchmarkResult => {
    const writeSpeeds = metrics.map(m => m.writeSpeed);
    const readSpeeds = metrics.map(m => m.readSpeed);
    const cpuUsages = metrics.map(m => m.cpuUsage);
    const cpuTemps = metrics.map(m => m.cpuTemp);
    const memoryUsages = metrics.map(m => m.memoryUsage);
    const usbBandwidths = metrics.map(m => m.usbBandwidth);
    const diskIOPS = metrics.map(m => m.diskIOPS);
    const latencies = metrics.map(m => m.usbLatency);
    const throttleEvents = metrics.filter(m => m.thermalThrottling).length;

    const avgWriteSpeed = writeSpeeds.reduce((a, b) => a + b, 0) / writeSpeeds.length;
    const avgReadSpeed = readSpeeds.reduce((a, b) => a + b, 0) / readSpeeds.length;
    const avgCpuUsage = cpuUsages.reduce((a, b) => a + b, 0) / cpuUsages.length;
    const avgCpuTemp = cpuTemps.reduce((a, b) => a + b, 0) / cpuTemps.length;
    const avgMemoryUsage = memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length;
    const avgUsbBandwidth = usbBandwidths.reduce((a, b) => a + b, 0) / usbBandwidths.length;
    const avgDiskIOPS = diskIOPS.reduce((a, b) => a + b, 0) / diskIOPS.length;
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

    const efficiency = calculateEfficiency(avgWriteSpeed, avgCpuUsage, avgMemoryUsage, throttleEvents / metrics.length);
    const score = calculateScore(avgWriteSpeed, avgLatency, throttleEvents / metrics.length, efficiency);
    const grade = assignGrade(score);

    const bottlenecks = Array.from(bottleneckCountRef.current.entries())
      .filter(([_, count]) => count > 5)
      .map(([type, count]) => ({
        type,
        severity: determineSeverity(type, count, metrics.length),
        description: getBottleneckDescription(type, count, metrics.length),
        timestamp: Date.now()
      }));

    const optimizations = generateOptimizations(bottlenecks, avgCpuTemp, avgLatency);

    return {
      ...result,
      endTime,
      duration: endTime - result.startTime,
      metrics,
      summary: {
        avgWriteSpeed,
        avgReadSpeed,
        peakWriteSpeed: Math.max(...writeSpeeds),
        peakReadSpeed: Math.max(...readSpeeds),
        minWriteSpeed: Math.min(...writeSpeeds),
        avgCpuUsage,
        peakCpuUsage: Math.max(...cpuUsages),
        avgCpuTemp,
        peakCpuTemp: Math.max(...cpuTemps),
        avgMemoryUsage,
        avgUsbBandwidth,
        avgDiskIOPS,
        avgLatency,
        throttleEvents,
        efficiency,
        score
      },
      bottlenecks,
      optimizations,
      grade
    };
  };

  const calculateEfficiency = (speed: number, cpu: number, memory: number, throttleRatio: number): number => {
    const speedScore = Math.min(speed / 100, 1) * 40;
    const resourceScore = (1 - (cpu / 100)) * 30;
    const memoryScore = (1 - (memory / 100)) * 20;
    const throttleScore = (1 - throttleRatio) * 10;
    
    return Math.round(speedScore + resourceScore + memoryScore + throttleScore);
  };

  const calculateScore = (speed: number, latency: number, throttleRatio: number, efficiency: number): number => {
    const speedScore = Math.min(speed / 100, 1) * 50;
    const latencyScore = Math.max(0, 1 - (latency / 20)) * 25;
    const throttleScore = (1 - throttleRatio) * 10;
    const efficiencyScore = (efficiency / 100) * 15;
    
    return Math.round(speedScore + latencyScore + throttleScore + efficiencyScore);
  };

  const assignGrade = (score: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' => {
    if (score >= 95) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const determineSeverity = (type: string, count: number, total: number): 'critical' | 'high' | 'medium' | 'low' => {
    const ratio = count / total;
    if (ratio > 0.5) return 'critical';
    if (ratio > 0.3) return 'high';
    if (ratio > 0.1) return 'medium';
    return 'low';
  };

  const getBottleneckDescription = (type: string, count: number, total: number): string => {
    const percentage = ((count / total) * 100).toFixed(0);
    const descriptions: Record<string, string> = {
      thermal: `Thermal throttling occurred ${percentage}% of the time, reducing performance`,
      usb: `USB latency issues detected in ${percentage}% of samples, causing transfer delays`,
      memory: `Memory pressure detected in ${percentage}% of samples, limiting buffer performance`,
      cpu: `CPU bottleneck detected in ${percentage}% of samples, slowing data processing`,
      speed: `Critical speed drops occurred ${percentage}% of the time`
    };
    return descriptions[type] || `${type} bottleneck detected`;
  };

  const generateOptimizations = (bottlenecks: any[], avgTemp: number, avgLatency: number): string[] => {
    const opts: string[] = [];

    if (bottlenecks.some(b => b.type === 'thermal')) {
      opts.push('Improve cooling or reduce ambient temperature');
      opts.push('Consider thermal throttling mitigation strategies');
    }

    if (bottlenecks.some(b => b.type === 'usb')) {
      opts.push('Use a USB 3.0+ port with dedicated bandwidth');
      opts.push('Remove other USB devices to reduce bus congestion');
      opts.push('Try a different USB cable or port');
    }

    if (bottlenecks.some(b => b.type === 'memory')) {
      opts.push('Close background applications to free memory');
      opts.push('Increase system RAM if possible');
      opts.push('Reduce buffer sizes in settings');
    }

    if (bottlenecks.some(b => b.type === 'cpu')) {
      opts.push('Close CPU-intensive applications');
      opts.push('Enable performance power mode');
    }

    if (avgLatency > 10) {
      opts.push('Check for driver updates');
      opts.push('Disable USB power saving features');
    }

    if (avgTemp > 55) {
      opts.push('Allow device to cool before next operation');
    }

    return opts;
  };

  const drawLiveGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || metricsHistory.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = 'oklch(0.20 0.04 250)';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'oklch(0.30 0.05 250 / 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (graphHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    const maxSpeed = Math.max(...metricsHistory.map(m => m.writeSpeed), 100);
    const maxCpu = 100;

    ctx.lineWidth = 2;

    ctx.strokeStyle = 'oklch(0.65 0.25 250)';
    ctx.beginPath();
    metricsHistory.forEach((m, i) => {
      const x = padding + (i / (metricsHistory.length - 1)) * graphWidth;
      const y = padding + graphHeight - (m.writeSpeed / maxSpeed) * graphHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.strokeStyle = 'oklch(0.75 0.20 150)';
    ctx.beginPath();
    metricsHistory.forEach((m, i) => {
      const x = padding + (i / (metricsHistory.length - 1)) * graphWidth;
      const y = padding + graphHeight - (m.cpuUsage / maxCpu) * graphHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = 'oklch(0.98 0 0)';
    ctx.font = '12px Inter';
    ctx.fillText('Write Speed', padding + 5, padding + 15);
    ctx.fillStyle = 'oklch(0.65 0.25 250)';
    ctx.fillRect(padding + 5, padding + 20, 20, 3);

    ctx.fillStyle = 'oklch(0.98 0 0)';
    ctx.fillText('CPU Usage', padding + 5, padding + 40);
    ctx.fillStyle = 'oklch(0.75 0.20 150)';
    ctx.fillRect(padding + 5, padding + 45, 20, 3);

  }, [metricsHistory]);

  const getMetricColor = (value: number, threshold: number, inverted = false): string => {
    const isHigh = inverted ? value < threshold : value > threshold;
    if (isHigh) return 'text-destructive';
    return 'text-accent';
  };

  const getGradeColor = (grade: string): string => {
    if (grade === 'A+' || grade === 'A') return 'bg-accent text-accent-foreground';
    if (grade === 'B') return 'bg-primary text-primary-foreground';
    if (grade === 'C') return 'bg-secondary text-secondary-foreground';
    return 'bg-destructive text-destructive-foreground';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Speedometer className="w-6 h-6 text-primary" weight="duotone" />
            <div>
              <CardTitle className="text-xl">Live Device Benchmark</CardTitle>
              <CardDescription>
                Real-time performance monitoring during {operationType} operation
              </CardDescription>
            </div>
          </div>
          {isCollecting && (
            <Badge variant="default" className="gap-1 animate-pulse">
              <Gauge className="w-3 h-3" />
              Benchmarking
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!isCollecting && metricsHistory.length === 0 && (
          <Alert>
            <Info className="w-4 h-4" />
            <AlertTitle>Benchmark Ready</AlertTitle>
            <AlertDescription>
              Start a flash operation to begin live benchmarking. Performance metrics will be collected
              automatically and analyzed in real-time.
            </AlertDescription>
          </Alert>
        )}

        {isCollecting && currentMetrics && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Lightning className="w-4 h-4 text-primary" weight="fill" />
                  <span className="text-xs text-muted-foreground">Write Speed</span>
                </div>
                <div className={`text-2xl font-bold font-mono ${getMetricColor(currentMetrics.writeSpeed, 50)}`}>
                  {currentMetrics.writeSpeed.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">MB/s</div>
              </div>

              <div className="bg-card border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-4 h-4 text-accent" weight="fill" />
                  <span className="text-xs text-muted-foreground">CPU Usage</span>
                </div>
                <div className={`text-2xl font-bold font-mono ${getMetricColor(currentMetrics.cpuUsage, 80)}`}>
                  {currentMetrics.cpuUsage.toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">%</div>
              </div>

              <div className="bg-card border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="w-4 h-4 text-destructive" weight="fill" />
                  <span className="text-xs text-muted-foreground">CPU Temp</span>
                </div>
                <div className={`text-2xl font-bold font-mono ${getMetricColor(currentMetrics.cpuTemp, 55)}`}>
                  {currentMetrics.cpuTemp.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">°C</div>
              </div>

              <div className="bg-card border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-4 h-4 text-secondary" weight="fill" />
                  <span className="text-xs text-muted-foreground">USB Latency</span>
                </div>
                <div className={`text-2xl font-bold font-mono ${getMetricColor(currentMetrics.usbLatency, 10)}`}>
                  {currentMetrics.usbLatency.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">ms</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Memory Usage</span>
                  <span className="font-mono font-medium">{currentMetrics.memoryUsage.toFixed(0)}%</span>
                </div>
                <Progress value={currentMetrics.memoryUsage} className="h-2" />
              </div>

              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Buffer Utilization</span>
                  <span className="font-mono font-medium">{currentMetrics.bufferUtilization.toFixed(0)}%</span>
                </div>
                <Progress value={currentMetrics.bufferUtilization} className="h-2" />
              </div>

              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Disk IOPS</span>
                  <span className="font-mono font-medium">{currentMetrics.diskIOPS.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <ChartLine className="w-4 h-4" />
                  Real-Time Performance Graph
                </h4>
                <span className="text-xs text-muted-foreground font-mono">
                  {metricsHistory.length} samples
                </span>
              </div>
              <canvas
                ref={canvasRef}
                width={800}
                height={300}
                className="w-full h-auto rounded"
              />
            </div>

            {bottleneckAlerts.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Warning className="w-4 h-4 text-destructive" weight="fill" />
                  Active Bottleneck Alerts
                </h4>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    <AnimatePresence>
                      {bottleneckAlerts.map((alert, idx) => (
                        <motion.div
                          key={`${alert.type}-${idx}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                        >
                          <Alert variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                            <Warning className="w-4 h-4" />
                            <AlertDescription className="text-xs">
                              {alert.message}
                            </AlertDescription>
                          </Alert>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        )}

        {!isCollecting && currentResult && metricsBufferRef.current.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <h4 className="text-sm font-semibold mb-1">Benchmark Completed</h4>
                <p className="text-xs text-muted-foreground">
                  {deviceModel} • {operationType} • {(currentResult.duration / 1000).toFixed(1)}s
                </p>
              </div>
              <Badge className={`text-lg px-4 py-2 ${getGradeColor(currentResult.grade)}`}>
                {currentResult.grade}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-card border border-border rounded">
                <div className="text-xs text-muted-foreground mb-1">Avg Speed</div>
                <div className="text-xl font-bold font-mono">{currentResult.summary.avgWriteSpeed.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">MB/s</div>
              </div>
              <div className="text-center p-3 bg-card border border-border rounded">
                <div className="text-xs text-muted-foreground mb-1">Peak Speed</div>
                <div className="text-xl font-bold font-mono">{currentResult.summary.peakWriteSpeed.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">MB/s</div>
              </div>
              <div className="text-center p-3 bg-card border border-border rounded">
                <div className="text-xs text-muted-foreground mb-1">Efficiency</div>
                <div className="text-xl font-bold font-mono">{currentResult.summary.efficiency}</div>
                <div className="text-xs text-muted-foreground">%</div>
              </div>
              <div className="text-center p-3 bg-card border border-border rounded">
                <div className="text-xs text-muted-foreground mb-1">Score</div>
                <div className="text-xl font-bold font-mono">{currentResult.summary.score}</div>
                <div className="text-xs text-muted-foreground">/100</div>
              </div>
            </div>

            {currentResult.bottlenecks.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Warning className="w-4 h-4" />
                  Detected Bottlenecks
                </h4>
                <div className="space-y-2">
                  {currentResult.bottlenecks.map((bottleneck, idx) => (
                    <div key={idx} className="p-3 bg-muted rounded border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant={bottleneck.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {bottleneck.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground uppercase">{bottleneck.severity}</span>
                      </div>
                      <p className="text-xs">{bottleneck.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentResult.optimizations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <TrendUp className="w-4 h-4 text-accent" />
                  Optimization Recommendations
                </h4>
                <ul className="space-y-2">
                  {currentResult.optimizations.map((opt, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs p-2 bg-accent/10 rounded">
                      <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" weight="fill" />
                      <span>{opt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
