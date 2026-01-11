import { useState, useEffect, useMemo } from 'react';
import { usePluginDependencies } from '@/hooks/use-plugin-dependencies';
import type { RegistryPlugin } from '@/types/plugin-registry';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Download, 
  CheckCircle, 
  XCircle, 
  Warning, 
  Clock,
  Package,
  ArrowRight,
  GitBranch,
  Shield,
  Lightning
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface PluginInstallerProps {
  plugin: RegistryPlugin;
  onInstallComplete?: (success: boolean) => void;
  onCancel?: () => void;
}

export function PluginInstaller({ plugin, onInstallComplete, onCancel }: PluginInstallerProps) {
  const {
    dependencyStatus,
    installStatus,
    resolveDependencies,
    installWithDependencies,
    reset
  } = usePluginDependencies();

  const [step, setStep] = useState<'resolve' | 'confirm' | 'install' | 'complete'>('resolve');

  useEffect(() => {
    resolveDependencies(plugin.id, plugin.version).catch((error) => {
      toast.error('Dependency Resolution Failed', {
        description: error.message,
      });
    });
  }, [plugin.id, plugin.version, resolveDependencies]);

  // Use computed step to avoid setState in effects
  const computedStep = useMemo(() => {
    if (installStatus.success && step === 'install') {
      // Trigger completion callback
      setTimeout(() => {
        toast.success('Installation Complete', {
          description: `Successfully installed ${installStatus.installed.length} plugin(s)`,
        });
        onInstallComplete?.(true);
      }, 0);
      return 'complete';
    }
    if (dependencyStatus.resolution && step === 'resolve' && !dependencyStatus.isResolving &&
        dependencyStatus.resolution.conflicts.length === 0 &&
        dependencyStatus.resolution.circularDependencies.length === 0) {
      return 'confirm';
    }
    return step;
  }, [dependencyStatus, installStatus.success, step, onInstallComplete]);

  const handleInstall = async () => {
    setStep('install');
    try {
      await installWithDependencies(plugin.id, plugin.version);
    } catch (error) {
      toast.error('Installation Failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      onInstallComplete?.(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const renderResolveStep = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {dependencyStatus.isResolving ? (
          <>
            <Clock className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">Resolving dependencies...</span>
          </>
        ) : dependencyStatus.error ? (
          <>
            <XCircle className="w-5 h-5 text-destructive" />
            <span className="text-sm text-destructive">{dependencyStatus.error}</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-sm text-success">Dependencies resolved</span>
          </>
        )}
      </div>

      {dependencyStatus.error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Resolution Failed</AlertTitle>
          <AlertDescription>{dependencyStatus.error}</AlertDescription>
        </Alert>
      )}

      {dependencyStatus.resolution && (
        <>
          {dependencyStatus.resolution.conflicts.length > 0 && (
            <Alert variant="destructive">
              <Warning className="h-4 w-4" />
              <AlertTitle>Dependency Conflicts Detected</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-1">
                  {dependencyStatus.resolution.conflicts.map((conflict, idx) => (
                    <li key={idx} className="text-sm">
                      <span className="font-mono">{conflict.pluginId}</span> required by{' '}
                      <span className="font-mono">{conflict.requiredBy.join(', ')}</span>
                      {' '}(versions: {conflict.versions.join(', ')})
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {dependencyStatus.resolution.circularDependencies.length > 0 && (
            <Alert variant="destructive">
              <Warning className="h-4 w-4" />
              <AlertTitle>Circular Dependencies Detected</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-1">
                  {dependencyStatus.resolution.circularDependencies.map((cycle, idx) => (
                    <li key={idx} className="text-sm font-mono">
                      {cycle.join(' → ')}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );

  const renderConfirmStep = () => {
    const resolution = dependencyStatus.resolution;
    if (!resolution) return null;

    return (
      <div className="space-y-4">
        <Alert>
          <Package className="h-4 w-4" />
          <AlertTitle>Installation Plan</AlertTitle>
          <AlertDescription>
            The following plugins will be installed in order:
          </AlertDescription>
        </Alert>

        <ScrollArea className="h-64 rounded-md border border-border p-4">
          <div className="space-y-2">
            {resolution.installOrder.map((dep, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-mono text-sm">{dep.pluginId}</div>
                  <div className="text-xs text-muted-foreground">v{dep.version}</div>
                </div>
                {idx === resolution.installOrder.length - 1 && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    Target
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
          <div className="space-y-1">
            <div className="text-sm font-medium">Total Download Size</div>
            <div className="text-xs text-muted-foreground">
              {resolution.installOrder.length} plugin(s) to install
            </div>
          </div>
          <div className="text-lg font-bold text-primary">
            {formatBytes(resolution.totalSize)}
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleInstall} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Install All Dependencies
          </Button>
          <Button onClick={handleCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  const renderInstallStep = () => {
    const progress = installStatus.progress;

    return (
      <div className="space-y-4">
        <Alert>
          <Lightning className="h-4 w-4 animate-pulse" />
          <AlertTitle>Installing Plugins</AlertTitle>
          <AlertDescription>
            {progress?.message || 'Preparing installation...'}
          </AlertDescription>
        </Alert>

        {progress && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {progress.current} of {progress.total}
                </span>
                <span className="font-mono text-primary">{progress.currentPlugin}</span>
              </div>
              <Progress value={(progress.current / progress.total) * 100} />
            </div>

            <div className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  {progress.status === 'downloading' && (
                    <Download className="w-5 h-5 text-primary animate-bounce" />
                  )}
                  {progress.status === 'installing' && (
                    <Package className="w-5 h-5 text-primary animate-pulse" />
                  )}
                  {progress.status === 'verifying' && (
                    <Shield className="w-5 h-5 text-primary animate-pulse" />
                  )}
                  {progress.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-success" />
                  )}
                  {progress.status === 'failed' && (
                    <XCircle className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium capitalize">{progress.status}</div>
                  <div className="text-xs text-muted-foreground">{progress.message}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {installStatus.errors.length > 0 && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Installation Errors</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1">
                {installStatus.errors.map((error, idx) => (
                  <li key={idx} className="text-sm">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  const renderCompleteStep = () => (
    <div className="space-y-4">
      <Alert className="bg-success/10 border-success/30">
        <CheckCircle className="h-4 w-4 text-success" />
        <AlertTitle>Installation Complete</AlertTitle>
        <AlertDescription>
          All plugins have been successfully installed and verified.
        </AlertDescription>
      </Alert>

      <div className="p-4 rounded-lg bg-muted/30">
        <div className="space-y-2">
          <div className="text-sm font-medium">Installed Plugins</div>
          <ScrollArea className="h-32">
            <ul className="space-y-1">
              {installStatus.installed.map((pluginId, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm font-mono">
                  <CheckCircle className="w-3 h-3 text-success" />
                  {pluginId}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      </div>

      <Button onClick={() => onInstallComplete?.(true)} className="w-full">
        Done
      </Button>
    </div>
  );

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Package className="w-6 h-6 text-primary" />
          Install Plugin
        </CardTitle>
        <CardDescription>
          Installing <span className="font-mono">{plugin.name}</span> v{plugin.version}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step === 'resolve' ? 'bg-primary text-primary-foreground' : 
              dependencyStatus.error ? 'bg-destructive text-destructive-foreground' :
              'bg-success/20 text-success'
            }`}>
              {dependencyStatus.isResolving ? (
                <Clock className="w-4 h-4 animate-pulse" />
              ) : dependencyStatus.error ? (
                <XCircle className="w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step === 'confirm' ? 'bg-primary text-primary-foreground' :
              step === 'resolve' ? 'bg-muted text-muted-foreground' :
              'bg-success/20 text-success'
            }`}>
              <GitBranch className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step === 'install' ? 'bg-primary text-primary-foreground' :
              ['resolve', 'confirm'].includes(step) ? 'bg-muted text-muted-foreground' :
              'bg-success/20 text-success'
            }`}>
              <Download className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step === 'complete' ? 'bg-success text-success-foreground' :
              'bg-muted text-muted-foreground'
            }`}>
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>

          <Separator />

          {computedStep === 'resolve' && renderResolveStep()}
          {computedStep === 'confirm' && renderConfirmStep()}
          {computedStep === 'install' && renderInstallStep()}
          {computedStep === 'complete' && renderCompleteStep()}
        </div>
      </CardContent>
    </Card>
  );
}
