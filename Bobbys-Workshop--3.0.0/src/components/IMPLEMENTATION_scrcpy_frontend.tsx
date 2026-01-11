// React Component: Android Screen Mirror Control Panel
// Frontend UI for scrcpy integration

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Monitor, StopCircle, Settings, CheckCircle, AlertCircle } from 'lucide-react';

export function AndroidScreenMirror({ device }) {
  const [scrcpyStatus, setScrcpyStatus] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({
    maxSize: 1920,
    bitRate: 8000000,
    stayAwake: true,
    showTouches: false,
    turnScreenOff: false,
    fullscreen: false,
    alwaysOnTop: true,
  });

  useEffect(() => {
    checkScrcpyStatus();
    checkActiveSession();
  }, [device?.serial]);

  const checkScrcpyStatus = async () => {
    try {
      const res = await fetch('/api/android/screen-mirror/status');
      const data = await res.json();
      setScrcpyStatus(data);
    } catch (error) {
      console.error('Failed to check scrcpy status:', error);
    }
  };

  const checkActiveSession = async () => {
    try {
      const res = await fetch('/api/android/screen-mirror/sessions');
      const data = await res.json();
      const session = data.sessions.find((s) => s.serial === device?.serial);
      setActiveSession(session || null);
    } catch (error) {
      console.error('Failed to check active session:', error);
    }
  };

  const startMirroring = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/android/screen-mirror/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serial: device.serial,
          options,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActiveSession(data);
      } else {
        toast.error('Failed to start screen mirroring', {
          description: data.error || 'Unknown error',
        });
      }
    } catch (error) {
      toast.error('Failed to start screen mirroring', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const stopMirroring = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/android/screen-mirror/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serial: device.serial }),
      });

      const data = await res.json();
      if (data.success) {
        setActiveSession(null);
      }
    } catch (error) {
      toast.error('Failed to stop screen mirroring', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!scrcpyStatus) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Checking scrcpy availability...</p>
        </CardContent>
      </Card>
    );
  }

  if (!scrcpyStatus.available) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            scrcpy Not Installed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            scrcpy is required for screen mirroring. Install it to enable this feature.
          </p>
          <div className="bg-muted p-3 rounded-md font-mono text-xs">
            # macOS
            <br />
            brew install scrcpy
            <br />
            <br />
            # Ubuntu/Debian
            <br />
            apt install scrcpy
            <br />
            <br />
            # Windows
            <br />
            scoop install scrcpy
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Screen Mirror & Control
          </div>
          {activeSession && (
            <Badge variant="success" className="bg-emerald-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Device Info */}
        <div className="p-3 bg-muted rounded-md">
          <p className="text-sm font-medium">{device.model || 'Unknown Device'}</p>
          <p className="text-xs text-muted-foreground">{device.serial}</p>
        </div>

        {/* Active Session Info */}
        {activeSession && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Mirror Active
            </p>
            <p className="text-xs text-muted-foreground">
              Session ID: {activeSession.sessionId}
            </p>
            <p className="text-xs text-muted-foreground">
              Started: {new Date(activeSession.startedAt).toLocaleTimeString()}
            </p>
          </div>
        )}

        {/* Options */}
        {!activeSession && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <Label className="font-medium">Mirror Options</Label>
            </div>

            {/* Resolution */}
            <div className="space-y-2">
              <Label className="text-xs">Max Resolution: {options.maxSize}p</Label>
              <Slider
                value={[options.maxSize]}
                onValueChange={([value]) => setOptions({ ...options, maxSize: value })}
                min={720}
                max={2560}
                step={180}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>720p</span>
                <span>1080p</span>
                <span>1440p</span>
                <span>2560p</span>
              </div>
            </div>

            {/* Bit Rate */}
            <div className="space-y-2">
              <Label className="text-xs">Bit Rate: {(options.bitRate / 1000000).toFixed(1)} Mbps</Label>
              <Slider
                value={[options.bitRate]}
                onValueChange={([value]) => setOptions({ ...options, bitRate: value })}
                min={2000000}
                max={16000000}
                step={1000000}
                className="w-full"
              />
            </div>

            {/* Toggle Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Keep Screen Awake</Label>
                <Switch
                  checked={options.stayAwake}
                  onCheckedChange={(checked) => setOptions({ ...options, stayAwake: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Show Touch Points</Label>
                <Switch
                  checked={options.showTouches}
                  onCheckedChange={(checked) => setOptions({ ...options, showTouches: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Always On Top</Label>
                <Switch
                  checked={options.alwaysOnTop}
                  onCheckedChange={(checked) => setOptions({ ...options, alwaysOnTop: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Fullscreen Mode</Label>
                <Switch
                  checked={options.fullscreen}
                  onCheckedChange={(checked) => setOptions({ ...options, fullscreen: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Turn Device Screen Off</Label>
                <Switch
                  checked={options.turnScreenOff}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, turnScreenOff: checked })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          {!activeSession ? (
            <Button
              onClick={startMirroring}
              disabled={loading || !device}
              className="flex-1"
            >
              <Monitor className="w-4 h-4 mr-2" />
              Start Mirroring
            </Button>
          ) : (
            <Button
              onClick={stopMirroring}
              disabled={loading}
              variant="destructive"
              className="flex-1"
            >
              <StopCircle className="w-4 h-4 mr-2" />
              Stop Mirroring
            </Button>
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground">
          <p>
            💡 <strong>Tip:</strong> Use keyboard shortcuts in the mirror window:
          </p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>
              <kbd>Ctrl+F</kbd> - Toggle fullscreen
            </li>
            <li>
              <kbd>Ctrl+O</kbd> - Turn device screen off
            </li>
            <li>
              <kbd>Ctrl+Shift+O</kbd> - Turn device screen on
            </li>
            <li>
              <kbd>Ctrl+P</kbd> - Power button
            </li>
            <li>
              <kbd>Ctrl+H</kbd> - Home button
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
