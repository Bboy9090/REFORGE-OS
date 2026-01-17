import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GitBranch,
  Code,
  FileCode,
  Terminal, 
  Folder,
  CheckCircle,
  Info,
  Copy,
  Download
} from '@phosphor-icons/react';
import { useState } from 'react';
import { ExportPandoraCodexFiles } from './ExportPandoraCodexFiles';
import { copyTextToClipboard } from '@/lib/clipboard';

export function PandoraCodexIntegrationGuide() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = async (text: string, section: string) => {
    const didCopy = await copyTextToClipboard(text, {
      successMessage: `${section} copied to clipboard!`,
      unavailableMessage: 'Clipboard access is unavailable. Please copy the content manually.'
    });

    if (!didCopy) return;

    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const steps = [
    {
      id: 1,
      title: 'Clone Your Pandora Codex Repository',
      description: 'Start by cloning your existing repository to work with',
      code: `# Clone your Pandora Codex repo
git clone https://github.com/yourusername/pandora-codex.git
cd pandora-codex`,
      language: 'bash'
    },
    {
      id: 2,
      title: 'Install Device Detection Dependencies',
      description: 'Add the required packages for device detection',
      code: `# Install detection system dependencies
npm install @phosphor-icons/react framer-motion sonner
npm install --save-dev @types/w3c-web-usb`,
      language: 'bash'
    },
    {
      id: 3,
      title: 'Copy Detection Components',
      description: 'Copy all device detection components to your project',
      files: [
        'BobbyDevPanel.tsx',
        'USBDeviceDetector.tsx',
        'USBConnectionMonitor.tsx',
        'USBDeviceClassDetector.tsx',
        'NetworkDeviceScanner.tsx',
        'SystemToolsDetector.tsx',
        'DeviceAnalyticsDashboard.tsx',
        'DeviceHealthMonitor.tsx',
        'DeviceTimelineVisualizer.tsx',
        'DeviceInsightsPanel.tsx',
        'USBMonitoringStats.tsx',
        'USBMonitoringSettings.tsx'
      ]
    },
    {
      id: 4,
      title: 'Copy Backend Server',
      description: 'Set up the backend API for system tool detection',
      code: `# Copy the entire server directory
cp -r /path/to/detection-system/server ./server

# Install server dependencies
cd server
npm install
cd ..`,
      language: 'bash'
    },
    {
      id: 5,
      title: 'Add TypeScript Types',
      description: 'Add WebUSB type definitions',
      code: `// src/types/webusb.d.ts
interface USB extends EventTarget {
  getDevices(): Promise<USBDevice[]>;
  requestDevice(options?: USBDeviceRequestOptions): Promise<USBDevice>;
  addEventListener(type: 'connect' | 'disconnect', listener: (this: this, ev: USBConnectionEvent) => any): void;
  removeEventListener(type: 'connect' | 'disconnect', listener: (this: this, ev: USBConnectionEvent) => any): void;
}

interface USBConnectionEvent extends Event {
  device: USBDevice;
}

interface Navigator {
  usb?: USB;
}`,
      language: 'typescript'
    }
  ];

  const integrationPatterns = [
    {
      title: 'Device Flashing Integration',
      description: 'Use device detection for your bootloader/recovery flashing',
      code: `// In your device flashing component
import { USBDeviceDetector } from './components/USBDeviceDetector';
import { USBConnectionMonitor } from './components/USBConnectionMonitor';

function FlashingInterface() {
  const [selectedDevice, setSelectedDevice] = useState(null);
  
  return (
    <>
      <USBDeviceDetector onDeviceSelect={setSelectedDevice} />
      {selectedDevice && (
        <FlashingControls device={selectedDevice} />
      )}
    </>
  );
}`,
      language: 'typescript'
    },
    {
      title: 'Device Health Monitoring',
      description: 'Monitor connected devices during development/flashing',
      code: `// Monitor device health during operations
import { DeviceHealthMonitor } from './components/DeviceHealthMonitor';

function DeviceOperations() {
  return (
    <div className="space-y-4">
      <DeviceHealthMonitor />
      <FlashingInterface />
      <RecoveryTools />
    </div>
  );
}`,
      language: 'typescript'
    },
    {
      title: 'Analytics Integration',
      description: 'Track device connections and operations',
      code: `// Track device operations
import { DeviceAnalyticsDashboard } from './components/DeviceAnalyticsDashboard';
import { DeviceTimelineVisualizer } from './components/DeviceTimelineVisualizer';

function AnalyticsView() {
  return (
    <div className="grid gap-6">
      <DeviceAnalyticsDashboard />
      <DeviceTimelineVisualizer />
    </div>
  );
}`,
      language: 'typescript'
    }
  ];

  const useCases = [
    {
      icon: <FileCode size={24} />,
      title: 'Bootloader Detection',
      description: 'Automatically detect devices in bootloader/fastboot mode',
      features: ['Fastboot device detection', 'ADB device detection', 'Recovery mode identification']
    },
    {
      icon: <Terminal size={24} />,
      title: 'Flashing Operations',
      description: 'Monitor device state during ROM/recovery flashing',
      features: ['Real-time connection monitoring', 'Device health tracking', 'Operation logging']
    },
    {
      icon: <Code size={24} />,
      title: 'Development Tools',
      description: 'Integrate with your existing dev environment',
      features: ['System tool detection', 'Environment validation', 'Multi-device support']
    }
  ];

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <GitBranch size={32} className="text-primary" />
            <div>
              <CardTitle className="text-3xl">Pandora Codex Integration Guide</CardTitle>
              <CardDescription className="text-base mt-1">
                How to integrate the Bobby Dev Arsenal detection system into your Pandora Codex repository
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info size={20} />
            <AlertTitle>About This Guide</AlertTitle>
            <AlertDescription>
              This guide shows you how to integrate the complete device detection system into your Pandora Codex GitHub repository.
              All detection features work with real hardware—no fake data or simulations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <ExportPandoraCodexFiles />

      <Card>
        <CardHeader>
          <CardTitle>Use Cases for Pandora Codex</CardTitle>
          <CardDescription>How this detection system benefits your project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {useCases.map((useCase, idx) => (
              <div key={idx} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  {useCase.icon}
                  <h3 className="font-semibold">{useCase.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{useCase.description}</p>
                <ul className="space-y-1">
                  {useCase.features.map((feature, fidx) => (
                    <li key={fidx} className="text-xs flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step-by-Step Integration</CardTitle>
          <CardDescription>Follow these steps to integrate the detection system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge className="shrink-0">{step.id}</Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>

                {step.code && (
                  <div className="relative">
                    <div className="absolute top-2 right-2 z-10">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(step.code!, `Step ${step.id}`)}
                      >
                        {copiedSection === `Step ${step.id}` ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{step.code}</code>
                    </pre>
                  </div>
                )}

                {step.files && (
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Folder size={20} className="text-primary" />
                      <span className="font-medium text-sm">Copy these files to your project:</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {step.files.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm bg-muted px-3 py-2 rounded">
                          <FileCode size={16} className="text-muted-foreground" />
                          <code className="text-xs">{file}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration Patterns</CardTitle>
          <CardDescription>Example code for integrating with Pandora Codex features</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="0" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
              {integrationPatterns.map((pattern, idx) => (
                <TabsTrigger key={idx} value={idx.toString()}>
                  {pattern.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {integrationPatterns.map((pattern, idx) => (
              <TabsContent key={idx} value={idx.toString()} className="space-y-3">
                <p className="text-sm text-muted-foreground">{pattern.description}</p>
                <div className="relative">
                  <div className="absolute top-2 right-2 z-10">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(pattern.code, pattern.title)}
                    >
                      {copiedSection === pattern.title ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{pattern.code}</code>
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Directory Structure</CardTitle>
          <CardDescription>Recommended file organization for Pandora Codex</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`pandora-codex/
├── src/
│   ├── components/
│   │   ├── detection/              # Device detection components
│   │   │   ├── BobbyDevPanel.tsx
│   │   │   ├── USBDeviceDetector.tsx
│   │   │   ├── USBConnectionMonitor.tsx
│   │   │   ├── NetworkDeviceScanner.tsx
│   │   │   └── SystemToolsDetector.tsx
│   │   ├── analytics/              # Analytics components
│   │   │   ├── DeviceAnalyticsDashboard.tsx
│   │   │   ├── DeviceHealthMonitor.tsx
│   │   │   └── DeviceTimelineVisualizer.tsx
│   │   └── flashing/               # Your existing flashing UI
│   │       ├── FlashingInterface.tsx
│   │       └── RecoveryTools.tsx
│   ├── hooks/
│   │   ├── use-device-detection.ts # Detection hooks
│   │   └── use-usb-monitor.ts
│   └── types/
│       └── webusb.d.ts            # WebUSB types
├── server/                         # Backend API
│   ├── index.js
│   ├── routes/
│   │   └── system-tools.js
│   └── package.json
└── scripts/                        # Utility scripts
    ├── check-rust.js
    ├── check-android-tools.js
    └── dev-arsenal-status.js`}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <CheckCircle size={20} className="text-green-500" />
              <AlertTitle>Ready to Integrate</AlertTitle>
              <AlertDescription>
                Follow the steps above to copy these components into your Pandora Codex repository.
                All features use real device detection—no simulated data.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start">
                <Download size={20} />
                Export All Components
              </Button>
              <Button variant="outline" className="justify-start">
                <FileCode size={20} />
                View Full Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-500/50 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info size={24} className="text-blue-500" />
            Important Notes for Pandora Codex
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <p className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span><strong>WebUSB Permissions:</strong> Users must grant permission for device access. This is a browser security feature.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span><strong>HTTPS Required:</strong> WebUSB only works over HTTPS (or localhost for development).</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span><strong>Browser Support:</strong> WebUSB is supported in Chrome, Edge, and Opera. Firefox support is limited.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span><strong>Backend Server:</strong> The system tools detector requires a local backend server (included in this system).</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span><strong>Real Hardware Only:</strong> All detection works with actual connected devices—perfect for your bootloader/recovery work.</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
