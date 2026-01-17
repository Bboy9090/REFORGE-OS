/**
 * DevModePanel - Advanced device mode detection and workflow panel
 * 
 * Shows connected devices with their modes (ADB, Fastboot, DFU, Recovery)
 * and available workflows for each device type.
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DeviceMobile, 
  Lightning, 
  Activity, 
  Hammer,
  CheckCircle,
  XCircle,
  WarningCircle,
  PlayCircle
} from '@phosphor-icons/react';
import { probeDevices, type ProbeResult, type DeviceCapability } from '@/lib/probeDevice';

interface WorkflowInfo {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  estimatedDuration: string;
  icon: typeof Activity;
}

const AVAILABLE_WORKFLOWS: WorkflowInfo[] = [
  {
    id: 'vessel-sanctum',
    name: 'VesselSanctum',
    description: 'Deep device diagnostics and health check',
    riskLevel: 'low',
    estimatedDuration: '5-10 min',
    icon: Activity,
  },
  {
    id: 'warhammer',
    name: 'Warhammer',
    description: 'Advanced repair and recovery operations',
    riskLevel: 'high',
    estimatedDuration: '15-30 min',
    icon: Hammer,
  },
  {
    id: 'quick-diagnostics',
    name: 'Quick Diagnostics',
    description: 'Fast 2-minute device health check',
    riskLevel: 'low',
    estimatedDuration: '2 min',
    icon: Lightning,
  },
  {
    id: 'battery-health',
    name: 'Battery Health',
    description: 'Comprehensive battery analysis',
    riskLevel: 'low',
    estimatedDuration: '3 min',
    icon: Activity,
  },
];

function getDeviceStateIcon(state: string) {
  switch (state) {
    case 'connected':
      return <CheckCircle className="text-green-500" size={20} />;
    case 'unauthorized':
      return <WarningCircle className="text-yellow-500" size={20} />;
    case 'offline':
    case 'disconnected':
      return <XCircle className="text-red-500" size={20} />;
    default:
      return <WarningCircle className="text-gray-500" size={20} />;
  }
}

function getRiskLevelColor(level: string) {
  switch (level) {
    case 'low':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'high':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
}

function DeviceCard({ device }: { device: ProbeResult }) {
  const [expanded, setExpanded] = useState(false);

  const getDeviceTypeIcon = () => {
    switch (device.deviceType) {
      case 'android':
        return '🤖';
      case 'ios':
        return '🍎';
      case 'usb':
        return '🔌';
      default:
        return '📱';
    }
  };

  const getConnectionTypeBadge = () => {
    const colorMap: Record<string, string> = {
      adb: 'bg-blue-500/10 text-blue-500',
      fastboot: 'bg-purple-500/10 text-purple-500',
      ios: 'bg-gray-500/10 text-gray-500',
      usb: 'bg-green-500/10 text-green-500',
      webusb: 'bg-cyan-500/10 text-cyan-500',
    };
    return colorMap[device.connectionType] || 'bg-gray-500/10 text-gray-500';
  };

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getDeviceTypeIcon()}</span>
            <div>
              <CardTitle className="text-base">{device.deviceName}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {device.deviceId}
              </CardDescription>
            </div>
          </div>
          {getDeviceStateIcon(device.state)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge className={getConnectionTypeBadge()}>
            {device.connectionType.toUpperCase()}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {device.detectionMethod}
          </Badge>
        </div>

        {device.properties && Object.keys(device.properties).length > 0 && (
          <div className="text-xs space-y-1 text-muted-foreground">
            {device.properties.manufacturer && (
              <div>Manufacturer: {device.properties.manufacturer}</div>
            )}
            {device.properties.model && (
              <div>Model: {device.properties.model}</div>
            )}
            {device.properties.androidVersion && (
              <div>Android: {device.properties.androidVersion}</div>
            )}
          </div>
        )}

        {device.capabilities && device.capabilities.length > 0 && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Hide' : 'Show'} Capabilities ({device.capabilities.length})
            </Button>
            
            {expanded && (
              <div className="mt-2 space-y-2">
                {device.capabilities.map((cap: DeviceCapability) => (
                  <div
                    key={cap.id}
                    className={`p-2 rounded-lg border text-xs ${
                      cap.available
                        ? 'bg-green-500/5 border-green-500/20'
                        : 'bg-gray-500/5 border-gray-500/20 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{cap.name}</span>
                      {cap.available && (
                        <CheckCircle className="text-green-500" size={14} />
                      )}
                    </div>
                    <div className="text-muted-foreground">{cap.description}</div>
                    <div className="mt-1 flex gap-1">
                      {cap.protocols.map((protocol) => (
                        <Badge key={protocol} variant="outline" className="text-[10px] h-4 px-1">
                          {protocol}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WorkflowCard({ workflow, onExecute }: { workflow: WorkflowInfo; onExecute: (id: string) => void }) {
  const Icon = workflow.icon;
  
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Icon className="text-primary" size={24} />
            <div>
              <CardTitle className="text-base">{workflow.name}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {workflow.description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge className={getRiskLevelColor(workflow.riskLevel)}>
            {workflow.riskLevel.toUpperCase()}
          </Badge>
          <Badge variant="outline" className="text-xs">
            ⏱️ {workflow.estimatedDuration}
          </Badge>
        </div>
        
        <Button
          onClick={() => onExecute(workflow.id)}
          className="w-full"
          size="sm"
        >
          <PlayCircle className="mr-2" size={16} />
          Execute Workflow
        </Button>
      </CardContent>
    </Card>
  );
}

export function DevModePanel() {
  const [devices, setDevices] = useState<ProbeResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadDevices = async () => {
    try {
      setError(null);
      const results = await probeDevices();
      setDevices(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to probe devices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();

    if (autoRefresh) {
      const interval = setInterval(loadDevices, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleExecuteWorkflow = (workflowId: string) => {
    // Feature not yet implemented - workflow execution engine pending
    console.log(`[NOT IMPLEMENTED] Workflow execution requested: ${workflowId}`);
    toast.info('Feature Not Available', {
      description: `Workflow "${workflowId}" execution is not yet implemented. This feature requires integration with the workflow execution engine.`,
      duration: 5000,
    });
  };

  const mobileDevices = devices.filter(d => ['android', 'ios'].includes(d.deviceType));
  const usbDevices = devices.filter(d => d.deviceType === 'usb');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <DeviceMobile size={28} className="text-primary" />
                <CardTitle className="text-2xl">Dev Mode Panel</CardTitle>
              </div>
              <CardDescription className="mt-1">
                Advanced device detection and workflow management
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                Auto-Refresh: {autoRefresh ? 'ON' : 'OFF'}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={loadDevices}
                disabled={isLoading}
              >
                {isLoading ? 'Scanning...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Mobile: {mobileDevices.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>USB: {usbDevices.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <span>Total: {devices.length}</span>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              ⚠️ {error}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="devices" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="devices">
            Connected Devices ({devices.length})
          </TabsTrigger>
          <TabsTrigger value="workflows">
            Available Workflows ({AVAILABLE_WORKFLOWS.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          {isLoading && devices.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Activity className="mx-auto mb-4 animate-spin" size={32} />
                <p>Scanning for devices...</p>
              </CardContent>
            </Card>
          ) : devices.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <DeviceMobile className="mx-auto mb-4" size={48} />
                <p className="text-lg font-medium mb-2">No devices detected</p>
                <p className="text-sm">
                  Connect a device via USB and ensure debugging is enabled
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map((device) => (
                <DeviceCard key={device.deviceId} device={device} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mobile Workflows</CardTitle>
              <CardDescription>
                Pre-configured workflows for device diagnostics, repair, and recovery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AVAILABLE_WORKFLOWS.map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onExecute={handleExecuteWorkflow}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {mobileDevices.length === 0 && (
            <Card className="border-yellow-500/20 bg-yellow-500/5">
              <CardContent className="py-8 text-center">
                <WarningCircle className="mx-auto mb-3 text-yellow-500" size={40} />
                <p className="text-sm text-muted-foreground">
                  No mobile devices connected. Connect a device to execute workflows.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
