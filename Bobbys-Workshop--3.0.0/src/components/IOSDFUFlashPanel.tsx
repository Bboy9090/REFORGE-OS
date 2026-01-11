import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { DeviceStateGuide } from './DeviceStateGuide';
import { DeviceMobile, Lightning, ArrowsClockwise, Warning, AppleLogo } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useAudioNotifications } from '@/hooks/use-audio-notifications';
import { getAPIUrl, getWSUrl } from '@/lib/apiConfig';

interface IOSDevice {
  udid: string;
  mode: 'normal' | 'recovery' | 'dfu';
  name?: string;
  productType?: string;
  isDetected: boolean;
}

export function IOSDFUFlashPanel() {
  const [devices, setDevices] = useState<IOSDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [flashProgress, setFlashProgress] = useState(0);
  const [flashStatus, setFlashStatus] = useState<'idle' | 'flashing' | 'complete' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const { handleJobStart, handleJobError, handleJobComplete } = useAudioNotifications();

  const scanDevices = async () => {
    setScanning(true);
    setLogs(prev => [...prev, '[SCAN] Starting iOS device scan...']);
    
    try {
      const response = await fetch(getAPIUrl('/api/ios/scan'));
      const data = await response.json();
      
      if (data.devices && data.devices.length > 0) {
        setDevices(data.devices);
        setLogs(prev => [...prev, `[SCAN] Found ${data.devices.length} iOS device(s)`]);
        
        data.devices.forEach((device: IOSDevice) => {
          setLogs(prev => [...prev, `  └─ ${device.udid.substring(0, 16)}... [${device.mode.toUpperCase()}]`]);
        });
      } else {
        setDevices([]);
        setLogs(prev => [...prev, '[SCAN] No iOS devices detected']);
        toast.info('No iOS devices found. Connect device and try again.');
      }
    } catch (error) {
      setLogs(prev => [...prev, `[ERROR] Scan failed: ${error}`]);
      toast.error('Failed to scan for iOS devices. Check backend connection.');
    } finally {
      setScanning(false);
    }
  };

  const enterDFUMode = async (udid: string) => {
    setLogs(prev => [...prev, `[DFU] Preparing to enter DFU mode for ${udid.substring(0, 16)}...`]);
    toast.info('DFU Mode Entry', {
      description: 'Follow device prompts to enter DFU mode',
    });
    
    try {
      const response = await fetch(getAPIUrl('/api/ios/dfu/enter'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ udid }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLogs(prev => [...prev, '[DFU] Device entered DFU mode successfully']);
        toast.success('Device in DFU mode');
        scanDevices();
      } else {
        setLogs(prev => [...prev, `[DFU] Failed: ${data.message}`]);
        toast.error('Failed to enter DFU mode');
      }
    } catch (error) {
      setLogs(prev => [...prev, `[ERROR] DFU entry failed: ${error}`]);
      toast.error('DFU mode entry error');
    }
  };

  const startJailbreak = async (udid: string, tool: 'checkra1n' | 'palera1n') => {
    setFlashStatus('flashing');
    setFlashProgress(0);
    setLogs(prev => [...prev, `[JAILBREAK] Starting ${tool} for ${udid.substring(0, 16)}...`]);
    
    const jobId = `jb-${Date.now()}`;
    
    // Start audio atmosphere for jailbreak operation
    handleJobStart(jobId);
    
    try {
      const ws = new WebSocket(getWSUrl('/ws/flash'));
      
      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'flash.start',
          jobId,
          payload: {
            provider: 'ios',
            tool,
            udid,
          }
        }));
      };
      
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        
        if (msg.type === 'flash.progress') {
          setFlashProgress(msg.payload.pct);
          setLogs(prev => [...prev, `[${msg.payload.stage.toUpperCase()}] ${msg.payload.detail || ''}`]);
        } else if (msg.type === 'flash.log') {
          setLogs(prev => [...prev, msg.payload.line]);
        } else if (msg.type === 'flash.done') {
          setFlashStatus('complete');
          setFlashProgress(100);
          setLogs(prev => [...prev, '[COMPLETE] Jailbreak finished successfully']);
          toast.success('Jailbreak complete!');
          
          // Audio notification for successful completion
          handleJobComplete();
          
          ws.close();
        } else if (msg.type === 'flash.error') {
          setFlashStatus('error');
          setLogs(prev => [...prev, `[ERROR] ${msg.payload.message}`]);
          toast.error(`Jailbreak failed: ${msg.payload.message}`);
          
          // Audio notification for error
          handleJobError();
          
          ws.close();
        }
      };
      
      ws.onerror = () => {
        setFlashStatus('error');
        setLogs(prev => [...prev, '[ERROR] WebSocket connection failed']);
        toast.error('Connection error');
        
        // Audio notification for error
        handleJobError();
      };
      
    } catch (error) {
      setFlashStatus('error');
      setLogs(prev => [...prev, `[ERROR] ${error}`]);
      toast.error('Failed to start jailbreak');
      
      // Audio notification for error
      handleJobError();
    }
  };

  useEffect(() => {
    scanDevices();
    const interval = setInterval(scanDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  const dfuModeInstructions = [
    '1. Connect device via USB',
    '2. Power off device completely',
    '3. Hold Side + Volume Down for 10 seconds',
    '4. Release Side, keep holding Volume Down for 5 seconds',
    '5. Screen should remain black (DFU mode)'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">iOS DFU Flash Station</h2>
          <p className="text-sm text-muted-foreground">checkra1n / palera1n jailbreak support</p>
        </div>
        <Button onClick={scanDevices} disabled={scanning} variant="outline">
          <ArrowsClockwise className={scanning ? 'animate-spin' : ''} />
          {scanning ? 'Scanning...' : 'Scan Devices'}
        </Button>
      </div>

      <Alert className="border-warning/50 bg-warning/10">
        <Warning className="text-warning" />
        <AlertDescription className="text-sm text-foreground">
          <strong>Legal Notice:</strong> Jailbreaking voids warranties and may violate terms of service. 
          Proceed only on devices you own. Educational purposes only.
        </AlertDescription>
      </Alert>

      <DeviceStateGuide
        requiredState="dfu"
        platform="ios"
        deviceName={devices.find(d => d.udid === selectedDevice)?.name || 'Your iPhone/iPad'}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DeviceMobile className="text-primary" />
              Connected Devices
            </CardTitle>
            <CardDescription>
              {devices.length} device(s) detected
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {devices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DeviceMobile className="mx-auto mb-3 opacity-50" size={48} />
                <p>No iOS devices detected</p>
                <p className="text-xs mt-1">Connect device via USB</p>
              </div>
            ) : (
              devices.map((device) => (
                <div
                  key={device.udid}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedDevice === device.udid
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedDevice(device.udid)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={device.mode === 'dfu' ? 'default' : 'secondary'}
                          className={device.mode === 'dfu' ? 'bg-primary text-primary-foreground' : ''}
                        >
                          {device.mode.toUpperCase()}
                        </Badge>
                        {device.name && (
                          <span className="text-sm font-medium text-foreground truncate">
                            {device.name}
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-xs text-muted-foreground truncate">
                        {device.udid}
                      </p>
                      {device.productType && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {device.productType}
                        </p>
                      )}
                    </div>
                    <Lightning className="text-primary shrink-0" />
                  </div>
                  
                  {selectedDevice === device.udid && (
                    <div className="mt-3 pt-3 border-t border-border flex gap-2">
                      {device.mode !== 'dfu' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            enterDFUMode(device.udid);
                          }}
                          className="flex-1"
                        >
                          Enter DFU
                        </Button>
                      )}
                      {device.mode === 'dfu' && (
                        <>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              startJailbreak(device.udid, 'checkra1n');
                            }}
                            disabled={flashStatus === 'flashing'}
                            className="flex-1"
                          >
                            checkra1n
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              startJailbreak(device.udid, 'palera1n');
                            }}
                            disabled={flashStatus === 'flashing'}
                            className="flex-1"
                          >
                            palera1n
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>DFU Mode Instructions</CardTitle>
            <CardDescription>How to enter DFU mode manually</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-foreground">
              {dfuModeInstructions.map((instruction, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-primary font-bold">{instruction.split('.')[0]}.</span>
                  <span>{instruction.split('. ')[1]}</span>
                </li>
              ))}
            </ol>
            <Alert className="mt-4 border-primary/30 bg-primary/5">
              <AlertDescription className="text-xs text-muted-foreground">
                Note: Steps vary by device model. iPhone 8+ uses Side button, older models use Home button.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {flashStatus !== 'idle' && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Flash Progress</CardTitle>
            <CardDescription>
              {flashStatus === 'flashing' && 'Jailbreak in progress...'}
              {flashStatus === 'complete' && 'Jailbreak completed successfully'}
              {flashStatus === 'error' && 'Jailbreak failed'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-foreground font-medium">{flashProgress}%</span>
              </div>
              <Progress value={flashProgress} className="h-2" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-foreground mb-2">Console Output</h4>
              <div className="bg-background/50 rounded-lg p-3 h-48 overflow-y-auto font-mono text-xs">
                {logs.slice(-50).map((log, index) => (
                  <div
                    key={index}
                    className={`${
                      log.includes('[ERROR]')
                        ? 'text-destructive'
                        : log.includes('[COMPLETE]')
                        ? 'text-success'
                        : log.includes('[SCAN]') || log.includes('[DFU]')
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
