import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Warning, ArrowCounterClockwise } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { usePluginRollback } from '@/hooks/use-plugin-rollback';
import type { RegisteredPlugin } from '@/types/plugin-sdk';

interface PluginInstallationDemoProps {
  onNavigate?: (section: string) => void;
}

export function PluginInstallationDemo({ onNavigate }: PluginInstallationDemoProps) {
  const { createSnapshot, autoRollback, policy } = usePluginRollback();
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [installLog, setInstallLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setInstallLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const simulatePluginInstallation = async (shouldFail: boolean = false) => {
    setIsInstalling(true);
    setInstallProgress(0);
    setInstallLog([]);

    const mockPlugin: RegisteredPlugin = {
      plugin: {
        manifest: {
          id: 'demo-plugin',
          name: 'Demo Plugin',
          version: '1.0.0',
          author: 'Bobby',
          description: 'A demonstration plugin',
          category: 'diagnostics',
          capabilities: ['detection', 'diagnostics'],
          riskLevel: 'safe',
          requiredPermissions: ['device.read'],
          supportedPlatforms: ['android', 'ios'],
          minimumSDKVersion: '1.0.0',
          entryPoint: './index.js',
          license: 'MIT',
        },
        execute: async () => ({ success: true }),
      } as any,
      registeredAt: Date.now(),
      enabled: true,
      executionCount: 0,
      errors: [],
      trustScore: 0.8,
    };

    try {
      addLog('📦 Starting plugin installation...');
      setInstallProgress(10);
      await sleep(500);

      if (policy.autoSnapshotOnInstall) {
        addLog('📸 Creating pre-installation snapshot...');
        const snapshot = await createSnapshot(mockPlugin, 'pre-install');
        if (snapshot) {
          addLog(`✅ Snapshot created: ${snapshot.id}`);
        } else {
          addLog('⚠️  Snapshot creation skipped by policy');
        }
      }
      setInstallProgress(30);
      await sleep(500);

      addLog('📥 Downloading plugin package...');
      setInstallProgress(50);
      await sleep(1000);

      addLog('🔍 Validating plugin manifest...');
      setInstallProgress(60);
      await sleep(500);

      addLog('🔐 Checking security signature...');
      setInstallProgress(70);
      await sleep(500);

      if (shouldFail) {
        throw new Error('Simulated installation failure: Checksum mismatch');
      }

      addLog('📦 Installing plugin files...');
      setInstallProgress(80);
      await sleep(1000);

      addLog('⚙️  Registering plugin...');
      setInstallProgress(90);
      await sleep(500);

      addLog('✅ Plugin installed successfully!');
      setInstallProgress(100);
      toast.success('Plugin installed successfully');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Installation failed: ${errorMessage}`);

      if (policy.autoRollbackOnFailure) {
        addLog('🔄 Auto-rollback enabled, attempting restoration...');
        
        const rollbackSuccess = await autoRollback(mockPlugin.plugin.manifest.id, error as Error);
        
        if (rollbackSuccess) {
          addLog('✅ System restored to previous state');
          toast.info('Installation failed. System restored automatically.');
        } else {
          addLog('❌ Auto-rollback failed. Manual intervention required.');
          toast.error('Installation and auto-rollback both failed');
        }
      } else {
        addLog('⚠️  Auto-rollback disabled. Manual rollback may be required.');
        toast.error('Installation failed. Check rollback panel.');
      }
    } finally {
      setIsInstalling(false);
    }
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display tracking-tight text-foreground mb-2">
          Plugin Installation Demo
        </h2>
        <p className="text-muted-foreground">
          Demonstrates automatic snapshot creation and rollback on failure
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Rollback Policy Status</CardTitle>
            <CardDescription>Current configuration for snapshot and rollback behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Auto-snapshot on Install</span>
              {policy.autoSnapshotOnInstall ? (
                <Badge className="bg-success/10 text-success border-success/20">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Enabled
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  <XCircle className="w-3 h-3 mr-1" />
                  Disabled
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Auto-rollback on Failure</span>
              {policy.autoRollbackOnFailure ? (
                <Badge className="bg-success/10 text-success border-success/20">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Enabled
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  <XCircle className="w-3 h-3 mr-1" />
                  Disabled
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Require Confirmation</span>
              {policy.requireConfirmation ? (
                <Badge className="bg-accent/10 text-accent border-accent/20">
                  <Warning className="w-3 h-3 mr-1" />
                  Required
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Optional
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Max Snapshots</span>
              <Badge variant="outline">{policy.maxSnapshots}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Retention Days</span>
              <Badge variant="outline">{policy.retentionDays}</Badge>
            </div>

            <Button
              onClick={() => onNavigate?.('plugin-rollback')}
              variant="outline"
              className="w-full mt-4"
            >
              <ArrowCounterClockwise className="w-4 h-4 mr-2" />
              Configure Rollback Policy
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Test Installation</CardTitle>
            <CardDescription>Simulate plugin installation with or without errors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button
                onClick={() => simulatePluginInstallation(false)}
                disabled={isInstalling}
                className="w-full bg-success hover:bg-success/90"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Simulate Successful Installation
              </Button>

              <Button
                onClick={() => simulatePluginInstallation(true)}
                disabled={isInstalling}
                className="w-full bg-destructive hover:bg-destructive/90"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Simulate Failed Installation
              </Button>
            </div>

            {isInstalling && (
              <div className="space-y-2">
                <Progress value={installProgress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">{installProgress}%</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="font-mono text-sm">Installation Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-background/50 rounded-lg p-4 font-mono text-xs max-h-96 overflow-y-auto">
            {installLog.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No installation activity yet. Click a button above to start.
              </p>
            ) : (
              <div className="space-y-1">
                {installLog.map((log, i) => (
                  <div key={i} className="text-foreground/90">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Warning className="w-5 h-5 text-primary" />
            How Rollback Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Pre-Installation Snapshot:</strong> Before installing a plugin,
            the system creates a snapshot of the current state including plugin configuration and data.
          </p>
          <p>
            <strong className="text-foreground">Automatic Rollback:</strong> If installation fails and
            auto-rollback is enabled, the system automatically restores the previous state.
          </p>
          <p>
            <strong className="text-foreground">Manual Rollback:</strong> You can manually rollback to any
            previous snapshot from the Rollback System panel.
          </p>
          <p>
            <strong className="text-foreground">Snapshot Retention:</strong> Snapshots are automatically
            pruned based on retention policy to conserve storage.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
