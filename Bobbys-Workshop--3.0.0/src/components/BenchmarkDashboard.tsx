import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChartBar,
  TrendUp,
  TrendDown,
  Gauge,
  Lightning,
  Timer,
  Thermometer,
  Target,
  Trophy
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import type { BenchmarkResult } from './LiveDeviceBenchmark';
import { motion } from 'framer-motion';

interface DevicePerformanceTrend {
  deviceSerial: string;
  deviceModel: string;
  totalBenchmarks: number;
  averageScore: number;
  bestGrade: string;
  averageSpeed: number;
  trend: 'improving' | 'declining' | 'stable';
  recentResults: BenchmarkResult[];
}

export function BenchmarkDashboard() {
  const [benchmarkResults] = useKV<BenchmarkResult[]>('live-benchmark-results', []);
  const [deviceTrends, setDeviceTrends] = useState<DevicePerformanceTrend[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  useEffect(() => {
    if (benchmarkResults && benchmarkResults.length > 0) {
      calculateDeviceTrends();
    }
  }, [benchmarkResults]);

  const calculateDeviceTrends = () => {
    const deviceMap = new Map<string, BenchmarkResult[]>();
    
    (benchmarkResults || []).forEach(result => {
      const existing = deviceMap.get(result.deviceSerial) || [];
      deviceMap.set(result.deviceSerial, [...existing, result]);
    });

    const trends: DevicePerformanceTrend[] = Array.from(deviceMap.entries()).map(([serial, results]) => {
      const sorted = results.sort((a, b) => a.startTime - b.startTime);
      const scores = sorted.map(r => r.summary.score);
      const speeds = sorted.map(r => r.summary.avgWriteSpeed);
      
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
      
      const bestResult = results.reduce((best, current) => 
        current.summary.score > best.summary.score ? current : best
      );

      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (sorted.length >= 3) {
        const recentAvg = scores.slice(-3).reduce((a, b) => a + b, 0) / 3;
        const olderAvg = scores.slice(0, -3).reduce((a, b) => a + b, 0) / (scores.length - 3);
        if (recentAvg > olderAvg + 5) trend = 'improving';
        else if (recentAvg < olderAvg - 5) trend = 'declining';
      }

      return {
        deviceSerial: serial,
        deviceModel: sorted[0].deviceModel,
        totalBenchmarks: sorted.length,
        averageScore: Math.round(avgScore),
        bestGrade: bestResult.grade,
        averageSpeed: avgSpeed,
        trend,
        recentResults: sorted.slice(-10)
      };
    });

    setDeviceTrends(trends);
  };

  const getOverallStats = () => {
    if (!benchmarkResults || benchmarkResults.length === 0) {
      return {
        totalBenchmarks: 0,
        averageScore: 0,
        averageSpeed: 0,
        topDevices: []
      };
    }

    const scores = benchmarkResults.map(r => r.summary.score);
    const speeds = benchmarkResults.map(r => r.summary.avgWriteSpeed);
    
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;

    const topDevices = deviceTrends
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);

    return {
      totalBenchmarks: benchmarkResults.length,
      averageScore: avgScore,
      averageSpeed: avgSpeed,
      topDevices
    };
  };

  const stats = getOverallStats();
  const selectedDeviceData = selectedDevice 
    ? deviceTrends.find(d => d.deviceSerial === selectedDevice)
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <ChartBar className="w-6 h-6 text-primary" weight="duotone" />
            <div>
              <CardTitle className="text-xl">Benchmark Analytics Dashboard</CardTitle>
              <CardDescription>
                Historical performance trends and device comparisons
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Total Benchmarks</span>
                </div>
                <div className="text-3xl font-bold font-mono">{stats.totalBenchmarks}</div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-accent" />
                  <span className="text-xs text-muted-foreground">Avg Score</span>
                </div>
                <div className="text-3xl font-bold font-mono">{stats.averageScore}</div>
                <div className="text-xs text-muted-foreground">/100</div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightning className="w-4 h-4 text-primary" weight="fill" />
                  <span className="text-xs text-muted-foreground">Avg Speed</span>
                </div>
                <div className="text-3xl font-bold font-mono">{stats.averageSpeed.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">MB/s</div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-accent" weight="fill" />
                  <span className="text-xs text-muted-foreground">Top Devices</span>
                </div>
                <div className="text-3xl font-bold font-mono">{stats.topDevices.length}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="devices" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="devices">Device Rankings</TabsTrigger>
              <TabsTrigger value="details">Device Details</TabsTrigger>
            </TabsList>

            <TabsContent value="devices" className="mt-4">
              <ScrollArea className="h-96">
                <div className="space-y-3 pr-4">
                  {deviceTrends.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No benchmark data available yet
                    </div>
                  ) : (
                    deviceTrends
                      .sort((a, b) => b.averageScore - a.averageScore)
                      .map((device, index) => (
                        <motion.div
                          key={device.deviceSerial}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card 
                            className={`cursor-pointer transition-all hover:border-primary ${
                              selectedDevice === device.deviceSerial ? 'border-primary shadow-lg' : ''
                            }`}
                            onClick={() => setSelectedDevice(device.deviceSerial)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
                                    #{index + 1}
                                  </div>
                                  <div>
                                    <div className="font-semibold">{device.deviceModel}</div>
                                    <div className="text-xs text-muted-foreground font-mono">
                                      {device.deviceSerial}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {device.trend === 'improving' && (
                                    <TrendUp className="w-4 h-4 text-accent" weight="bold" />
                                  )}
                                  {device.trend === 'declining' && (
                                    <TrendDown className="w-4 h-4 text-destructive" weight="bold" />
                                  )}
                                  <Badge className={
                                    device.bestGrade === 'A+' || device.bestGrade === 'A' 
                                      ? 'bg-accent text-accent-foreground' 
                                      : 'bg-secondary text-secondary-foreground'
                                  }>
                                    {device.bestGrade}
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-3 text-xs">
                                <div>
                                  <div className="text-muted-foreground mb-1">Benchmarks</div>
                                  <div className="font-mono font-medium">{device.totalBenchmarks}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground mb-1">Avg Score</div>
                                  <div className="font-mono font-medium">{device.averageScore}/100</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground mb-1">Avg Speed</div>
                                  <div className="font-mono font-medium">{device.averageSpeed.toFixed(1)} MB/s</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              {selectedDeviceData ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{selectedDeviceData.deviceModel}</CardTitle>
                      <CardDescription className="font-mono">
                        {selectedDeviceData.deviceSerial}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-muted rounded">
                          <div className="text-xs text-muted-foreground mb-1">Total Runs</div>
                          <div className="text-2xl font-bold font-mono">{selectedDeviceData.totalBenchmarks}</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded">
                          <div className="text-xs text-muted-foreground mb-1">Avg Score</div>
                          <div className="text-2xl font-bold font-mono">{selectedDeviceData.averageScore}</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded">
                          <div className="text-xs text-muted-foreground mb-1">Best Grade</div>
                          <div className="text-2xl font-bold font-mono">{selectedDeviceData.bestGrade}</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded">
                          <div className="text-xs text-muted-foreground mb-1">Trend</div>
                          <div className="text-2xl font-bold font-mono flex items-center justify-center gap-1">
                            {selectedDeviceData.trend === 'improving' && (
                              <>
                                <TrendUp className="w-5 h-5 text-accent" weight="bold" />
                                <span className="text-accent">UP</span>
                              </>
                            )}
                            {selectedDeviceData.trend === 'declining' && (
                              <>
                                <TrendDown className="w-5 h-5 text-destructive" weight="bold" />
                                <span className="text-destructive">DOWN</span>
                              </>
                            )}
                            {selectedDeviceData.trend === 'stable' && (
                              <span className="text-muted-foreground">STABLE</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold mb-3">Recent Benchmark History</h4>
                        <ScrollArea className="h-64">
                          <div className="space-y-2 pr-4">
                            {selectedDeviceData.recentResults.slice().reverse().map((result) => (
                              <div key={result.id} className="p-3 bg-muted rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(result.startTime).toLocaleString()}
                                  </div>
                                  <Badge className={
                                    result.grade === 'A+' || result.grade === 'A' 
                                      ? 'bg-accent text-accent-foreground' 
                                      : 'bg-secondary text-secondary-foreground'
                                  }>
                                    {result.grade}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-4 gap-2 text-xs">
                                  <div>
                                    <div className="text-muted-foreground">Partition</div>
                                    <div className="font-mono font-medium">{result.partition}</div>
                                  </div>
                                  <div>
                                    <div className="text-muted-foreground">Speed</div>
                                    <div className="font-mono font-medium">{result.summary.avgWriteSpeed.toFixed(1)} MB/s</div>
                                  </div>
                                  <div>
                                    <div className="text-muted-foreground">Score</div>
                                    <div className="font-mono font-medium">{result.summary.score}/100</div>
                                  </div>
                                  <div>
                                    <div className="text-muted-foreground">Duration</div>
                                    <div className="font-mono font-medium">{(result.duration / 1000).toFixed(1)}s</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Select a device from the rankings to view detailed information
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
