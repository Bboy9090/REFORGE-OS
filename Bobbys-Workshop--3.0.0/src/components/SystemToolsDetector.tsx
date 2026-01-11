import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSystemTools } from '@/hooks/use-device-detection';
import { CheckCircle, XCircle, ArrowClockwise, Wrench } from '@phosphor-icons/react';

export function SystemToolsDetector() {
  const { tools, loading, error, refresh } = useSystemTools();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench size={20} className="text-primary" />
            <CardTitle>System Tools</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
          >
            <ArrowClockwise size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
        <CardDescription>
          Backend API detection for installed development tools
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        
        {loading && tools.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <ArrowClockwise size={24} className="animate-spin mr-2" />
            Detecting tools...
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No system tools detected. Ensure backend API is running.
          </div>
        ) : (
          <div className="grid gap-3">
            {tools.map((tool) => (
              <div
                key={tool.name}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  {tool.installed ? (
                    <CheckCircle size={20} className="text-green-500" weight="fill" />
                  ) : (
                    <XCircle size={20} className="text-red-500" weight="fill" />
                  )}
                  <div>
                    <div className="font-medium capitalize">{tool.name}</div>
                    {tool.version && (
                      <div className="text-sm text-muted-foreground">{tool.version}</div>
                    )}
                    {tool.path && (
                      <div className="text-xs text-muted-foreground font-mono">{tool.path}</div>
                    )}
                  </div>
                </div>
                <Badge variant={tool.installed ? 'default' : 'destructive'}>
                  {tool.installed ? 'Installed' : 'Missing'}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {tools.find(t => t.name === 'adb' && t.devices_raw) && (
          <div className="mt-4 rounded-lg border p-3">
            <div className="font-medium mb-2">ADB Devices</div>
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
              {tools.find(t => t.name === 'adb')?.devices_raw}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
