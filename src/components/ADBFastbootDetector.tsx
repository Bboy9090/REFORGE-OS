import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DeviceMobile, 
  ArrowClockwise, 
  LockKey, 
  LockKeyOpen, 
  ShieldCheck, 
  ShieldWarning,
  Info,
  Circle,
  AndroidLogo,
  Warning,
  HandTap
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useAndroidDevices } from '@/hooks/use-android-devices';
import { triggerADBAuthorization } from '@/lib/adb-authorization';
import type { 
  AndroidDevice, 
  AndroidDeviceProperties, 
  FastbootDeviceProperties 
} from '@/types/android-devices';

const DEVICE_MODE_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  android_os: { label: 'Android OS', color: 'bg-green-500/10 text-green-600 border-green-500/30', icon: AndroidLogo },
  recovery: { label: 'Recovery Mode', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30', icon: ShieldWarning },
  sideload: { label: 'Sideload Mode', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: Info },
  bootloader: { label: 'Bootloader', color: 'bg-purple-500/10 text-purple-600 border-purple-500/30', icon: ShieldCheck },
  unauthorized: { label: 'Unauthorized', color: 'bg-red-500/10 text-red-600 border-red-500/30', icon: Warning },
  offline: { label: 'Offline', color: 'bg-gray-500/10 text-gray-600 border-gray-500/30', icon: Circle },
  unknown: { label: 'Unknown', color: 'bg-slate-500/10 text-slate-600 border-slate-500/30', icon: Circle }
};

