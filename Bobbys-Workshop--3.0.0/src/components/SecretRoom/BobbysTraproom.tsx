/**
 * Bobby's Traproom
 * The underground spot where the most powerful bypasses and exploits live
 * Unethical practices and experimental exploitations
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Unlock,
  Skull,
  Zap,
  Fingerprint,
  Key,
  Database
} from 'lucide-react';
import { toast } from 'sonner';
import { useSoundEffect } from '@/lib/soundManager';
import { DeviceStateGuide, DeviceState } from '../DeviceStateGuide';
import { SECRET_ROOM_PASSWORD, DEV_ADMIN_API_KEY, getApiUrl } from '@/lib/secrets';

interface BypassTool {
  id: string;
  name: string;
  description: string;
  category: 'frp' | 'mdm' | 'bootloader' | 'icloud' | 'knox' | 'oem';
  power: 'extreme' | 'high' | 'medium';
  risk: 'legal-gray' | 'experimental' | 'dangerous';
  status: 'ready' | 'testing' | 'restricted';
  requiredStates: { ios?: DeviceState; android?: DeviceState };
  apiEndpoint: string;
}

const TRAP_TOOLS: BypassTool[] = [
  {
    id: 'frp-quantum',
    name: 'FRP Quantum Bypass',
    description: 'Advanced FRP bypass with ADB protocol',
    category: 'frp',
    power: 'extreme',
    risk: 'legal-gray',
    status: 'ready',
    requiredStates: { android: 'adb' },
    apiEndpoint: '/api/v1/trapdoor/bypass/frp'
  },
  {
    id: 'icloud-phantom',
    name: 'iCloud Phantom Unlock',
    description: 'Experimental iCloud activation lock bypass (A12-A15)',
    category: 'icloud',
    power: 'extreme',
    risk: 'dangerous',
    status: 'testing',
    requiredStates: { ios: 'dfu' },
    apiEndpoint: '/api/v1/trapdoor/bypass/icloud'
  },
  {
    id: 'knox-destroyer',
    name: 'Knox Destroyer v3',
    description: 'Samsung Knox counter bypass and bit manipulation',
    category: 'knox',
    power: 'extreme',
    risk: 'experimental',
    status: 'ready',
    requiredStates: { android: 'fastboot' },
    apiEndpoint: '/api/v1/trapdoor/bypass/knox'
  },
  {
    id: 'bootloader-ghost',
    name: 'Bootloader Ghost Protocol',
    description: 'Universal bootloader unlock without OEM authorization',
    category: 'bootloader',
    power: 'high',
    risk: 'legal-gray',
    status: 'ready',
    requiredStates: { android: 'fastboot', ios: 'dfu' },
    apiEndpoint: '/api/v1/trapdoor/bypass/bootloader'
  },
  {
    id: 'mdm-shadow',
    name: 'MDM Shadow Removal',
    description: 'Enterprise MDM profile removal without trace',
    category: 'mdm',
    power: 'high',
    risk: 'dangerous',
    status: 'restricted',
    requiredStates: { android: 'adb', ios: 'normal' },
    apiEndpoint: '/api/v1/trapdoor/bypass/mdm'
  },
  {
    id: 'oem-skeleton-key',
    name: 'OEM Skeleton Key',
    description: 'Master key generator for manufacturer locks',
    category: 'oem',
    power: 'extreme',
    risk: 'experimental',
    status: 'testing',
    requiredStates: { android: 'fastboot', ios: 'recovery' },
    apiEndpoint: '/api/v1/trapdoor/bypass/oem'
  }
];

export const BobbysTraproom: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<BypassTool | null>(null);
  const [devicePlatform, setDevicePlatform] = useState<'ios' | 'android'>('android');
  const [deviceSerial, setDeviceSerial] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [executing, setExecuting] = useState(false);
  const playUnlock = useSoundEffect('spray-can');
  const playSelect = useSoundEffect('basketball-bounce');
  const playExecute = useSoundEffect('air-horn');
  const playError = useSoundEffect('vinyl-scratch');

  const handleToolSelect = (tool: BypassTool) => {
    playSelect();
    setSelectedTool(tool);
    toast.info(`Selected: ${tool.name}`, {
      description: tool.description
    });
  };

  const handleExecute = async () => {
    if (!selectedTool) return;
    if (!authenticated) {
      playError();
      toast.error('🚫 Authentication Required', {
        description: 'Access to Traproom tools requires authorization'
      });
      return;
    }

    if (selectedTool.status === 'restricted') {
      playError();
      toast.error('Restricted Tool', {
        description: `${selectedTool.name} is restricted and cannot be executed.`
      });
      return;
    }

    if (!deviceSerial) {
      playError();
      toast.error('Device Serial Required', {
        description: 'Enter your device serial number or UDID'
      });
      return;
    }

    setExecuting(true);
    playExecute();

    try {
      const response = await fetch(getApiUrl(selectedTool.apiEndpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Secret-Room-Passcode': SECRET_ROOM_PASSWORD,
          'X-API-Key': DEV_ADMIN_API_KEY
        },
        body: JSON.stringify({
          deviceSerial,
          platform: devicePlatform,
          authorization: {
            confirmed: true,
            userInput: `EXECUTE_${selectedTool.id.toUpperCase()}`
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        playError();
        toast.error('Execution Failed', {
          description: data.message || 'Check device state and try again'
        });
        return;
      }

      toast.success('✅ Bypass Executed', {
        description: `${selectedTool.name} completed. Check device status.`
      });
      
      setSelectedTool(null);
    } catch (err: any) {
      playError();
      toast.error('Network Error', {
        description: err.message || 'Could not reach server'
      });
    } finally {
      setExecuting(false);
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === SECRET_ROOM_PASSWORD) {
      playUnlock();
      setAuthenticated(true);
      setPasswordError(false);
      setPasswordInput('');
    } else {
      playError();
      setPasswordError(true);
      setPasswordInput('');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen workshop-bg text-white p-6 flex items-center justify-center">
        <Card className="w-full max-w-md cassette-tape">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Skull className="h-5 w-5" />
              Bobby's Traproom
            </CardTitle>
            <CardDescription>Enter password to access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPasswordError(false);
              }}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              className="bg-[#1A1F2C] border-red-500/30 text-white"
            />
            {passwordError && (
              <Alert className="bg-red-500/20 border-red-500">
                <AlertDescription className="text-red-300">Invalid password</AlertDescription>
              </Alert>
            )}
            <Button 
              onClick={handlePasswordSubmit}
              className="w-full jordan-bred"
            >
              💀 Unlock Traproom 💀
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  const getPowerColor = (power: string) => {
    switch (power) {
      case 'extreme': return 'text-red-500';
      case 'high': return 'text-orange-500';
      default: return 'text-yellow-500';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'dangerous': return 'destructive';
      case 'experimental': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen workshop-bg p-6 floor-grid">
      <div className="max-w-7xl mx-auto">
        {/* Header with skull emoji */}
        <header className="mb-8 graffiti-tag">
          <div className="flex items-center gap-3 mb-2">
            <Skull className="h-8 w-8 text-destructive animate-pulse" />
            <h1 className="street-sign-text text-3xl">
              💀 BOBBY'S TRAPROOM 💀
            </h1>
          </div>
          <p className="text-muted-foreground">
            🔥 The underground spot • Most powerful bypasses • Experimental exploits 🔥
          </p>
        </header>

        {/* Warning Banner */}
        <Alert className="mb-6 sneaker-box-card border-destructive">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-foreground">
            <strong className="text-destructive">⚠️ DANGER ZONE:</strong> These tools operate in legal gray areas.
            Use ONLY on devices you own or have explicit written authorization. Unauthorized use is a federal crime.
            No warranties. No guarantees. You break it, you bought it. 💯
          </AlertDescription>
        </Alert>

        {/* Authentication Status */}
        <Card className="mb-6 phone-stack candy-shimmer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Traproom Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`status-led ${authenticated ? 'connected' : 'disconnected'}`} />
                <span className="font-mono">
                  {authenticated ? '✅ AUTHORIZED' : '🔒 LOCKED'}
                </span>
              </div>
              <Button
                onClick={() => setAuthenticated(!authenticated)}
                variant={authenticated ? 'outline' : 'default'}
                className="btn-sneaker"
              >
                <Fingerprint className="h-4 w-4 mr-2" />
                {authenticated ? 'Lock' : 'Authenticate'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {TRAP_TOOLS.map((tool) => (
            <Card
              key={tool.id}
              className={`device-card-console cursor-pointer transition-all hover:scale-105 ${
                selectedTool?.id === tool.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleToolSelect(tool)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className={`h-5 w-5 ${getPowerColor(tool.power)}`} />
                    {tool.name}
                  </CardTitle>
                  <Badge variant={getRiskBadge(tool.risk)} className="text-xs">
                    {tool.risk}
                  </Badge>
                </div>
                <CardDescription className="text-xs console-text">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="outline" className="sticker-worn">
                    {tool.category.toUpperCase()}
                  </Badge>
                  <span className={`font-mono text-xs ${
                    tool.status === 'ready' ? 'text-success' : 
                    tool.status === 'testing' ? 'text-warning' : 
                    'text-destructive'
                  }`}>
                    {tool.status.toUpperCase()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Execution Panel */}
        {selectedTool && (
          <Card className="sneaker-box-card ambient-glow-gold">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Execute: {selectedTool.name}
              </CardTitle>
              <CardDescription>
                Power Level: <span className={getPowerColor(selectedTool.power)}>{selectedTool.power.toUpperCase()}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-md bg-muted/20 laundry-texture">
                  <p className="text-sm text-muted-foreground">
                    {selectedTool.description}
                  </p>
                </div>

                {/* Device Platform Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Device Platform</label>
                  <div className="flex gap-2">
                    <Button
                      variant={devicePlatform === 'android' ? 'default' : 'outline'}
                      onClick={() => setDevicePlatform('android')}
                      className="flex-1"
                    >
                      Android
                    </Button>
                    <Button
                      variant={devicePlatform === 'ios' ? 'default' : 'outline'}
                      onClick={() => setDevicePlatform('ios')}
                      className="flex-1"
                    >
                      iOS
                    </Button>
                  </div>
                </div>

                {/* Device Serial Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Device Serial / UDID</label>
                  <Input
                    placeholder={devicePlatform === 'android' ? 'e.g., R38M80ABCDE' : 'e.g., 00008101-000A123456...'}
                    value={deviceSerial}
                    onChange={(e) => setDeviceSerial(e.target.value)}
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    {devicePlatform === 'android' 
                      ? 'Run: adb devices' 
                      : 'Found in device settings or Finder'}
                  </p>
                </div>

                {/* Device State Guide */}
                {devicePlatform === 'ios' && selectedTool.requiredStates.ios && (
                  <DeviceStateGuide 
                    requiredState={selectedTool.requiredStates.ios}
                    platform="ios"
                  />
                )}
                {devicePlatform === 'android' && selectedTool.requiredStates.android && (
                  <DeviceStateGuide 
                    requiredState={selectedTool.requiredStates.android}
                    platform="android"
                  />
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleExecute}
                    disabled={!authenticated || selectedTool.status === 'restricted' || executing || !deviceSerial}
                    className="flex-1 btn-sneaker"
                  >
                    <Unlock className="h-4 w-4 mr-2" />
                    {executing ? 'Executing...' : 'Execute Bypass'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTool(null)}
                    disabled={executing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>🔥 Bobby's Traproom v3.0 • Keep it 💯 • Use responsibly 🔥</p>
        </div>
      </div>
    </div>
  );
};
