/**
 * TrapdoorRootVault
 * 
 * Root installation and management - Magisk, SuperSU, Xposed Framework.
 * Automated root installation for Android devices.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle, CheckCircle2, XCircle, Download, Zap, Package } from 'lucide-react';
import { TerminalCommandPreview } from '../core/TerminalCommandPreview';
import { TerminalLogStream, LogEntry } from '../core/TerminalLogStream';
import { ToolboxDangerLever } from '../toolbox/ToolboxDangerLever';
import { DeviceIcon } from '../core/DeviceIcon';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Device {
  serial: string;
  brand: string;
  model: string;
  state: string;
  platform?: string;
}

interface TrapdoorRootVaultProps {
  passcode?: string;
  devices?: Device[];
}

type RootMethod = 'magisk' | 'supersu' | 'xposed' | null;

export function TrapdoorRootVault({ passcode, devices: propDevices = [] }: TrapdoorRootVaultProps) {
  const [devices, setDevices] = useState<Device[]>(propDevices);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [rootMethod, setRootMethod] = useState<RootMethod>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [operationComplete, setOperationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rootStatus, setRootStatus] = useState<'unknown' | 'rooted' | 'not_rooted'>('unknown');
  const [devicesLoading, setDevicesLoading] = useState(false);

  // Scan for devices if none provided
  useEffect(() => {
    if (propDevices.length === 0) {
      scanDevices();
    } else {
      setDevices(propDevices);
    }
  }, [propDevices]);

  const scanDevices = async () => {
    setDevicesLoading(true);
    try {
      const adbResponse = await fetch('/api/v1/adb/devices');
      if (adbResponse.ok) {
        const adbData = await adbResponse.json();
        if (adbData.ok && adbData.data?.devices) {
          const adbDevices: Device[] = adbData.data.devices
            .filter((d: any) => d.serial && d.connected)
            .map((d: any) => ({
              serial: d.serial,
              brand: d.properties?.brand || d.properties?.manufacturer || 'Unknown',
              model: d.properties?.model || 'Unknown',
              state: d.status || 'device',
              platform: 'android'
            }));
          setDevices(adbDevices);
        }
      }
    } catch (error) {
      console.error('[RootVault] Device scan error:', error);
    } finally {
      setDevicesLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDevice && passcode) {
      checkRootStatus();
    }
  }, [selectedDevice, passcode]);

  const checkRootStatus = async () => {
    if (!selectedDevice || !passcode) return;

    try {
      const response = await fetch(`/api/v1/trapdoor/root/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Secret-Room-Passcode': passcode,
        },
        body: JSON.stringify({
          deviceSerial: selectedDevice.serial,
        }),
      });

      const data = await response.json();
      if (data.ok && data.data) {
        setRootStatus(data.data.rooted ? 'rooted' : 'not_rooted');
      }
    } catch (error) {
      console.error('[RootVault] Failed to check root status:', error);
    }
  };

  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
    setRootMethod(null);
    setError(null);
    setOperationComplete(false);
    setLogs([]);
    setRootStatus('unknown');
  };

  const handleInstall = async () => {
    if (!selectedDevice || !rootMethod || !passcode) return;

    setIsExecuting(true);
    setError(null);
    setLogs([]);
    setOperationComplete(false);

    try {
      const response = await fetch(`/api/v1/trapdoor/root/install`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Secret-Room-Passcode': passcode,
        },
        body: JSON.stringify({
          deviceSerial: selectedDevice.serial,
          method: rootMethod,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        addLog({ level: 'info', message: `Root installation initiated: ${rootMethod}` });
        addLog({ level: 'success', message: 'Installation completed successfully' });
        setOperationComplete(true);
        toast.success('Root installation completed');
        checkRootStatus();
      } else {
        setError(data.error || 'Root installation failed');
        addLog({ level: 'error', message: data.error || 'Installation failed' });
        toast.error('Root installation failed', { description: data.error });
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Network error';
      setError(errorMsg);
      addLog({ level: 'error', message: errorMsg });
      toast.error('Root installation failed', { description: errorMsg });
    } finally {
      setIsExecuting(false);
    }
  };

  const addLog = (entry: LogEntry) => {
    setLogs(prev => [...prev, { ...entry, timestamp: new Date().toISOString() }]);
  };

  const commands = selectedDevice && rootMethod ? [
    {
      command: rootMethod === 'magisk' 
        ? `adb -s ${selectedDevice.serial} install magisk.apk`
        : rootMethod === 'supersu'
        ? `adb -s ${selectedDevice.serial} install supersu.apk`
        : `adb -s ${selectedDevice.serial} install xposed.apk`,
      description: `Install ${rootMethod} root solution`,
      risk: 'destructive' as const,
    },
  ] : [];

  const canProceed = selectedDevice && rootMethod && !isExecuting && passcode;

  return (
    <div className="h-full w-full bg-basement-concrete overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-ink-primary flex items-center gap-2">
            <Shield className="w-6 h-6 text-spray-cyan" />
            🛡️ Root Vault
          </h1>
          <p className="text-sm text-ink-muted">
            Root installation and management - Magisk, SuperSU, Xposed Framework
          </p>
        </div>

        {/* Warning Banner */}
        <Alert className="border-state-danger bg-state-danger/10">
          <AlertTriangle className="h-4 w-4 text-state-danger" />
          <AlertDescription className="text-ink-primary">
            <strong className="text-state-danger">⚠️ WARRANTY VOID:</strong> Rooting your device will void 
            manufacturer warranty and may cause security issues. Use only on devices you own and understand 
            the risks involved.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Device Selection */}
          <Card className="lg:col-span-1 border-panel bg-workbench-steel">
            <CardHeader>
              <CardTitle className="text-lg">Device Selection</CardTitle>
              <CardDescription>Select a device to root</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {devicesLoading ? (
                <div className="text-center py-8 text-ink-muted">
                  <DeviceIcon platform="android" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Scanning for devices...</p>
                </div>
              ) : devices.length === 0 ? (
                <div className="text-center py-8 text-ink-muted">
                  <DeviceIcon platform="android" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No devices detected</p>
                  <p className="text-xs mt-1">Connect a device via ADB</p>
                  <Button
                    onClick={scanDevices}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    Scan Again
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {devices.map((device) => (
                    <button
                      key={device.serial}
                      onClick={() => handleDeviceSelect(device)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all",
                        "bg-basement-concrete border-panel hover:border-spray-cyan/50",
                        selectedDevice?.serial === device.serial && "border-spray-cyan bg-spray-cyan/10"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <DeviceIcon platform={device.platform || 'android'} className="w-5 h-5" />
                        <span className="font-mono text-sm text-ink-primary">{device.brand}</span>
                      </div>
                      <div className="text-xs text-ink-muted">{device.model}</div>
                      <div className="text-xs text-ink-muted font-mono mt-1">{device.serial}</div>
                    </button>
                  ))}
                </div>
              )}

              {selectedDevice && (
                <div className="mt-4 pt-4 border-t border-panel">
                  <Label className="text-sm text-ink-primary mb-2 block">Root Status</Label>
                  <div className="flex items-center gap-2">
                    {rootStatus === 'rooted' && (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-state-success" />
                        <span className="text-sm text-state-success">Rooted</span>
                      </>
                    )}
                    {rootStatus === 'not_rooted' && (
                      <>
                        <XCircle className="w-4 h-4 text-state-danger" />
                        <span className="text-sm text-state-danger">Not Rooted</span>
                      </>
                    )}
                    {rootStatus === 'unknown' && (
                      <>
                        <AlertTriangle className="w-4 h-4 text-ink-muted" />
                        <span className="text-sm text-ink-muted">Unknown</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Root Method Selection & Execution */}
          <Card className="lg:col-span-2 border-panel bg-workbench-steel">
            <CardHeader>
              <CardTitle className="text-lg">Root Installation</CardTitle>
              <CardDescription>Select root method and execute</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!selectedDevice ? (
                <div className="text-center py-12 text-ink-muted">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a device to begin</p>
                </div>
              ) : (
                <>
                  {/* Root Method Selection */}
                  <div className="space-y-2">
                    <Label>Root Method</Label>
                    <Select value={rootMethod || ''} onValueChange={(value) => setRootMethod(value as RootMethod)}>
                      <SelectTrigger className="bg-basement-concrete border-panel">
                        <SelectValue placeholder="Select root method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="magisk">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            <span>Magisk (Recommended)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="supersu">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span>SuperSU (Legacy)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="xposed">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <span>Xposed Framework</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Command Preview */}
                  {commands.length > 0 && (
                    <TerminalCommandPreview
                      commands={commands}
                      impactedPartitions={['system', 'boot', 'recovery']}
                    />
                  )}

                  {/* Execution Button */}
                  {canProceed && (
                    <div className="space-y-4">
                      <ToolboxDangerLever
                        onConfirm={handleInstall}
                        disabled={isExecuting || operationComplete}
                        confirmationText="INSTALL ROOT"
                        description="This will install root access on your device. This action cannot be easily undone."
                      />
                    </div>
                  )}

                  {/* Error Display */}
                  {error && (
                    <Alert className="border-state-danger bg-state-danger/10">
                      <XCircle className="h-4 w-4 text-state-danger" />
                      <AlertDescription className="text-ink-primary">{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Success Display */}
                  {operationComplete && (
                    <Alert className="border-state-success bg-state-success/10">
                      <CheckCircle2 className="h-4 w-4 text-state-success" />
                      <AlertDescription className="text-ink-primary">
                        Root installation completed successfully!
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Logs */}
                  {logs.length > 0 && (
                    <div className="space-y-2">
                      <Label>Installation Logs</Label>
                      <TerminalLogStream logs={logs} maxLines={20} />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
