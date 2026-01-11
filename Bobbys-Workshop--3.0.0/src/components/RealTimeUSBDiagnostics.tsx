import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ADBFastbootDetector } from './ADBFastbootDetector';
import { BootForgeUSBScanner } from './BootForgeUSBScanner';
import { CorrelationBadgeDisplay } from './CorrelationBadgeDisplay';
import { useAndroidDevices } from '@/hooks/use-android-devices';
import { getAPIUrl } from '@/lib/apiConfig';
import type { CorrelationBadge } from '@/types/correlation';
import type { AndroidDevice, AndroidDeviceProperties, FastbootDeviceProperties } from '@/types/android-devices';
import { 
  Lightning, 
  DeviceMobile, 
  CheckCircle,
  Warning,
  CircleNotch,
  Gauge,
  Link as LinkIcon,
  ArrowsClockwise
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface USBEvidence {
  vid: string;
  pid: string;
  manufacturer: string | null;
  product: string | null;
  serial: string | null;
}

interface BootForgeDevice {
  device_uid: string;
  platform_hint: string;
  mode: string;
  confidence: number;
  evidence: {
    usb: USBEvidence;
    tools: any;
  };
  matched_tool_ids: string[];
  correlation_badge?: CorrelationBadge;
}

interface CorrelatedDevice {
  deviceUid: string;
  adbSerial?: string;
  fastbootSerial?: string;
  usbSerial?: string;
  platform: string;
  mode: string;
  confidence: number;
  correlationBadge: CorrelationBadge;
  adbConnected: boolean;
  fastbootConnected: boolean;
  usbConnected: boolean;
  manufacturer?: string;
  model?: string;
  androidVersion?: string;
  bootloaderState?: string;
}

export function RealTimeUSBDiagnostics() {
  const [bootforgeDevices, setBootforgeDevices] = useState<BootForgeDevice[]>([]);
  const [correlatedDevices, setCorrelatedDevices] = useState<CorrelatedDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  const androidDevicesHook = useAndroidDevices(autoRefresh, 3000);
  const { adbAvailable, fastbootAvailable, refresh: refreshAndroid } = androidDevicesHook;
  const androidDevices: AndroidDevice[] = androidDevicesHook.devices as AndroidDevice[];

  useEffect(() => {
    correlateDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(androidDevices), JSON.stringify(bootforgeDevices)]);

  async function scanBootForge() {
    setLoading(true);
    try {
      const res = await fetch(getAPIUrl('/api/bootforgeusb/scan?demo=false'));
      const data = await res.json();
      
      if (data.success && data.devices) {
        setBootforgeDevices(data.devices);
        toast.success(`Found ${data.devices.length} USB devices`);
      } else {
        setBootforgeDevices([]);
        if (data.message) {
          toast.warning(data.message);
        }
      }
    } catch (err) {
      toast.error('Failed to scan USB devices');
      setBootforgeDevices([]);
    } finally {
      setLoading(false);
    }
  }

  function correlateDevices() {
    if (!androidDevices.length && !bootforgeDevices.length) {
      setCorrelatedDevices([]);
      return;
    }
    
    const correlated: CorrelatedDevice[] = [];
    const serialMap = new Map<string, AndroidDevice>();

    androidDevices.forEach((device: AndroidDevice) => {
      if (device.serial) {
        serialMap.set(device.serial, device);
      }
    });

    bootforgeDevices.forEach(usbDevice => {
      const matchedToolIds = usbDevice.matched_tool_ids || [];
      let adbMatch: AndroidDevice | null = null;
      let fastbootMatch: AndroidDevice | null = null;

      matchedToolIds.forEach(toolId => {
        const match = serialMap.get(toolId);
        if (match) {
          if (match.source === 'adb') {
            adbMatch = match;
          } else if (match.source === 'fastboot') {
            fastbootMatch = match;
          }
        }
      });

      if (adbMatch || fastbootMatch) {
        const device: AndroidDevice = (adbMatch || fastbootMatch)!;
        
        const isAdbProperties = device.source === 'adb';
        const properties = device.properties;
        
        correlated.push({
          deviceUid: usbDevice.device_uid,
          adbSerial: adbMatch ? (adbMatch as AndroidDevice).serial : undefined,
          fastbootSerial: fastbootMatch ? (fastbootMatch as AndroidDevice).serial : undefined,
          usbSerial: usbDevice.evidence.usb.serial || undefined,
          platform: usbDevice.platform_hint,
          mode: usbDevice.mode,
          confidence: usbDevice.confidence,
          correlationBadge: usbDevice.correlation_badge || deriveCorrelationBadge(usbDevice),
          adbConnected: !!adbMatch,
          fastbootConnected: !!fastbootMatch,
          usbConnected: true,
          manufacturer: isAdbProperties ? (properties as AndroidDeviceProperties)?.manufacturer : undefined,
          model: isAdbProperties ? (properties as AndroidDeviceProperties)?.model : (properties as FastbootDeviceProperties)?.product,
          androidVersion: isAdbProperties ? (properties as AndroidDeviceProperties)?.androidVersion : undefined,
          bootloaderState: !isAdbProperties ? (properties as FastbootDeviceProperties)?.bootloaderState : undefined,
        });
      }
    });

    androidDevices.forEach((device: AndroidDevice) => {
      const isAlreadyCorrelated = correlated.some(
        c => c.adbSerial === device.serial || c.fastbootSerial === device.serial
      );

      if (!isAlreadyCorrelated) {
        const isAdbDevice = device.source === 'adb';
        const properties = device.properties;
        
        correlated.push({
          deviceUid: `${device.source}-only-${device.serial}`,
          adbSerial: device.source === 'adb' ? device.serial : undefined,
          fastbootSerial: device.source === 'fastboot' ? device.serial : undefined,
          platform: 'android',
          mode: device.deviceMode,
          confidence: 0.75,
          correlationBadge: 'SYSTEM-CONFIRMED',
          adbConnected: device.source === 'adb',
          fastbootConnected: device.source === 'fastboot',
          usbConnected: false,
          manufacturer: isAdbDevice ? (properties as AndroidDeviceProperties)?.manufacturer : undefined,
          model: isAdbDevice ? (properties as AndroidDeviceProperties)?.model : (properties as FastbootDeviceProperties)?.product,
          androidVersion: isAdbDevice ? (properties as AndroidDeviceProperties)?.androidVersion : undefined,
          bootloaderState: !isAdbDevice ? (properties as FastbootDeviceProperties)?.bootloaderState : undefined,
        });
      }
    });

    setCorrelatedDevices(correlated);
  }

  function deriveCorrelationBadge(device: BootForgeDevice): CorrelationBadge {
    const hasMatchedIds = device.matched_tool_ids.length > 0;
    const mode = device.mode.toLowerCase();
    const confidence = device.confidence;
    
    if (hasMatchedIds) {
      if (mode.includes('confirmed') && confidence >= 0.90) {
        return 'CORRELATED';
      }
      return 'CORRELATED (WEAK)';
    }
    
    if (mode.includes('confirmed') && confidence >= 0.90) {
      return 'SYSTEM-CONFIRMED';
    }
    
    if (mode.includes('likely')) {
      return 'LIKELY';
    }
    
    return 'UNCONFIRMED';
  }

  async function refreshAll() {
    setLoading(true);
    await Promise.all([
      scanBootForge(),
      refreshAndroid()
    ]);
    setLoading(false);
    toast.success('Refreshed all device sources');
  }

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
    toast.success(autoRefresh ? 'Auto-refresh disabled' : 'Auto-refresh enabled (3s interval)');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Lightning className="w-6 h-6 text-primary" weight="duotone" />
              Real-Time USB Device Diagnostics
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Multi-source device detection with live correlation tracking
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={toggleAutoRefresh}
            >
              {autoRefresh ? (
                <>
                  <CircleNotch className="w-4 h-4 animate-spin mr-2" />
                  Auto (3s)
                </>
              ) : (
                'Enable Auto-Refresh'
              )}
            </Button>
            <Button
              onClick={refreshAll}
              disabled={loading}
              size="sm"
            >
              {loading ? (
                <CircleNotch className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ArrowsClockwise className="w-4 h-4 mr-2" />
              )}
              Scan All Sources
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-3 rounded-lg border border-border bg-muted/20">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">ADB</div>
            <div className="flex items-center gap-2">
              {adbAvailable ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" weight="fill" />
              ) : (
                <Warning className="w-4 h-4 text-amber-400" weight="fill" />
              )}
              <span className="text-sm font-medium text-foreground">
                {androidDevices.filter(d => d.source === 'adb').length} devices
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/20">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Fastboot</div>
            <div className="flex items-center gap-2">
              {fastbootAvailable ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" weight="fill" />
              ) : (
                <Warning className="w-4 h-4 text-amber-400" weight="fill" />
              )}
              <span className="text-sm font-medium text-foreground">
                {androidDevices.filter(d => d.source === 'fastboot').length} devices
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/20">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">USB</div>
            <div className="flex items-center gap-2">
              <DeviceMobile className="w-4 h-4 text-blue-400" weight="fill" />
              <span className="text-sm font-medium text-foreground">
                {bootforgeDevices.length} devices
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/20">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Correlated</div>
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-accent" weight="fill" />
              <span className="text-sm font-medium text-foreground">
                {correlatedDevices.filter(d => d.correlationBadge === 'CORRELATED').length} devices
              </span>
            </div>
          </div>
        </div>

        {correlatedDevices.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Correlated Devices</h3>
              {correlatedDevices.map((device, idx) => (
                <Card key={device.deviceUid} className="p-4 border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-foreground">
                          {device.manufacturer && device.model ? (
                            `${device.manufacturer} ${device.model}`
                          ) : device.model || device.usbSerial || device.adbSerial || device.fastbootSerial}
                        </h4>
                        <CorrelationBadgeDisplay 
                          badge={device.correlationBadge}
                          matchedIds={[device.adbSerial, device.fastbootSerial, device.usbSerial].filter(Boolean) as string[]}
                          className="text-xs"
                        />
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        {device.adbConnected && (
                          <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                            ADB Connected
                          </Badge>
                        )}
                        {device.fastbootConnected && (
                          <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                            Fastboot Connected
                          </Badge>
                        )}
                        {device.usbConnected && (
                          <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                            USB Detected
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {device.adbSerial && (
                          <div>
                            <span className="text-muted-foreground">ADB Serial:</span>{' '}
                            <span className="font-mono text-foreground">{device.adbSerial}</span>
                          </div>
                        )}
                        {device.fastbootSerial && (
                          <div>
                            <span className="text-muted-foreground">Fastboot Serial:</span>{' '}
                            <span className="font-mono text-foreground">{device.fastbootSerial}</span>
                          </div>
                        )}
                        {device.androidVersion && (
                          <div>
                            <span className="text-muted-foreground">Android:</span>{' '}
                            <span className="text-foreground">{device.androidVersion}</span>
                          </div>
                        )}
                        {device.bootloaderState && (
                          <div>
                            <span className="text-muted-foreground">Bootloader:</span>{' '}
                            <span className="text-foreground capitalize">{device.bootloaderState}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Gauge className="w-3 h-3" />
                        Confidence: {(device.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {correlatedDevices.length === 0 && !loading && (
          <Alert className="border-amber-500/30 bg-amber-600/10">
            <Warning className="w-4 h-4 text-amber-400" />
            <AlertDescription className="text-amber-300">
              No devices detected. Connect an Android device via USB and ensure ADB/Fastboot drivers are installed.
            </AlertDescription>
          </Alert>
        )}
      </Card>

      <Tabs defaultValue="unified" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="unified">Unified View</TabsTrigger>
          <TabsTrigger value="adb-fastboot">ADB / Fastboot</TabsTrigger>
          <TabsTrigger value="usb">USB (BootForge)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="unified" className="space-y-4">
          <Card className="p-6 border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">All Detection Sources</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This unified view correlates data from ADB, Fastboot, and USB device scanning to provide 
              the most comprehensive device information available.
            </p>
            {correlatedDevices.length > 0 ? (
              <div className="text-sm text-foreground">
                {correlatedDevices.length} total device{correlatedDevices.length !== 1 ? 's' : ''} tracked across all sources
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                No devices found. Click "Scan All Sources" to detect connected devices.
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="adb-fastboot">
          <ADBFastbootDetector />
        </TabsContent>
        
        <TabsContent value="usb">
          <BootForgeUSBScanner />
        </TabsContent>
      </Tabs>
    </div>
  );
}
