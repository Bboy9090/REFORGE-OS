/**
 * DeviceStateGuide.tsx
 * Shows user how to put their device in required state (DFU, Fastboot, Recovery, ADB, Normal)
 * Platform-specific instructions for iOS, Android, etc.
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Smartphone,
  Zap,
  Monitor
} from 'lucide-react';

export type DeviceState = 'dfu' | 'fastboot' | 'recovery' | 'adb' | 'normal' | 'download' | 'edl';
export type Platform = 'ios' | 'android';

interface DeviceStateGuideProps {
  requiredState: DeviceState;
  platform: Platform;
  deviceName?: string;
  defaultExpanded?: boolean;
  alwaysExpanded?: boolean;
}

const STATE_INSTRUCTIONS: Record<DeviceState, Record<Platform, { title: string; steps: string[] }>> = {
  dfu: {
    ios: {
      title: 'Enter DFU Mode (Device Firmware Update)',
      steps: [
        '1. Connect iPhone to computer via USB cable',
        '2. Force restart the device:',
        '   - iPhone 8+: Press Volume Up, press Volume Down, then hold Side Button until recovery screen appears',
        '   - iPhone 7/7 Plus: Hold Volume Down + Top/Side Button until recovery appears',
        '   - iPhone 6s/earlier: Hold Home + Top Button until recovery appears',
        '3. When "Connect to iTunes" (or "Connect to Finder") appears, DO NOT release buttons',
        '4. Continue holding buttons for ~10 seconds more until screen goes BLACK',
        '5. Release buttons when screen is black - you are now in DFU mode',
        '✓ iTunes/Finder will show "iPhone in recovery mode" or "Restore mode"',
      ]
    },
    android: {
      title: 'Enter Download Mode (Samsung only)',
      steps: [
        '1. Power off the device completely',
        '2. Use the Download Mode steps shown under DOWNLOAD state (varies by model)',
        '✓ Device should show Download/Odin screen',
      ],
    }
  },
  download: {
    ios: {
      title: 'Download Mode is not applicable to iOS',
      steps: ['Use Recovery mode or DFU mode instead.'],
    },
    android: {
      title: 'Enter Download Mode (Samsung / Odin)',
      steps: [
        '1. Power off the device completely',
        '2. Common method (many newer models): hold Volume Up + Volume Down, then plug USB into the computer',
        '3. If prompted, press Volume Up to continue into Download Mode',
        '4. Connect via USB and keep the screen on the Download/Odin screen',
        '✓ Device should be detected by Odin/Download scanners',
      ],
    },
  },
  edl: {
    ios: {
      title: 'EDL is not applicable to iOS',
      steps: ['Use Recovery mode or DFU mode instead.'],
    },
    android: {
      title: 'Enter EDL Mode (Qualcomm Emergency Download)',
      steps: [
        '1. Ensure you are authorized to service this device and have OEM/service documentation for this specific model',
        '2. Power off the device and connect via USB when instructed by the service procedure',
        '3. Install the correct USB drivers for Qualcomm interfaces on your computer',
        '4. Put the device into EDL using an approved/service method for your model (varies by OEM and device)',
        '✓ Device should enumerate as a Qualcomm interface / EDL device in Device Manager',
      ],
    },
  },
  fastboot: {
    ios: {
      title: 'Enter Recovery Mode (iOS equivalent)',
      steps: [
        '1. Connect to computer via USB',
        '2. Force restart to recovery screen (see DFU mode steps)',
        '3. When "Connect to iTunes" appears, you are in Recovery mode',
        '✓ You can now restore or update via iTunes/Finder',
      ]
    },
    android: {
      title: 'Enter Fastboot Mode',
      steps: [
        '1. Power off device',
        '2. Hold Volume Down + Power until bootloader menu appears',
        '3. Use Volume Down to navigate to "Fastboot" option',
        '4. Press Power button to select Fastboot',
        '5. Connect USB cable to computer',
        '✓ Run: fastboot devices (should list your device)',
      ]
    }
  },
  recovery: {
    ios: {
      title: 'Enter Recovery Mode',
      steps: [
        '1. Follow same process as DFU mode, but release buttons when "Connect to iTunes" appears',
        '✓ Device shows recovery/restore screen',
      ]
    },
    android: {
      title: 'Enter Recovery Mode',
      steps: [
        '1. Power off device',
        '2. Hold Volume Up + Power until recovery menu appears',
        '3. Navigate using Volume buttons, select with Power button',
        '✓ You can see boot logs and clear cache/data',
      ]
    }
  },
  adb: {
    ios: {
      title: 'Enable Developer Mode (iOS)',
      steps: [
        '1. Go to Settings > Privacy & Security > Developer Mode',
        '2. Toggle Developer Mode ON',
        '3. Confirm by tapping "Turn On" when prompted',
        '4. Device will restart',
        '5. Connect to Mac via USB',
        '✓ Open Xcode or use idevice tools',
      ]
    },
    android: {
      title: 'Enable ADB (Android Debug Bridge)',
      steps: [
        '1. Go to Settings > About Phone',
        '2. Tap "Build Number" 7 times (until you see "You are a developer")',
        '3. Go back and find Developer Options (usually in System or Advanced)',
        '4. Enable "USB Debugging"',
        '5. Connect to computer via USB',
        '6. When prompted on device: Tap "Allow" to authorize computer',
        '✓ Run: adb devices (should list your device)',
      ]
    }
  },
  normal: {
    ios: {
      title: 'Normal/Unlocked Mode',
      steps: [
        '✓ Device is powered on normally',
        '✓ Passcode is unlocked (or set to trust your computer)',
        '✓ Device is connected via USB',
      ]
    },
    android: {
      title: 'Normal/Unlocked Mode',
      steps: [
        '✓ Device is powered on normally',
        '✓ Screen is unlocked (tap "Allow" if USB authorization prompt appears)',
        '✓ Device is connected via USB',
      ]
    }
  }
};

const STATE_BADGES: Record<DeviceState, { color: string; icon: React.ReactNode }> = {
  dfu: { color: 'destructive', icon: <Zap className="h-4 w-4" /> },
  fastboot: { color: 'outline', icon: <Monitor className="h-4 w-4" /> },
  recovery: { color: 'secondary', icon: <AlertTriangle className="h-4 w-4" /> },
  adb: { color: 'default', icon: <Smartphone className="h-4 w-4" /> },
  normal: { color: 'outline', icon: <Smartphone className="h-4 w-4" /> },
  download: { color: 'outline', icon: <Monitor className="h-4 w-4" /> },
  edl: { color: 'destructive', icon: <AlertTriangle className="h-4 w-4" /> },
};

export const DeviceStateGuide: React.FC<DeviceStateGuideProps> = ({ 
  requiredState, 
  platform,
  deviceName = 'Your Device',
  defaultExpanded = true,
  alwaysExpanded = true,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const instructions = STATE_INSTRUCTIONS[requiredState][platform];
  const stateInfo = STATE_BADGES[requiredState];

  useEffect(() => {
    if (alwaysExpanded) setExpanded(true);
  }, [alwaysExpanded]);

  return (
    <div className="space-y-3">
      {!alwaysExpanded && (
        <Button
          onClick={() => setExpanded(!expanded)}
          variant="outline"
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            {stateInfo.icon}
            <span className="font-mono uppercase">{requiredState}</span>
            <span className="text-sm text-muted-foreground">Mode Required</span>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      )}

      {expanded && (
        <Card className="border-border bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{instructions.title}</CardTitle>
            <CardDescription>
              Device: <span className="font-medium">{deviceName}</span>
              <span className="mx-2 text-muted-foreground">•</span>
              Platform: <Badge variant="outline" className="ml-2">{platform.toUpperCase()}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <AlertDescription>
                <strong>Do not proceed until device is in {requiredState.toUpperCase()} mode.</strong>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              {instructions.steps.map((step, idx) => (
                <div 
                  key={idx} 
                  className="text-sm whitespace-pre-wrap text-foreground font-mono leading-relaxed p-2 rounded bg-background/80 border-l-2 border-primary"
                >
                  {step}
                </div>
              ))}
            </div>

            <Alert className="mt-4">
              <AlertDescription>
                <strong>✓ Device Ready:</strong> Once your device is in {requiredState.toUpperCase()} mode, the execute button will work.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
