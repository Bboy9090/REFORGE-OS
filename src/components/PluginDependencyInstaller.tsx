import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Warning, 
  ArrowsClockwise, 
  Download,
  Package,
  Tree,
  ArrowRight,
  GitBranch,
  Shield,
  Lightning,
  Clock
} from '@phosphor-icons/react';
import { usePluginDependencies } from '@/hooks/use-plugin-dependencies';
import { toast } from 'sonner';

interface PluginDependencyInstallerProps {
  pluginId: string;
  pluginName: string;
  version?: string;
  onInstallComplete?: (success: boolean) => void;
  onCancel?: () => void;
}

export function PluginDependencyInstaller({
  pluginId,
  pluginName,
  version,
  onInstallComplete,
  onCancel,
}: PluginDependencyInstallerProps) {
  const {
    dependencyStatus,
    installStatus,
    resolveDependencies,
    installWithDependencies,
    reset,
  } = usePluginDependencies();

  const [step, setStep] = useState<'resolve' | 'confirm' | 'install' | 'complete'>('resolve');

  useEffect(() => {
    resolveDependencies(pluginId, version).catch((error) => {
      toast.error('Dependency Resolution Failed', {
        description: error.message,
      });
    });
  }, [pluginId, version, resolveDependencies]);

  // Auto-advance to confirm step when dependencies are resolved
  useEffect(() => {
    if (dependencyStatus.resolution && step === 'resolve' && !dependencyStatus.isResolving) {
      if (dependencyStatus.resolution.conflicts.length === 0 && 
          dependencyStatus.resolution.circularDependencies.length === 0) {
        // Use setTimeout to avoid setState during render
        const timer = setTimeout(() => setStep('confirm'), 0);
        return () => clearTimeout(timer);
      }
    }
  }, [dependencyStatus, step]);

  // Auto-advance to complete step when installation succeeds
  useEffect(() => {
    if (installStatus.success && step === 'install') {
      // Use setTimeout to avoid setState during render
      const timer = setTimeout(() => {
        setStep('complete');
        toast.success('Installation Complete', {
          description: `Successfully installed ${installStatus.installed.length} plugin(s)`,
        });
        onInstallComplete?.(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [installStatus, step, onInstallComplete]);

  const handleInstall = async () => {
    setStep('install');
    try {
      await installWithDependencies(pluginId, version);
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

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (step === 'resolve') {
    return (
      <Card className="p-6 border-primary/20">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Tree className="text-primary" size={24} />
            <div>
              <h3 className="text-lg font-semibold">Resolving Dependencies</h3>
              <p className="text-sm text-muted-foreground">
                Analyzing dependency tree for {pluginName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              dependencyStatus.isResolving ? 'bg-primary text-primary-foreground animate-pulse' : 
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
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground">
              <GitBranch className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground">
              <Download className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>

          {dependencyStatus.isResolving && (
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <ArrowsClockwise className="animate-spin text-primary" size={20} />
              <span className="text-sm">Resolving dependencies...</span>
            </div>
          )}

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
                    <ul className="mt-2 space-y-1 text-sm">
                      {dependencyStatus.resolution.conflicts.map((conflict, idx) => (
                        <li key={idx}>
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
                    <ul className="mt-2 space-y-1 text-sm font-mono">
                      {dependencyStatus.resolution.circularDependencies.map((cycle, idx) => (
                        <li key={idx}>{cycle.join(' → ')}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (step === 'confirm' && dependencyStatus.resolution) {
    const { resolution } = dependencyStatus;
    const hasConflicts = resolution.conflicts.length > 0;
    const hasCircular = resolution.circularDependencies.length > 0;

    return (
      <Card className="p-6 border-primary/20">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Package className="text-primary" size={24} />
            <div>
              <h3 className="text-lg font-semibold">Confirm Installation</h3>
              <p className="text-sm text-muted-foreground">
                Review dependencies before installation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/20 text-success">
              <CheckCircle className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
              <GitBranch className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground">
              <Download className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>

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
              {formatSize(resolution.totalSize)}
            </div>
          </div>

          {hasConflicts && (
            <Alert variant="destructive">
              <Warning className="h-4 w-4" />
              <AlertTitle>Dependency Conflicts Detected</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-1">
                  {resolution.conflicts.map((conflict, idx) => (
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

          {hasCircular && (
            <Alert variant="destructive">
              <Warning className="h-4 w-4" />
              <AlertTitle>Circular Dependencies Detected</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-1">
                  {resolution.circularDependencies.map((cycle, idx) => (
                    <li key={idx} className="text-sm font-mono">
                      {cycle.join(' → ')}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={handleInstall} 
              disabled={hasConflicts || hasCircular}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Install All Dependencies
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (step === 'install') {
    const progress = installStatus.progress;

    return (
      <Card className="p-6 border-primary/20">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Lightning className="text-primary animate-pulse" size={24} />
            <div>
              <h3 className="text-lg font-semibold">Installing Plugins</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while plugins are downloaded and installed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/20 text-success">
              <CheckCircle className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/20 text-success">
              <GitBranch className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground animate-pulse">
              <Download className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>

          {progress && (
            <>
              <Alert>
                <Lightning className="h-4 w-4 animate-pulse" />
                <AlertTitle>Installing Plugins</AlertTitle>
                <AlertDescription>
                  {progress.message || 'Preparing installation...'}
                </AlertDescription>
              </Alert>

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

              {progress.error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Installation Error</AlertTitle>
                  <AlertDescription>{progress.error}</AlertDescription>
                </Alert>
              )}
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
      </Card>
    );
  }

  if (step === 'complete') {
    const { success, installed, errors } = installStatus;

    return (
      <Card className="p-6 border-primary/20">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {success ? (
              <CheckCircle className="text-success" size={24} />
            ) : (
              <Warning className="text-warning" size={24} />
            )}
            <div>
              <h3 className="text-lg font-semibold">
                {success ? 'Installation Complete' : 'Installation Completed with Errors'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {installed.length} plugin{installed.length !== 1 ? 's' : ''} installed successfully
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/20 text-success">
              <CheckCircle className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/20 text-success">
              <GitBranch className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/20 text-success">
              <Download className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              success ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'
            }`}>
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>

          {success && (
            <Alert className="bg-success/10 border-success/30">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertTitle>Installation Complete</AlertTitle>
              <AlertDescription>
                All plugins have been successfully installed and verified.
              </AlertDescription>
            </Alert>
          )}

          {installed.length > 0 && (
            <div className="p-4 rounded-lg bg-muted/30">
              <div className="space-y-2">
                <div className="text-sm font-medium">Installed Plugins</div>
                <ScrollArea className="h-32">
                  <ul className="space-y-1">
                    {installed.map((pluginId, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm font-mono">
                        <CheckCircle className="w-3 h-3 text-success" />
                        {pluginId}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Installation Errors</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-1">
                  {errors.map((error, idx) => (
                    <li key={idx} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={() => onInstallComplete?.(success)} className="w-full">
            Done
          </Button>
        </div>
      </Card>
    );
  }

  return null;
}
