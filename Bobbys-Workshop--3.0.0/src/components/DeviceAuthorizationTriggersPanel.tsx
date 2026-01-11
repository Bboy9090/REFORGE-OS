import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ShieldCheck,
  DeviceMobile,
  Lightning,
  LockKey,
  FileArrowUp,
  Database,
  Fingerprint,
  ShieldWarning,
  CheckCircle,
  XCircle,
  Clock
} from '@phosphor-icons/react';
import { authTriggers, type DevicePlatform, type AuthorizationTriggerResult } from '@/lib/device-authorization-triggers';
import { toast } from 'sonner';

interface DeviceAuthorizationTriggersProps {
  deviceSerial: string;
  devicePlatform: DevicePlatform;
  deviceName?: string;
}

interface TriggerAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  platform: DevicePlatform[];
  action: (serial: string) => Promise<AuthorizationTriggerResult>;
  requiresUserAction: boolean;
}

const TRIGGER_ACTIONS: TriggerAction[] = [
  {
    id: 'adb_usb_debugging',
    label: 'ADB USB Debugging',
    description: 'Trigger "Allow USB debugging?" dialog on Android device',
    icon: <ShieldCheck className="w-4 h-4" />,
    platform: ['android', 'samsung'],
    action: (serial) => authTriggers.triggerADBUSBDebugging(serial),
    requiresUserAction: true,
  },
  {
    id: 'file_transfer',
    label: 'File Transfer Authorization',
    description: 'Trigger file transfer permission dialog',
    icon: <FileArrowUp className="w-4 h-4" />,
    platform: ['android', 'samsung'],
    action: (serial) => authTriggers.triggerADBFileTransfer(serial),
    requiresUserAction: true,
  },
  {
    id: 'backup_auth',
    label: 'Backup Authorization',
    description: 'Trigger backup authorization and encryption dialog',
    icon: <Database className="w-4 h-4" />,
    platform: ['android', 'samsung'],
    action: (serial) => authTriggers.triggerADBBackupAuth(serial),
    requiresUserAction: true,
  },
  {
    id: 'ios_trust',
    label: 'Trust This Computer',
    description: 'Trigger "Trust This Computer?" dialog on iOS device',
    icon: <ShieldCheck className="w-4 h-4" />,
    platform: ['ios'],
    action: (serial) => authTriggers.triggerIOSTrustComputer(serial),
    requiresUserAction: true,
  },
  {
    id: 'ios_pairing',
    label: 'iOS Pairing Request',
    description: 'Send pairing request to establish device connection',
    icon: <Fingerprint className="w-4 h-4" />,
    platform: ['ios'],
    action: (serial) => authTriggers.triggerIOSPairing(serial),
    requiresUserAction: true,
  },
  {
    id: 'ios_backup',
    label: 'iOS Backup Encryption',
    description: 'Trigger backup encryption authorization dialog',
    icon: <LockKey className="w-4 h-4" />,
    platform: ['ios'],
    action: (serial) => authTriggers.triggerIOSBackupEncryption(serial),
    requiresUserAction: true,
  },
  {
    id: 'fastboot_unlock',
    label: 'Fastboot Unlock Verify',
    description: 'Verify bootloader unlock status',
    icon: <Lightning className="w-4 h-4" />,
    platform: ['android', 'samsung'],
    action: (serial) => authTriggers.triggerFastbootUnlockVerify(serial),
    requiresUserAction: false,
  },
  {
    id: 'ios_dfu',
    label: 'DFU/Recovery Mode',
    description: 'Enter DFU or Recovery mode (shows warning on device)',
    icon: <ShieldWarning className="w-4 h-4" />,
    platform: ['ios'],
    action: (serial) => authTriggers.triggerDFUModeEntry(serial),
    requiresUserAction: true,
  },
  {
    id: 'samsung_download',
    label: 'Download Mode Verify',
    description: 'Verify Samsung Download Mode connectivity',
    icon: <DeviceMobile className="w-4 h-4" />,
    platform: ['samsung'],
    action: (serial) => authTriggers.triggerOdinDownloadMode(serial),
    requiresUserAction: false,
  },
  {
    id: 'qualcomm_edl',
    label: 'EDL Authorization Check',
    description: 'Verify Qualcomm EDL mode authorization',
    icon: <LockKey className="w-4 h-4" />,
    platform: ['qualcomm'],
    action: (serial) => authTriggers.triggerEDLAuthorization(serial),
    requiresUserAction: false,
  },
  {
    id: 'mediatek_flash',
    label: 'MTK SP Flash Auth',
    description: 'Check MediaTek SP Flash Tool authorization',
    icon: <Lightning className="w-4 h-4" />,
    platform: ['mediatek'],
    action: (serial) => authTriggers.triggerMTKSPFlashAuth(serial),
    requiresUserAction: false,
  },
];

