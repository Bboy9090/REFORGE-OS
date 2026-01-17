import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useKV } from '@github/spark/hooks';
import { GearSix, Bell } from '@phosphor-icons/react';

interface NotificationSettings {
  enableConnectionNotifications: boolean;
  enableDisconnectionNotifications: boolean;
  notificationDuration: number;
  enableSound: boolean;
  enableVibration: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enableConnectionNotifications: true,
  enableDisconnectionNotifications: true,
  notificationDuration: 4000,
  enableSound: false,
  enableVibration: false,
};

export function USBMonitoringSettings() {
  const [settings, setSettings] = useKV<NotificationSettings>(
    'usb-monitoring-settings',
    DEFAULT_SETTINGS
  );

  const currentSettings = settings || DEFAULT_SETTINGS;

  const updateSetting = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    setSettings((current) => {
      const base = current || DEFAULT_SETTINGS;
      return {
        ...base,
        [key]: value,
      };
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GearSix size={20} className="text-primary" />
          <CardTitle>Monitoring Settings</CardTitle>
        </div>
        <CardDescription>
          Customize USB connection monitoring behavior and notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="connection-notifications" className="text-sm font-medium">
                Connection Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Show toast when devices connect
              </p>
            </div>
            <Switch
              id="connection-notifications"
              checked={currentSettings.enableConnectionNotifications}
              onCheckedChange={(checked) =>
                updateSetting('enableConnectionNotifications', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="disconnection-notifications" className="text-sm font-medium">
                Disconnection Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Show toast when devices disconnect
              </p>
            </div>
            <Switch
              id="disconnection-notifications"
              checked={currentSettings.enableDisconnectionNotifications}
              onCheckedChange={(checked) =>
                updateSetting('enableDisconnectionNotifications', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound-notifications" className="text-sm font-medium">
                Sound Alerts
              </Label>
              <p className="text-xs text-muted-foreground">
                Play sound on connection events
              </p>
            </div>
            <Switch
              id="sound-notifications"
              checked={currentSettings.enableSound}
              onCheckedChange={(checked) => updateSetting('enableSound', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="vibration" className="text-sm font-medium">
                Vibration Feedback
              </Label>
              <p className="text-xs text-muted-foreground">
                Vibrate on mobile devices
              </p>
            </div>
            <Switch
              id="vibration"
              checked={currentSettings.enableVibration}
              onCheckedChange={(checked) => updateSetting('enableVibration', checked)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="notification-duration" className="text-sm font-medium">
              Notification Duration
            </Label>
            <span className="text-xs text-muted-foreground">
              {currentSettings.notificationDuration / 1000}s
            </span>
          </div>
          <Slider
            id="notification-duration"
            min={2000}
            max={10000}
            step={1000}
            value={[currentSettings.notificationDuration]}
            onValueChange={([value]) => updateSetting('notificationDuration', value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            How long notifications stay visible
          </p>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Bell size={14} />
            <span>Settings are saved automatically and persist across sessions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function useNotificationSettings() {
  const [settings] = useKV<NotificationSettings>(
    'usb-monitoring-settings',
    DEFAULT_SETTINGS
  );

  return settings || DEFAULT_SETTINGS;
}
