import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Code, Copy, CheckCircle } from '@phosphor-icons/react';
import { useState } from 'react';
import { copyTextToClipboard } from '@/lib/clipboard';

export function BackendAPIGuide() {
  const [copied, setCopied] = useState('');

  const copyToClipboard = async (text: string, id: string) => {
    const didCopy = await copyTextToClipboard(text, {
      successMessage: 'Copied to clipboard',
      unavailableMessage: 'Clipboard access is unavailable. Please copy the snippet manually.'
    });

    if (!didCopy) return;

    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const systemDetectEndpoint = `
// Backend API Endpoint: POST /api/system/detect
// Request body: { tool: string, command: string }

app.post('/api/system/detect', async (req, res) => {
  const { tool, command } = req.body;
  try {
    const { exec } = require('child_process');
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return res.json({
          installed: false,
          version: null,
          path: null
        });
      }
      
      res.json({
        installed: true,
        version: stdout.trim(),
        path: stderr || null
      });
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to detect tool' });
  }
});
`.trim();

  const adbDevicesEndpoint = `
// Backend API Endpoint: GET /api/system/adb-devices

app.get('/api/system/adb-devices', async (req, res) => {
  const { exec } = require('child_process');
  exec('adb devices -l', (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'ADB not available' });
    }
    res.json({ devices_raw: stdout });
  });
});
`.trim();

  const networkScanEndpoint = `
// Backend API Endpoint: POST /api/network/scan

app.post('/api/network/scan', async (req, res) => {
  const { exec } = require('child_process');
  
  // Example using arp-scan or nmap
  exec('arp -a', (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Network scan failed' });
    }
    
    // Parse ARP output and return devices
    const devices = parseArpOutput(stdout);
    res.json({ devices });
  });
});

function parseArpOutput(output) {
  // Parse network device information
  const lines = output.split('\\n');
  const devices = [];
  
  for (const line of lines) {
    const match = line.match(/([\\d.]+).*?([0-9a-f:]{17})/i);
    if (match) {
      devices.push({
        ip: match[1],
        mac: match[2],
        hostname: 'device.local',
        ports: [80, 443],
        services: ['http']
      });
    }
  }
  
  return devices;
}
`.trim();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Code size={20} className="text-primary" />
          <CardTitle>Backend API Implementation Guide</CardTitle>
        </div>
        <CardDescription>
          Example endpoints for system tool detection, USB devices, and network scanning
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTitle>Note</AlertTitle>
          <AlertDescription>
            The frontend is ready to detect devices through these API endpoints. Implement these on your backend server (Express, Flask, etc.) to enable full detection capabilities.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">System Tool Detection</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(systemDetectEndpoint, 'system')}
              >
                {copied === 'system' ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} />
                )}
              </Button>
            </div>
            <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
              <code>{systemDetectEndpoint}</code>
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">ADB Device Detection</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(adbDevicesEndpoint, 'adb')}
              >
                {copied === 'adb' ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} />
                )}
              </Button>
            </div>
            <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
              <code>{adbDevicesEndpoint}</code>
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Network Scanner</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(networkScanEndpoint, 'network')}
              >
                {copied === 'network' ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} />
                )}
              </Button>
            </div>
            <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
              <code>{networkScanEndpoint}</code>
            </pre>
          </div>
        </div>

        <Alert>
          <AlertTitle>WebUSB API</AlertTitle>
          <AlertDescription>
            USB device detection works entirely in the browser using the WebUSB API - no backend needed! Just click "Add Device" in the USB Devices panel and grant permission when prompted.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