export function DeviceAuthorizationTriggersPanel({
  deviceSerial,
  devicePlatform,
  deviceName,
}: DeviceAuthorizationTriggersProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Map<string, AuthorizationTriggerResult>>(new Map());

  const availableActions = TRIGGER_ACTIONS.filter((action) =>
    action.platform.includes(devicePlatform)
  );

  const handleTrigger = async (action: TriggerAction) => {
    setLoading(action.id);
    
    try {
      const result = await action.action(deviceSerial);
      
      setResults((prev) => new Map(prev).set(action.id, result));

      if (result.success) {
        toast.success(action.label, {
          description: result.message,
        });
      } else {
        toast.error(action.label, {
          description: result.message,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(action.label, {
        description: `Failed: ${message}`,
      });
    } finally {
      setLoading(null);
    }
  };

  const handleTriggerAll = async () => {
    setLoading('all');
    
    try {
      const response = await authTriggers.triggerAllAvailableAuthorizations(
        deviceSerial,
        devicePlatform
      );

      const newResults = new Map<string, AuthorizationTriggerResult>();
      for (const result of response.results || []) {
        newResults.set(result.triggerId, result);
      }

      setResults(newResults);

      const successCount = (response.results || []).filter((r) => r.success).length;
      toast.success('Authorization Triggers', {
        description: `Triggered ${successCount}/${(response.results || []).length} authorization checks`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to trigger all authorizations', {
        description: message,
      });
    } finally {
      setLoading(null);
    }
  };

  const getResultIcon = (actionId: string) => {
    const result = results.get(actionId);
    if (!result) return <Clock className="w-4 h-4 text-muted-foreground" />;
    if (result.success) return <CheckCircle className="w-4 h-4 text-success" />;
    return <XCircle className="w-4 h-4 text-destructive" />;
  };

  if (availableActions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Authorization Triggers
          </CardTitle>
          <CardDescription>
            No authorization triggers available for this device platform
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Authorization Triggers
            </CardTitle>
            <CardDescription>
              {deviceName || deviceSerial} • {devicePlatform.toUpperCase()}
            </CardDescription>
          </div>
          <Button
            onClick={handleTriggerAll}
            disabled={loading !== null}
            variant="outline"
            size="sm"
          >
            <Lightning className="w-4 h-4 mr-2" />
            Trigger All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {availableActions.map((action) => {
              const result = results.get(action.id);
              const isLoading = loading === action.id || loading === 'all';

              return (
                <div
                  key={action.id}
                  className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                    {action.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{action.label}</h4>
                      {action.requiresUserAction && (
                        <Badge variant="secondary" className="text-xs">
                          User Action Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {action.description}
                    </p>

                    {result && (
                      <div className="flex items-center gap-2 mt-2 p-2 rounded bg-muted/50">
                        {getResultIcon(action.id)}
                        <span className="text-xs text-muted-foreground">
                          {result.message}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleTrigger(action)}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                  >
                    {isLoading ? 'Triggering...' : 'Trigger'}
                  </Button>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Note:</strong> Triggers marked "User Action Required" will 
            display authorization dialogs on the connected device. Make sure the device screen is unlocked 
            and accessible to approve the requests.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
