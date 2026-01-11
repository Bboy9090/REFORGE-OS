import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LiveDeviceSelector } from './LiveDeviceSelector';
import {
  BatteryCharging,
  HardDrive,
  Fire,
  Play,
  CheckCircle,
  Warning,
  XCircle,
  ShieldCheck,
  Thermometer,
  Database,
  DeviceMobile,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import {
  batteryHealthManifest,
  BatteryHealthData,
  execute as executeBatteryHealth,
} from '@/lib/plugins/battery-health';
import {
  storageAnalyzerManifest,
  StorageHealthData,
  execute as executeStorageAnalyzer,
} from '@/lib/plugins/storage-analyzer';
import {
  thermalMonitorManifest,
  ThermalHealthData,
  execute as executeThermalMonitor,
} from '@/lib/plugins/thermal-monitor';
import { PluginContext } from '@/types/plugin-sdk';

interface DiagnosticDashboardProps {
  deviceId?: string;
  platform?: 'android' | 'ios';
}

interface ConnectedDevice {
  device_uid: string;
  platform_hint: string;
  mode: string;
  confidence: number;
  evidence: {
    usb: any;
    tools: any;
  };
  matched_tool_ids: string[];
  correlation_badge?: any;
  display_name?: string;
}

export function DiagnosticPluginsDashboard({ deviceId: initialDeviceId = 'demo-device-001', platform: initialPlatform = 'android' }: DiagnosticDashboardProps) {
  const [selectedDevice, setSelectedDevice] = useState<ConnectedDevice | null>(null);
  const [deviceId, setDeviceId] = useState<string>(initialDeviceId);
  const [platform, setPlatform] = useState<'android' | 'ios'>(initialPlatform);
  const [batteryData, setBatteryData] = useState<BatteryHealthData | null>(null);
  const [storageData, setStorageData] = useState<StorageHealthData | null>(null);
  const [thermalData, setThermalData] = useState<ThermalHealthData | null>(null);

  const [batteryLoading, setBatteryLoading] = useState(false);
  const [storageLoading, setStorageLoading] = useState(false);
  const [thermalLoading, setThermalLoading] = useState(false);

  // Demo context for simulated diagnostics - all output is prefixed with [DEMO]
  const createDemoContext = (pluginId: string): PluginContext => ({
    pluginId,
    version: '1.0.0',
    environment: 'dev', // Running in demo mode with simulated data
    deviceId,
    platform,
    user: {
      id: 'bobby',
      isOwner: true,
      permissions: ['diagnostics:read', 'device:read'],
    },
    adb: {
      shell: async (deviceId: string, command: string) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return `[DEMO] Simulated output for: ${command}`;
      },
      execute: async (deviceId: string, command: string) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return `[DEMO] Simulated output for: ${command}`;
      },
    },
    kv: {
      get: async () => undefined,
      set: async () => {},
      delete: async () => {},
      keys: async () => [],
    },
    logger: {
      info: (msg: string) => console.log(`[${pluginId}] INFO:`, msg),
      warn: (msg: string) => console.warn(`[${pluginId}] WARN:`, msg),
      error: (msg: string) => console.error(`[${pluginId}] ERROR:`, msg),
      debug: (msg: string) => console.debug(`[${pluginId}] DEBUG:`, msg),
    },
    emit: () => {},
    on: () => () => {},
  });

  const runBatteryDiagnostics = async () => {
    setBatteryLoading(true);
    try {
      const context = createDemoContext(batteryHealthManifest.id);
      const result = await executeBatteryHealth(context);

      if (result.success && result.data) {
        setBatteryData(result.data);
        toast.success('Battery diagnostics complete (demo data)');
      } else {
        toast.error(result.error || 'Battery diagnostics failed');
      }
    } catch (error) {
      toast.error(`Battery diagnostics failed: ${error}`);
    } finally {
      setBatteryLoading(false);
    }
  };

  const runStorageDiagnostics = async () => {
    setStorageLoading(true);
    try {
      const context = createDemoContext(storageAnalyzerManifest.id);
      const result = await executeStorageAnalyzer(context);

      if (result.success && result.data) {
        setStorageData(result.data);
        toast.success('Storage diagnostics complete (demo data)');
      } else {
        toast.error(result.error || 'Storage diagnostics failed');
      }
    } catch (error) {
      toast.error(`Storage diagnostics failed: ${error}`);
    } finally {
      setStorageLoading(false);
    }
  };

  const runThermalDiagnostics = async () => {
    setThermalLoading(true);
    try {
      const context = createDemoContext(thermalMonitorManifest.id);
      const result = await executeThermalMonitor(context);

      if (result.success && result.data) {
        setThermalData(result.data);
        toast.success('Thermal diagnostics complete (demo data)');
      } else {
        toast.error(result.error || 'Thermal diagnostics failed');
      }
    } catch (error) {
      toast.error(`Thermal diagnostics failed: ${error}`);
    } finally {
      setThermalLoading(false);
    }
  };

  const handleDeviceSelected = (device: ConnectedDevice | null) => {
    setSelectedDevice(device);
    if (device) {
      setDeviceId(device.device_uid);
      const detectedPlatform = device.platform_hint.toLowerCase();
      if (detectedPlatform.includes('android')) {
        setPlatform('android');
      } else if (detectedPlatform.includes('ios') || detectedPlatform.includes('apple')) {
        setPlatform('ios');
      }
      toast.success('Device selected', {
        description: `Running diagnostics on ${device.display_name || device.device_uid}`,
      });
    }
  };

  const runAllDiagnostics = async () => {
    if (!selectedDevice) {
      toast.error('No device selected', {
        description: 'Please select a device before running diagnostics',
      });
      return;
    }
    
    await Promise.all([
      runBatteryDiagnostics(),
      runStorageDiagnostics(),
      runThermalDiagnostics(),
    ]);
  };

  const getHealthBadge = (status: string) => {
    const variants: Record<string, { color: string; text: string }> = {
      excellent: { color: 'bg-success text-success-foreground', text: 'Excellent' },
      good: { color: 'bg-primary text-primary-foreground', text: 'Good' },
      fair: { color: 'bg-warning text-warning-foreground', text: 'Fair' },
      poor: { color: 'bg-destructive text-destructive-foreground', text: 'Poor' },
      critical: { color: 'bg-destructive text-destructive-foreground', text: 'Critical' },
      degraded: { color: 'bg-destructive text-destructive-foreground', text: 'Degraded' },
      failed: { color: 'bg-destructive text-destructive-foreground', text: 'Failed' },
      normal: { color: 'bg-success text-success-foreground', text: 'Normal' },
      warm: { color: 'bg-warning text-warning-foreground', text: 'Warm' },
      hot: { color: 'bg-destructive text-destructive-foreground', text: 'Hot' },
      shutdown: { color: 'bg-destructive text-destructive-foreground', text: 'Shutdown' },
    };

    const variant = variants[status.toLowerCase()] || { color: 'bg-muted text-muted-foreground', text: status };
    return (
      <Badge className={variant.color}>
        {variant.text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Certified Diagnostic Plugins</h1>
          <p className="text-muted-foreground mt-1">Official Bobby diagnostics suite - Battery, Storage, Thermal</p>
        </div>
        <Button 
          onClick={runAllDiagnostics} 
          size="lg" 
          disabled={batteryLoading || storageLoading || thermalLoading || !selectedDevice}
        >
          <Play className="mr-2" />
          Run All Diagnostics
        </Button>
      </div>

      <LiveDeviceSelector
        onDeviceSelected={handleDeviceSelected}
        selectedDeviceId={selectedDevice?.device_uid}
        autoRefresh={true}
        refreshInterval={5000}
      />

      {!selectedDevice && (
        <Alert>
          <DeviceMobile className="w-4 h-4" />
          <AlertDescription>
            Please select a connected device above to run diagnostics.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <BatteryCharging className="w-8 h-8 text-primary" />
              <Badge variant="outline" className="text-xs">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Certified
              </Badge>
            </div>
            <CardTitle className="text-lg">Battery Health</CardTitle>
            <CardDescription>Charge cycles, capacity, health status</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runBatteryDiagnostics} disabled={batteryLoading} className="w-full">
              {batteryLoading ? 'Analyzing...' : 'Run Battery Scan'}
            </Button>
            {batteryData && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Health:</span>
                  {getHealthBadge(batteryData.health_status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Capacity:</span>
                  <span className="text-sm font-mono">{batteryData.health_percentage}%</span>
                </div>
                <Progress value={batteryData.health_percentage} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <HardDrive className="w-8 h-8 text-primary" />
              <Badge variant="outline" className="text-xs">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Certified
              </Badge>
            </div>
            <CardTitle className="text-lg">Storage Analyzer</CardTitle>
            <CardDescription>SMART data, wear level, health</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runStorageDiagnostics} disabled={storageLoading} className="w-full">
              {storageLoading ? 'Analyzing...' : 'Run Storage Scan'}
            </Button>
            {storageData && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Health:</span>
                  {getHealthBadge(storageData.health_status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Used:</span>
                  <span className="text-sm font-mono">{storageData.usage_percentage}%</span>
                </div>
                <Progress value={storageData.usage_percentage} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Fire className="w-8 h-8 text-primary" />
              <Badge variant="outline" className="text-xs">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Certified
              </Badge>
            </div>
            <CardTitle className="text-lg">Thermal Monitor</CardTitle>
            <CardDescription>Temperature zones, throttling, safety</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runThermalDiagnostics} disabled={thermalLoading} className="w-full">
              {thermalLoading ? 'Monitoring...' : 'Run Thermal Scan'}
            </Button>
            {thermalData && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  {getHealthBadge(thermalData.overall_status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Max Temp:</span>
                  <span className="text-sm font-mono">{thermalData.max_temperature}°C</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Safe for imaging:</span>
                  {thermalData.safe_for_imaging ? (
                    <CheckCircle className="text-success" weight="fill" />
                  ) : (
                    <XCircle className="text-destructive" weight="fill" />
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="battery" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="battery">
            <BatteryCharging className="w-4 h-4 mr-2" />
            Battery
          </TabsTrigger>
          <TabsTrigger value="storage">
            <HardDrive className="w-4 h-4 mr-2" />
            Storage
          </TabsTrigger>
          <TabsTrigger value="thermal">
            <Fire className="w-4 h-4 mr-2" />
            Thermal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="battery">
          {batteryData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BatteryCharging className="w-5 h-5" />
                  Battery Health Report
                </CardTitle>
                <CardDescription>
                  Device: {deviceId} • Platform: {batteryData.platform}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="text-2xl font-bold font-mono">{batteryData.level}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Health</p>
                    <p className="text-2xl font-bold font-mono">{batteryData.health_percentage}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Cycles</p>
                    <p className="text-2xl font-bold font-mono">{batteryData.charge_cycles}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Temperature</p>
                    <p className="text-2xl font-bold font-mono">{batteryData.temperature}°C</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-semibold">Health Status</h3>
                  {getHealthBadge(batteryData.health_status)}
                  <p className="text-sm text-muted-foreground mt-2">{batteryData.estimated_remaining_life}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    {batteryData.recommendations.length > 0 ? (
                      <Warning className="text-warning" weight="fill" />
                    ) : (
                      <CheckCircle className="text-success" weight="fill" />
                    )}
                    Recommendations
                  </h3>
                  <ScrollArea className="h-32">
                    <ul className="space-y-2">
                      {batteryData.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BatteryCharging className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No battery diagnostics run yet</p>
                <Button onClick={runBatteryDiagnostics} className="mt-4" disabled={batteryLoading}>
                  Run Battery Diagnostics
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="storage">
          {storageData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Storage Health Report
                </CardTitle>
                <CardDescription>
                  Device: {deviceId} • Platform: {storageData.platform}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold font-mono">{storageData.total_space_gb.toFixed(1)} GB</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Used</p>
                    <p className="text-2xl font-bold font-mono">{storageData.used_space_gb.toFixed(1)} GB</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Free</p>
                    <p className="text-2xl font-bold font-mono">{storageData.free_space_gb.toFixed(1)} GB</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Wear Level</p>
                    <p className="text-2xl font-bold font-mono">{storageData.wear_level_percentage}%</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-semibold">Health Status</h3>
                  {getHealthBadge(storageData.health_status)}
                  <p className="text-sm text-muted-foreground mt-2">
                    Type: {storageData.storage_type.toUpperCase()} • {storageData.estimated_remaining_life}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-semibold">Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Read Speed</p>
                      <p className="text-lg font-mono">{storageData.read_speed_mbps} MB/s</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Write Speed</p>
                      <p className="text-lg font-mono">{storageData.write_speed_mbps} MB/s</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    {storageData.recommendations.length > 0 ? (
                      <Warning className="text-warning" weight="fill" />
                    ) : (
                      <CheckCircle className="text-success" weight="fill" />
                    )}
                    Recommendations
                  </h3>
                  <ScrollArea className="h-32">
                    <ul className="space-y-2">
                      {storageData.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Database className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No storage diagnostics run yet</p>
                <Button onClick={runStorageDiagnostics} className="mt-4" disabled={storageLoading}>
                  Run Storage Diagnostics
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="thermal">
          {thermalData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5" />
                  Thermal Monitor Report
                </CardTitle>
                <CardDescription>
                  Device: {deviceId} • Platform: {thermalData.platform}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Max Temp</p>
                    <p className="text-2xl font-bold font-mono">{thermalData.max_temperature}°C</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-2xl font-bold font-mono">{thermalData.average_temperature.toFixed(1)}°C</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">CPU</p>
                    <p className="text-2xl font-bold font-mono">{thermalData.cpu_temp}°C</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Battery</p>
                    <p className="text-2xl font-bold font-mono">{thermalData.battery_temp}°C</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-semibold">Thermal Status</h3>
                  {getHealthBadge(thermalData.overall_status)}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Throttling:</span>
                      {thermalData.throttling_detected ? (
                        <Badge variant="destructive">Active</Badge>
                      ) : (
                        <Badge variant="outline">None</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Safe for imaging:</span>
                      {thermalData.safe_for_imaging ? (
                        <CheckCircle className="text-success" weight="fill" />
                      ) : (
                        <XCircle className="text-destructive" weight="fill" />
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-semibold">Thermal Zones</h3>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {thermalData.zones.map((zone, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="text-sm font-medium">{zone.name}</span>
                          <span className="text-sm font-mono">{zone.temperature}°C</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    {thermalData.recommendations.length > 0 ? (
                      <Warning className="text-warning" weight="fill" />
                    ) : (
                      <CheckCircle className="text-success" weight="fill" />
                    )}
                    Recommendations
                  </h3>
                  <ScrollArea className="h-32">
                    <ul className="space-y-2">
                      {thermalData.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Thermometer className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No thermal diagnostics run yet</p>
                <Button onClick={runThermalDiagnostics} className="mt-4" disabled={thermalLoading}>
                  Run Thermal Diagnostics
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
