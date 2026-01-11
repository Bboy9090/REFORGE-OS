import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Play,
  Stop,
  Lightning,
  ChartBar,
  Database,
  Info,
  CheckCircle,
  Warning,
  Gauge
} from '@phosphor-icons/react';
import { LiveDeviceBenchmark, type BenchmarkResult } from './LiveDeviceBenchmark';
import { useLiveBenchmark } from '@/hooks/use-live-benchmark';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashOperation {
  id: string;
  partition: string;
  fileName: string;
  fileSize: number;
  status: 'pending' | 'active' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export function BenchmarkedFlashingPanel() {
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [deviceModel, setDeviceModel] = useState<string>('Unknown Device');
  const [operations, setOperations] = useState<FlashOperation[]>([]);
  const [currentOperation, setCurrentOperation] = useState<FlashOperation | null>(null);
  const [simulationRunning, setSimulationRunning] = useState(false);
  
  const {
    activeBenchmark,
    benchmarkResults,
    startBenchmark,
    stopBenchmark,
    handleBenchmarkComplete,
    getDeviceHistory,
    getAverageScore,
    getBestResult
  } = useLiveBenchmark();

  useEffect(() => {
    if (!simulationRunning || operations.length === 0) return;

    const nextPending = operations.find(op => op.status === 'pending');
    if (!nextPending) {
      setSimulationRunning(false);
      toast.success('All flash operations completed');
      return;
    }

    setCurrentOperation(nextPending);
    setOperations(prev => prev.map(op => 
      op.id === nextPending.id ? { ...op, status: 'active' as const } : op
    ));

    startBenchmark(
      selectedDevice || 'TEST-DEVICE-001',
      deviceModel,
      'flash',
      nextPending.partition,
      nextPending.fileSize
    );

    const progressInterval = setInterval(() => {
      setOperations(prev => prev.map(op => {
        if (op.id === nextPending.id && op.status === 'active') {
          const newProgress = Math.min(op.progress + 5, 100);
          return { ...op, progress: newProgress };
        }
        return op;
      }));
    }, 200);

    const completeTimeout = setTimeout(() => {
      clearInterval(progressInterval);
      setOperations(prev => prev.map(op =>
        op.id === nextPending.id ? { ...op, status: 'completed' as const, progress: 100 } : op
      ));
      stopBenchmark();
      setCurrentOperation(null);
    }, 4000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimeout);
    };
  }, [simulationRunning, operations, selectedDevice, deviceModel, startBenchmark, stopBenchmark]);

  const handleStartSimulation = () => {
    const demoOperations: FlashOperation[] = [
      {
        id: 'op-1',
        partition: 'boot',
        fileName: 'boot.img',
        fileSize: 67108864,
        status: 'pending',
        progress: 0
      },
      {
        id: 'op-2',
        partition: 'system',
        fileName: 'system.img',
        fileSize: 2147483648,
        status: 'pending',
        progress: 0
      },
      {
        id: 'op-3',
        partition: 'vendor',
        fileName: 'vendor.img',
        fileSize: 536870912,
        status: 'pending',
        progress: 0
      }
    ];

    setOperations(demoOperations);
    setSelectedDevice('TEST-DEVICE-001');
    setDeviceModel('Pixel 7 Pro');
    setSimulationRunning(true);
    toast.success('Starting benchmarked flash operations');
  };

  const handleStopSimulation = () => {
    setSimulationRunning(false);
    stopBenchmark();
    setCurrentOperation(null);
    toast.info('Flash operations stopped');
  };

  const deviceHistory = selectedDevice ? getDeviceHistory(selectedDevice) : [];
  const avgScore = selectedDevice ? getAverageScore(selectedDevice) : 0;
  const bestResult = selectedDevice ? getBestResult(selectedDevice) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gauge className="w-6 h-6 text-primary" weight="duotone" />
              <div>
                <CardTitle className="text-xl">Benchmarked Flash Operations</CardTitle>
                <CardDescription>
                  Flash firmware with real-time performance monitoring and analysis
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!simulationRunning ? (
                <Button onClick={handleStartSimulation} className="gap-2">
                  <Play className="w-4 h-4" weight="fill" />
                  Start Demo Flash
                </Button>
              ) : (
                <Button onClick={handleStopSimulation} variant="destructive" className="gap-2">
                  <Stop className="w-4 h-4" weight="fill" />
                  Stop Operations
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs defaultValue="operations" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="operations" className="gap-2">
                <Database className="w-4 h-4" />
                Operations
              </TabsTrigger>
              <TabsTrigger value="benchmark" className="gap-2">
                <Lightning className="w-4 h-4" />
                Live Benchmark
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <ChartBar className="w-4 h-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="operations" className="space-y-4 mt-4">
              {operations.length === 0 ? (
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertTitle>No Operations Queued</AlertTitle>
                  <AlertDescription>
                    Click "Start Demo Flash" to simulate a batch flashing operation with live benchmarking.
                  </AlertDescription>
                </Alert>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3 pr-4">
                    <AnimatePresence>
                      {operations.map((op) => (
                        <motion.div
                          key={op.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <Card className={op.status === 'active' ? 'border-primary shadow-lg' : ''}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <div className="font-semibold font-mono text-sm">
                                    {op.partition}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {op.fileName} • {(op.fileSize / 1024 / 1024).toFixed(1)} MB
                                  </div>
                                </div>
                                <Badge variant={
                                  op.status === 'completed' ? 'default' :
                                  op.status === 'active' ? 'default' :
                                  op.status === 'error' ? 'destructive' :
                                  'secondary'
                                }>
                                  {op.status === 'active' && <Gauge className="w-3 h-3 mr-1 animate-spin" />}
                                  {op.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" weight="fill" />}
                                  {op.status === 'error' && <Warning className="w-3 h-3 mr-1" weight="fill" />}
                                  {op.status}
                                </Badge>
                              </div>
                              {op.status !== 'pending' && (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-mono font-medium">{op.progress}%</span>
                                  </div>
                                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <motion.div
                                      className="h-full bg-primary"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${op.progress}%` }}
                                      transition={{ duration: 0.3 }}
                                    />
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="benchmark" className="mt-4">
              {activeBenchmark && currentOperation ? (
                <LiveDeviceBenchmark
                  deviceSerial={activeBenchmark.deviceSerial}
                  deviceModel={activeBenchmark.deviceModel}
                  isActive={true}
                  operationType={activeBenchmark.operationType}
                  partition={currentOperation.partition}
                  fileSize={currentOperation.fileSize}
                  onBenchmarkComplete={handleBenchmarkComplete}
                />
              ) : (
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertTitle>No Active Benchmark</AlertTitle>
                  <AlertDescription>
                    Start a flash operation to see live performance benchmarking in action.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-4">
              {benchmarkResults.length === 0 ? (
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertTitle>No Benchmark History</AlertTitle>
                  <AlertDescription>
                    Complete flash operations to build benchmark history and track performance trends.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground mb-1">Total Benchmarks</div>
                        <div className="text-2xl font-bold font-mono">{benchmarkResults.length}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground mb-1">Average Score</div>
                        <div className="text-2xl font-bold font-mono">{avgScore}/100</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground mb-1">Best Grade</div>
                        <div className="text-2xl font-bold font-mono">{bestResult?.grade || 'N/A'}</div>
                      </CardContent>
                    </Card>
                  </div>

                  <ScrollArea className="h-96">
                    <div className="space-y-3 pr-4">
                      {benchmarkResults.slice().reverse().map((result) => (
                        <Card key={result.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div className="font-semibold text-sm">{result.deviceModel}</div>
                                <div className="text-xs text-muted-foreground">
                                  {result.operationType} • {result.partition} • {new Date(result.startTime).toLocaleString()}
                                </div>
                              </div>
                              <Badge className={
                                result.grade === 'A+' || result.grade === 'A' ? 'bg-accent text-accent-foreground' :
                                result.grade === 'B' ? 'bg-primary text-primary-foreground' :
                                'bg-secondary text-secondary-foreground'
                              }>
                                {result.grade}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-xs">
                              <div>
                                <div className="text-muted-foreground">Avg Speed</div>
                                <div className="font-mono font-medium">{result.summary.avgWriteSpeed.toFixed(1)} MB/s</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Efficiency</div>
                                <div className="font-mono font-medium">{result.summary.efficiency}%</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Score</div>
                                <div className="font-mono font-medium">{result.summary.score}/100</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
