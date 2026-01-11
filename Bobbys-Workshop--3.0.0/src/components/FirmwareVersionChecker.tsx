import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  ArrowClockwise, 
  CheckCircle, 
  WarningCircle, 
  XCircle, 
  Download,
  MagnifyingGlass,
  Clock,
  ShieldCheck,
  Info
} from '@phosphor-icons/react';
import { useFirmwareCheck } from '../hooks/use-firmware-check';
import { useAndroidDevices } from '../hooks/use-android-devices';
import type { FirmwareInfo } from '../types/firmware';

export function FirmwareVersionChecker() {
  const { devices, loading: devicesLoading } = useAndroidDevices(false);
  const deviceSerials = devices?.map(d => d.serial) || [];
  
  const { 
    firmwareData, 
    isChecking, 
    lastChecked, 
    errors, 
    checkFirmware,
    checkSingleDevice,
    clearCache 
  } = useFirmwareCheck(deviceSerials, { 
    autoCheck: false, 
    cacheResults: true 
  });

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (deviceSerials.length > 0 && Object.keys(firmwareData || {}).length === 0) {
      checkFirmware();
    }
  }, [deviceSerials.length]);

  const filteredDevices = devices?.filter(device => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      device.serial.toLowerCase().includes(query) ||
      device.model?.toLowerCase().includes(query) ||
      device.product?.toLowerCase().includes(query)
    );
  }) || [];

  const getSecurityStatusBadge = (status: string) => {
    switch (status) {
      case 'current':
        return <Badge className="bg-success text-background"><CheckCircle className="mr-1" size={14} weight="fill" />Current</Badge>;
      case 'outdated':
        return <Badge className="bg-warning text-background"><WarningCircle className="mr-1" size={14} weight="fill" />Outdated</Badge>;
      case 'critical':
        return <Badge className="bg-destructive text-destructive-foreground"><XCircle className="mr-1" size={14} weight="fill" />Critical</Badge>;
      default:
        return <Badge variant="outline"><Info className="mr-1" size={14} />Unknown</Badge>;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderDeviceFirmware = (device: any, firmware: FirmwareInfo | undefined) => {
    const error = errors?.[device.serial];

    return (
      <Card key={device.serial} className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-semibold">{device.serial}</h3>
              {firmware?.updateAvailable && (
                <Badge className="bg-primary text-primary-foreground">
                  <Download className="mr-1" size={12} weight="fill" />
                  Update Available
                </Badge>
              )}
            </div>

            {device.model && (
              <div className="text-sm">
                <span className="text-muted-foreground">Model:</span>{' '}
                <span className="font-medium">{device.model}</span>
                {device.product && device.product !== device.model && (
                  <span className="text-muted-foreground ml-2">({device.product})</span>
                )}
              </div>
            )}

            {firmware ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Current Version:</span>
                    <div className="font-mono font-semibold text-foreground mt-1">
                      {firmware.current.version}
                    </div>
                  </div>

                  {firmware.latest && (
                    <div>
                      <span className="text-muted-foreground">Latest Version:</span>
                      <div className="font-mono font-semibold text-primary mt-1">
                        {firmware.latest.version}
                      </div>
                    </div>
                  )}
                </div>

                {firmware.current.buildNumber && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Build:</span>{' '}
                    <span className="font-mono">{firmware.current.buildNumber}</span>
                  </div>
                )}

                {firmware.current.securityPatch && (
                  <div className="flex items-center gap-2 text-sm">
                    <ShieldCheck size={16} className="text-muted-foreground" />
                    <span className="text-muted-foreground">Security Patch:</span>
                    <span className="font-mono">{firmware.current.securityPatch}</span>
                  </div>
                )}

                {firmware.current.bootloaderVersion && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Bootloader:</span>{' '}
                    <span className="font-mono">{firmware.current.bootloaderVersion}</span>
                  </div>
                )}

                {firmware.current.basebandVersion && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Baseband:</span>{' '}
                    <span className="font-mono">{firmware.current.basebandVersion}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  {getSecurityStatusBadge(firmware.securityStatus)}
                  <span className="text-xs text-muted-foreground">
                    <Clock size={12} className="inline mr-1" />
                    Checked {formatDate(firmware.lastChecked)}
                  </span>
                </div>

                {firmware.releaseNotes && (
                  <div className="text-sm border-t border-border pt-2 mt-2">
                    <span className="text-muted-foreground">Release Notes:</span>
                    <p className="text-xs mt-1 text-foreground/80">{firmware.releaseNotes}</p>
                  </div>
                )}

                {firmware.downloadUrl && (
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="bg-primary text-primary-foreground"
                      onClick={() => window.open(firmware.downloadUrl, '_blank')}
                    >
                      <Download className="mr-2" size={16} weight="fill" />
                      Download Firmware
                    </Button>
                  </div>
                )}
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <XCircle size={16} weight="fill" />
                <span>{error}</span>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No firmware information available
              </div>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => checkSingleDevice(device.serial)}
            disabled={isChecking}
          >
            <ArrowClockwise size={16} className={isChecking ? 'animate-spin' : ''} />
          </Button>
        </div>
      </Card>
    );
  };

  if (devicesLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <ArrowClockwise size={20} className="animate-spin" />
          <span>Loading devices...</span>
        </div>
      </Card>
    );
  }

  if (!devices || devices.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <ShieldCheck size={48} className="text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold">No Devices Connected</h3>
          <p className="text-sm text-muted-foreground">
            Connect a device via ADB or Fastboot to check firmware versions
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlass 
              size={18} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              placeholder="Search by serial, model, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={checkFirmware}
            disabled={isChecking || deviceSerials.length === 0}
            className="bg-primary text-primary-foreground"
          >
            <ArrowClockwise size={18} className={isChecking ? 'animate-spin mr-2' : 'mr-2'} />
            Check All
          </Button>
          <Button 
            variant="outline"
            onClick={clearCache}
            disabled={Object.keys(firmwareData || {}).length === 0}
          >
            Clear Cache
          </Button>
        </div>

        {lastChecked > 0 && (
          <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
            <Clock size={12} />
            Last checked: {formatDate(lastChecked)}
          </div>
        )}
      </Card>

      <ScrollArea className="h-[600px]">
        <div className="space-y-3 pr-4">
          {filteredDevices.map(device => 
            renderDeviceFirmware(device, firmwareData?.[device.serial])
          )}
        </div>
      </ScrollArea>

      {filteredDevices.length === 0 && searchQuery && (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            No devices match "{searchQuery}"
          </div>
        </Card>
      )}
    </div>
  );
}
