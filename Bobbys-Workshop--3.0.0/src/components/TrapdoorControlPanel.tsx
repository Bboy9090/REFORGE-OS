// TrapdoorControlPanel.tsx - Control panel for Bobby's Secret Workshop
// Execute sensitive operations with proper authorization

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Lock, Shield, Terminal, FileKey } from 'lucide-react';

interface WorkflowResult {
  success: boolean;
  workflow: string;
  results: any[];
}

export function TrapdoorControlPanel() {
  const [deviceSerial, setDeviceSerial] = useState('');
  const [authorizationInput, setAuthorizationInput] = useState('');
  const [secretPasscode, setSecretPasscode] = useState(() => {
    try {
      return localStorage.getItem('bobbysWorkshop.secretRoomPasscode') || 'BJ0990';
    } catch {
      return 'BJ0990';
    }
  });
  const [showPasscodeEditor, setShowPasscodeEditor] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [error, setError] = useState('');

  const ensurePasscode = () => secretPasscode?.trim() || 'BJ0990';

  const executeWorkflow = async (endpoint: string, confirmation: string) => {
    if (authorizationInput !== confirmation) {
      setError(`You must type exactly: ${confirmation}`);
      return;
    }

    setError('');
    setResult(null);

    try {
      const response = await fetch(`http://localhost:3001/api/trapdoor/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Secret-Room-Passcode': ensurePasscode(),
        },
        body: JSON.stringify({
          deviceSerial,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      setResult(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="border-red-500 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>⚠️ AUTHORIZED USE ONLY</strong>
          <br />
          These operations are intended ONLY for devices you personally own or have explicit written authorization to service.
          Unauthorized access to devices is ILLEGAL under federal law (CFAA).
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication
          </CardTitle>
          <CardDescription>
            Using stored Secret Room passcode automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Passcode is applied automatically to all Trapdoor requests.
              </div>
              <Button size="sm" variant="outline" onClick={() => setShowPasscodeEditor((v) => !v)}>
                {showPasscodeEditor ? 'Hide' : 'Edit'} passcode
              </Button>
            </div>
            {showPasscodeEditor && (
              <div className="space-y-2">
                <Label htmlFor="secretPasscode">Secret Room Passcode</Label>
                <Input
                  id="secretPasscode"
                  type="password"
                  value={secretPasscode}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSecretPasscode(value);
                    try {
                      localStorage.setItem('bobbysWorkshop.secretRoomPasscode', value);
                    } catch {
                      // ignore
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Default: <code className="font-mono">BJ0990</code>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="frp">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="frp">FRP Bypass</TabsTrigger>
          <TabsTrigger value="unlock">Bootloader Unlock</TabsTrigger>
          <TabsTrigger value="custom">Custom Workflow</TabsTrigger>
        </TabsList>

        <TabsContent value="frp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                FRP Bypass Workflow
              </CardTitle>
              <CardDescription>
                Execute Factory Reset Protection bypass workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-orange-500 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Risk Level: DESTRUCTIVE</strong>
                  <br />
                  This operation requires proof of ownership. All actions are logged to shadow logs.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="frpAuth">Type to Confirm</Label>
                <Input
                  id="frpAuth"
                  placeholder="Type: I OWN THIS DEVICE"
                  value={authorizationInput}
                  onChange={(e) => setAuthorizationInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You must type exactly: <code className="font-mono">I OWN THIS DEVICE</code>
                </p>
              </div>

              <Button
                onClick={() => executeWorkflow('frp', 'I OWN THIS DEVICE')}
                disabled={executing || !deviceSerial || !ensurePasscode()}
                className="w-full"
                variant="destructive"
              >
                {executing ? 'Executing...' : 'Execute FRP Bypass'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unlock">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Bootloader Unlock Workflow
              </CardTitle>
              <CardDescription>
                Execute bootloader unlock via Fastboot (ERASES ALL DATA)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-red-500 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Risk Level: DESTRUCTIVE</strong>
                  <br />
                  This operation will ERASE ALL DATA on the device and void warranty. Ensure data is backed up.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="unlockAuth">Type to Confirm</Label>
                <Input
                  id="unlockAuth"
                  placeholder="Type: UNLOCK"
                  value={authorizationInput}
                  onChange={(e) => setAuthorizationInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You must type exactly: <code className="font-mono">UNLOCK</code>
                </p>
              </div>

              <Button
                onClick={() => executeWorkflow('unlock', 'UNLOCK')}
                disabled={executing || !deviceSerial || !ensurePasscode()}
                className="w-full"
                variant="destructive"
              >
                {executing ? 'Executing...' : 'Execute Bootloader Unlock'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileKey className="h-5 w-5" />
                Custom Workflow Execution
              </CardTitle>
              <CardDescription>
                Execute any available workflow by category and ID
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  Custom workflow execution requires direct API calls. Use the Trapdoor API endpoint:
                  <code className="block mt-2 p-2 bg-slate-100 rounded text-sm">
                    POST /api/trapdoor/workflow/execute
                  </code>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <Badge variant="default" className="bg-green-500">Success</Badge>
              ) : (
                <Badge variant="destructive">Failed</Badge>
              )}
              Workflow Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Workflow:</strong> {result.workflow}</p>
              <div>
                <strong>Steps Executed:</strong>
                <ul className="list-disc list-inside ml-4 mt-2">
                  {result.results.map((step, idx) => (
                    <li key={idx} className={step.success ? 'text-green-600' : 'text-red-600'}>
                      {step.stepName}: {step.success ? '✓ Success' : '✗ Failed'}
                      {step.error && <span className="text-xs ml-2">({step.error})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
