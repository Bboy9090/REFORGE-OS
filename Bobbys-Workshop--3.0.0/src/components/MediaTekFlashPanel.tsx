import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Cpu,
  FileArrowUp,
  Lightning,
  Warning,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Stop,
  FloppyDisk,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useFlashProgressWebSocket } from '@/hooks/use-flash-progress-websocket';
import { useApp } from '@/lib/app-context';
import { API_CONFIG, getWSUrl } from '@/lib/apiConfig';

interface MTKDevice {
  id: string;
  name: string;
  chipset: string;
  port: string;
  mode: 'preloader' | 'vcom' | 'unknown';
  detected: boolean;
}

interface MTKFlashJob {
  jobId: string;
  deviceId: string;
  scatterPath: string;
  images: string[];
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  stage: string;
}

export function MediaTekFlashPanel() {
  const [devices, setDevices] = useState<MTKDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [scatterFile, setScatterFile] = useState<string>('');
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [currentJob, setCurrentJob] = useState<MTKFlashJob | null>(null);
  const { isDemoMode } = useApp();

  const {
    isConnected,
    connectionStatus,
    activeJobs,
    connect,
    disconnect,
    send,
  } = useFlashProgressWebSocket({
    url: getWSUrl('/ws/flash-progress'),
    enableNotifications: true,
    autoConnect: true,
  });

  const scanDevices = async () => {
    setIsScanning(true);
    try {
      // Try to call backend API first
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/mtk/scan`);
      if (response.ok) {
        const data = await response.json();
        if (data.devices && data.devices.length > 0) {
          setDevices(data.devices);
          toast.success('MTK device scan complete', {
            description: `Found ${data.devices.length} MediaTek device(s)`,
          });
        } else {
          setDevices([]);
          toast.info('No MediaTek devices found');
        }
      } else {
        throw new Error('Backend unavailable');
      }
    } catch (error) {
      // Fall back to demo mode if available
      console.warn('[MediaTekFlashPanel] Backend scan failed:', error);
      if (isDemoMode) {
        const demoDevices: MTKDevice[] = [
          {
            id: '[DEMO] mtk-001',
            name: '[DEMO] MediaTek MT6765 (Helio P35)',
            chipset: 'MT6765',
            port: 'COM3',
            mode: 'preloader',
            detected: true,
          },
        ];

        await new Promise(resolve => setTimeout(resolve, 1500));
        setDevices(demoDevices);
        toast.info('Running in demo mode with simulated devices');
      } else {
        setDevices([]);
        toast.error('Device scan failed', {
          description: 'Backend API unavailable - cannot scan for MediaTek devices',
        });
      }
    } finally {
      setIsScanning(false);
    }
  };

  const validateScatterFile = (path: string): boolean => {
    if (!path.toLowerCase().endsWith('.txt')) {
      toast.error('Invalid scatter file', {
        description: 'Scatter file must be a .txt file',
      });
      return false;
    }
    return true;
  };

  const startFlash = async () => {
    if (!selectedDevice) {
      toast.error('No device selected');
      return;
    }

    if (!scatterFile) {
      toast.error('Scatter file required', {
        description: 'Please specify the scatter file path',
      });
      return;
    }

    if (!validateScatterFile(scatterFile)) {
      return;
    }

    if (imageFiles.length === 0) {
      toast.error('No images selected', {
        description: 'Please add at least one firmware image',
      });
      return;
    }

    const jobId = `mtk-flash-${Date.now()}`;
    const newJob: MTKFlashJob = {
      jobId,
      deviceId: selectedDevice,
      scatterPath: scatterFile,
      images: imageFiles,
      status: 'pending',
      progress: 0,
      stage: 'Initializing',
    };

    setCurrentJob(newJob);

    send({
      type: 'flash_started',
      jobId,
      deviceId: selectedDevice,
      stage: 'MTK Flash: Initializing SP Flash Tool',
    });

    toast.info('MTK flash started', {
      description: 'SP Flash Tool operation initiated',
    });
  };

  const pauseFlash = () => {
    if (currentJob) {
      send({
        type: 'flash_paused',
        jobId: currentJob.jobId,
        deviceId: currentJob.deviceId,
      });
    }
  };

  const resumeFlash = () => {
    if (currentJob) {
      send({
        type: 'flash_resumed',
        jobId: currentJob.jobId,
        deviceId: currentJob.deviceId,
      });
    }
  };

  const stopFlash = () => {
    if (currentJob) {
      send({
        type: 'flash_failed',
        jobId: currentJob.jobId,
        deviceId: currentJob.deviceId,
        error: 'User cancelled operation',
      });
      setCurrentJob(null);
    }
  };

  const addImageFile = () => {
    const newImage = prompt('Enter firmware image path:');
    if (newImage) {
      setImageFiles(prev => [...prev, newImage]);
    }
  };

  const removeImageFile = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const activeJob = activeJobs.find(job => job.jobId === currentJob?.jobId);

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-linear-to-br from-card/90 to-card/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu className="w-10 h-10 text-primary" weight="duotone" />
              <div>
                <CardTitle className="text-2xl font-display">MediaTek SP Flash Tool</CardTitle>
                <CardDescription className="text-base mt-1">
                  Scatter-based flashing for MediaTek chipsets (Helio/Dimensity)
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {connectionStatus === 'connected' ? 'WS Connected' : 'WS Disconnected'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="flash" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="flash">Flash</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="monitor">Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="flash" className="space-y-4">
              <Alert>
                <Warning className="w-4 h-4" />
                <AlertTitle>Preloader Caution</AlertTitle>
                <AlertDescription>
                  Flashing preloader partitions can brick your device. Only proceed if you have a
                  valid backup and know what you're doing.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="device-select">Target Device</Label>
                  <select
                    id="device-select"
                    className="w-full px-3 py-2 bg-secondary/20 border border-border rounded-md"
                    value={selectedDevice || ''}
                    onChange={(e) => setSelectedDevice(e.target.value)}
                    disabled={devices.length === 0}
                  >
                    <option value="">Select a device...</option>
                    {devices.map(device => (
                      <option key={device.id} value={device.id}>
                        {device.name} ({device.port}) - {device.mode}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scatter-file">Scatter File (.txt)</Label>
                  <Input
                    id="scatter-file"
                    type="text"
                    placeholder="/path/to/MT6765_Android_scatter.txt"
                    value={scatterFile}
                    onChange={(e) => setScatterFile(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Firmware Images</Label>
                    <Button size="sm" variant="outline" onClick={addImageFile}>
                      <FileArrowUp className="w-4 h-4 mr-2" />
                      Add Image
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {imageFiles.length === 0 ? (
                      <div className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-md">
                        No images added yet
                      </div>
                    ) : (
                      imageFiles.map((img, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-secondary/20 rounded-md">
                          <span className="text-sm font-mono truncate flex-1">{img}</span>
                          <Button size="sm" variant="ghost" onClick={() => removeImageFile(idx)}>
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={startFlash}
                    disabled={!selectedDevice || !scatterFile || imageFiles.length === 0 || currentJob?.status === 'running'}
                    className="flex-1"
                  >
                    <Lightning className="w-4 h-4 mr-2" weight="fill" />
                    Start MTK Flash
                  </Button>
                  {currentJob?.status === 'running' && (
                    <>
                      <Button onClick={pauseFlash} variant="secondary">
                        <Pause className="w-4 h-4" />
                      </Button>
                      <Button onClick={stopFlash} variant="destructive">
                        <Stop className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {currentJob?.status === 'paused' && (
                    <Button onClick={resumeFlash} variant="secondary">
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="devices" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Detected: {devices.length} MediaTek device(s)
                </p>
                <Button onClick={scanDevices} disabled={isScanning}>
                  {isScanning ? 'Scanning...' : 'Scan Devices'}
                </Button>
              </div>

              {devices.length === 0 ? (
                <Alert>
                  <Cpu className="w-4 h-4" />
                  <AlertTitle>No devices detected</AlertTitle>
                  <AlertDescription>
                    Connect a MediaTek device in Preloader or VCOM mode and click "Scan Devices"
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {devices.map(device => (
                    <Card key={device.id} className="border-secondary/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{device.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Port: {device.port} • Mode: {device.mode}
                            </div>
                          </div>
                          <Badge variant={device.detected ? 'default' : 'secondary'}>
                            {device.detected ? 'Ready' : 'Unknown'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="monitor" className="space-y-4">
              {!currentJob && activeJobs.length === 0 ? (
                <Alert>
                  <Lightning className="w-4 h-4" />
                  <AlertTitle>No active flash operations</AlertTitle>
                  <AlertDescription>
                    Start a flash operation to monitor progress here
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {activeJob && (
                    <Card className="border-primary/30">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">Flash Progress</div>
                          <Badge variant={
                            activeJob.status === 'completed' ? 'default' :
                            activeJob.status === 'failed' ? 'destructive' :
                            activeJob.status === 'paused' ? 'secondary' :
                            'outline'
                          }>
                            {activeJob.status}
                          </Badge>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">{activeJob.stage}</span>
                            <span className="font-medium">{activeJob.progress}%</span>
                          </div>
                          <Progress value={activeJob.progress} className="h-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Speed: </span>
                            <span className="font-medium">{(activeJob.transferSpeed / 1024 / 1024).toFixed(2)} MB/s</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">ETA: </span>
                            <span className="font-medium">{Math.floor(activeJob.estimatedTimeRemaining / 60)}m {activeJob.estimatedTimeRemaining % 60}s</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="border-accent/30">
        <CardHeader>
          <CardTitle className="text-lg">About SP Flash Tool Integration</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            This panel provides a wrapper around MediaTek SP Flash Tool for scatter-based firmware flashing.
            It detects MediaTek devices via USB VID 0x0E8D and manages the flash process.
          </p>
          <p className="font-medium text-foreground">Supported Operations:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Scatter file validation and parsing</li>
            <li>Firmware image flashing (system, boot, recovery, etc.)</li>
            <li>Real-time progress monitoring via WebSocket</li>
            <li>Pause/Resume/Cancel flash operations</li>
          </ul>
          <p className="text-xs text-warning mt-3">
            ⚠️ Always backup your device before flashing. Incorrect firmware can permanently brick your device.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