export function ADBFastbootDetector() {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [authorizingDevices, setAuthorizingDevices] = useState<Set<string>>(new Set());
  const { data, devices, loading, error, refresh, adbAvailable, fastbootAvailable, adbCount, fastbootCount } = useAndroidDevices(autoRefresh, 3000);

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
    toast.success(autoRefresh ? 'Auto-refresh disabled' : 'Auto-refresh enabled');
  };

  const handleTriggerAuth = async (device: AndroidDevice) => {
    setAuthorizingDevices(prev => new Set(prev).add(device.serial));
    
    toast.info(`Check your device: ${device.serial.substring(0, 8)}...`, {
      description: 'Tap "Allow" on the USB debugging authorization dialog',
      duration: 8000,
    });

    try {
      const result = await triggerADBAuthorization(device.serial);
      
      if (result.success) {
        toast.success('Authorization prompt sent', {
          description: 'Please check your device and tap "Allow"',
        });
        
        setTimeout(() => {
          refresh();
        }, 2000);
      } else {
        toast.error('Failed to trigger authorization', {
          description: result.message,
        });
      }
    } catch (err) {
      toast.error('Authorization request failed', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setAuthorizingDevices(prev => {
        const next = new Set(prev);
        next.delete(device.serial);
        return next;
      });
    }
  };

  const getBootloaderStatusIcon = (device: AndroidDevice) => {
    if (device.source === 'fastboot') {
      const props = device.properties as FastbootDeviceProperties;
      if (props.unlocked) {
        return <LockKeyOpen size={16} weight="fill" className="text-amber-500" />;
      } else if (props.unlocked === false) {
        return <LockKey size={16} weight="fill" className="text-blue-500" />;
      }
    }
    return null;
  };

  const getSecurityBadge = (device: AndroidDevice) => {
    if (device.source === 'adb' && device.deviceMode === 'android_os') {
      const props = device.properties as AndroidDeviceProperties;
      if (props.secure === false && props.debuggable) {
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            <ShieldWarning size={12} className="mr-1" />
            Debug Build
          </Badge>
        );
      } else if (props.secure) {
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
            <ShieldCheck size={12} className="mr-1" />
            Secure
          </Badge>
        );
      }
    }
    
    if (device.source === 'fastboot') {
      const props = device.properties as FastbootDeviceProperties;
      if (props.secure) {
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
            <ShieldCheck size={12} className="mr-1" />
            Secure Boot
          </Badge>
        );
      }
    }
    
    return null;
  };

  const getDeviceDisplayName = (device: AndroidDevice) => {
    if (device.source === 'adb' && device.deviceMode === 'android_os') {
      const props = device.properties as AndroidDeviceProperties;
      if (props.manufacturer && props.model) {
        return `${props.manufacturer} ${props.model}`;
      }
      if (props.brand && props.model) {
        return `${props.brand} ${props.model}`;
      }
    }
    
    if (device.source === 'fastboot') {
      const props = device.properties as FastbootDeviceProperties;
      if (props.product) {
        return props.product;
      }
    }
    
    return device.model || device.product || device.serial;
  };

  const renderDeviceDetails = (device: AndroidDevice) => {
    if (device.source === 'adb' && device.deviceMode === 'android_os') {
      const props = device.properties as AndroidDeviceProperties;
      return (
        <div className="grid grid-cols-2 gap-2 text-xs">
          {props.manufacturer && (
            <div>
              <span className="text-muted-foreground">Manufacturer:</span>
              <span className="ml-2 font-medium">{props.manufacturer}</span>
            </div>
          )}
          {props.model && (
            <div>
              <span className="text-muted-foreground">Model:</span>
              <span className="ml-2 font-medium">{props.model}</span>
            </div>
          )}
          {props.androidVersion && (
            <div>
              <span className="text-muted-foreground">Android:</span>
              <span className="ml-2 font-medium">{props.androidVersion} (API {props.sdkVersion})</span>
            </div>
          )}
          {props.buildId && (
            <div>
              <span className="text-muted-foreground">Build:</span>
              <span className="ml-2 font-medium">{props.buildId}</span>
            </div>
          )}
          {props.bootloader && (
            <div>
              <span className="text-muted-foreground">Bootloader:</span>
              <span className="ml-2 font-medium">{props.bootloader}</span>
            </div>
          )}
        </div>
      );
    }
    
    if (device.source === 'fastboot') {
      const props = device.properties as FastbootDeviceProperties;
      return (
        <div className="grid grid-cols-2 gap-2 text-xs">
          {props.product && (
            <div>
              <span className="text-muted-foreground">Product:</span>
              <span className="ml-2 font-medium">{props.product}</span>
            </div>
          )}
          {props.variant && (
            <div>
              <span className="text-muted-foreground">Variant:</span>
              <span className="ml-2 font-medium">{props.variant}</span>
            </div>
          )}
          {props.bootloaderVersion && (
            <div>
              <span className="text-muted-foreground">Bootloader:</span>
              <span className="ml-2 font-medium">{props.bootloaderVersion}</span>
            </div>
          )}
          {props.basebandVersion && (
            <div>
              <span className="text-muted-foreground">Baseband:</span>
              <span className="ml-2 font-medium">{props.basebandVersion}</span>
            </div>
          )}
          {props.bootloaderState && (
            <div>
              <span className="text-muted-foreground">Bootloader:</span>
              <span className="ml-2 font-medium capitalize">{props.bootloaderState}</span>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DeviceMobile size={20} className="text-primary" />
            <CardTitle>ADB / Fastboot Devices</CardTitle>
            {autoRefresh && (
              <div className="flex items-center gap-1.5 text-xs text-green-600">
                <Circle size={8} weight="fill" className="animate-pulse" />
                <span className="hidden sm:inline">Auto-refresh</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={toggleAutoRefresh}
            >
              <Circle size={16} weight="fill" className={autoRefresh ? 'animate-pulse' : ''} />
              {autoRefresh ? 'Stop' : 'Auto'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
            >
              <ArrowClockwise size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </Button>
          </div>
        </div>
        <CardDescription>
          Bootloader mode recognition and device state detection via ADB/Fastboot
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {data && (
          <div className="space-y-4">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={adbAvailable ? 'bg-green-500/10 text-green-600 border-green-500/30' : 'bg-gray-500/10 text-gray-600 border-gray-500/30'}>
                  ADB {adbAvailable ? '✓' : '✗'}
                </Badge>
                <span className="text-muted-foreground">{adbCount} devices</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={fastbootAvailable ? 'bg-green-500/10 text-green-600 border-green-500/30' : 'bg-gray-500/10 text-gray-600 border-gray-500/30'}>
                  Fastboot {fastbootAvailable ? '✓' : '✗'}
                </Badge>
                <span className="text-muted-foreground">{fastbootCount} devices</span>
              </div>
            </div>

            <Separator />

            {loading && devices.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <ArrowClockwise size={24} className="animate-spin mr-2" />
                Scanning for Android devices...
              </div>
            ) : devices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DeviceMobile size={48} className="mx-auto mb-2 opacity-50" />
                <p>No Android devices detected</p>
                <p className="text-xs mt-1">Connect a device via USB and enable USB debugging</p>
              </div>
            ) : (
              <div className="space-y-3">
                {devices.map((device) => {
                  const modeInfo = DEVICE_MODE_LABELS[device.deviceMode] || DEVICE_MODE_LABELS.unknown;
                  const ModeIcon = modeInfo.icon;
                  
                  const isUnauthorized = device.deviceMode === 'unauthorized';
                  const isAuthorizing = authorizingDevices.has(device.serial);
                  
                  return (
                    <div
                      key={device.id}
                      className="rounded-lg border bg-card p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{getDeviceDisplayName(device)}</h4>
                            {getBootloaderStatusIcon(device)}
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">
                            Serial: {device.serial}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Badge variant="outline" className={modeInfo.color}>
                            <ModeIcon size={12} className="mr-1" />
                            {modeInfo.label}
                          </Badge>
                          {getSecurityBadge(device)}
                          <Badge variant="outline" className="text-xs">
                            {device.source.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      {renderDeviceDetails(device)}
                      
                      {isUnauthorized && device.source === 'adb' && (
                        <div className="pt-3 border-t">
                          <Alert className="mb-3">
                            <Info size={16} />
                            <AlertDescription className="text-xs">
                              This device needs USB debugging authorization. Click the button below to trigger the trust dialog on your phone.
                            </AlertDescription>
                          </Alert>
                          <Button
                            size="sm"
                            onClick={() => handleTriggerAuth(device)}
                            disabled={isAuthorizing}
                            className="w-full"
                          >
                            <HandTap size={16} className={isAuthorizing ? 'animate-pulse' : ''} />
                            {isAuthorizing ? 'Requesting Authorization...' : 'Trigger Authorization Dialog'}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
