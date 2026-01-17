import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Book,
  Code,
  ShieldCheck,
  Terminal,
  FileCode,
  CaretRight
} from '@phosphor-icons/react';

export function AuthorizationTriggersGuide() {
  const endpoints = [
    {
      category: 'Android/ADB',
      icon: <Terminal className="w-4 h-4" />,
      endpoints: [
        { method: 'POST', path: '/api/adb/trigger-auth', desc: 'Trigger USB debugging authorization dialog' },
        { method: 'POST', path: '/api/adb/trigger-file-auth', desc: 'Trigger file transfer permission dialog' },
        { method: 'POST', path: '/api/adb/trigger-backup-auth', desc: 'Trigger backup authorization dialog' },
      ],
    },
    {
      category: 'iOS',
      icon: <ShieldCheck className="w-4 h-4" />,
      endpoints: [
        { method: 'POST', path: '/api/ios/trigger-trust', desc: 'Trigger "Trust This Computer?" dialog' },
        { method: 'POST', path: '/api/ios/trigger-pairing', desc: 'Send pairing request' },
        { method: 'POST', path: '/api/ios/trigger-backup-auth', desc: 'Trigger backup encryption dialog' },
        { method: 'POST', path: '/api/ios/trigger-dfu', desc: 'Enter DFU/Recovery mode' },
      ],
    },
    {
      category: 'Fastboot',
      icon: <Code className="w-4 h-4" />,
      endpoints: [
        { method: 'POST', path: '/api/fastboot/verify-unlock', desc: 'Verify bootloader unlock status' },
      ],
    },
    {
      category: 'Samsung',
      icon: <FileCode className="w-4 h-4" />,
      endpoints: [
        { method: 'POST', path: '/api/samsung/trigger-download-mode', desc: 'Verify Download Mode connectivity' },
      ],
    },
    {
      category: 'Qualcomm',
      icon: <Code className="w-4 h-4" />,
      endpoints: [
        { method: 'POST', path: '/api/qualcomm/trigger-edl-auth', desc: 'Verify EDL mode authorization' },
      ],
    },
    {
      category: 'MediaTek',
      icon: <Code className="w-4 h-4" />,
      endpoints: [
        { method: 'POST', path: '/api/mediatek/trigger-flash-auth', desc: 'Check SP Flash Tool authorization' },
      ],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Book className="w-5 h-5" />
              Authorization Triggers API Reference
            </CardTitle>
            <CardDescription>
              Backend endpoints for triggering device authorization dialogs
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('AUTHORIZATION_TRIGGERS_API.md', '_blank')}
          >
            <FileCode className="w-4 h-4 mr-2" />
            Full Documentation
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 mb-6">
          <p className="text-sm text-foreground">
            <strong className="text-destructive">Critical:</strong> All responses must be based on{' '}
            <strong>real command executions</strong>. No simulated data, no ghost values, no fake statuses.
          </p>
        </div>

        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {endpoints.map((group) => (
              <div key={group.category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                    {group.icon}
                  </div>
                  <h3 className="font-semibold text-sm">{group.category}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {group.endpoints.length} endpoint{group.endpoints.length > 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="pl-10 space-y-2">
                  {group.endpoints.map((endpoint, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <CaretRight className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="font-mono text-xs">
                            {endpoint.method}
                          </Badge>
                          <code className="text-xs font-mono text-primary">{endpoint.path}</code>
                        </div>
                        <p className="text-xs text-muted-foreground">{endpoint.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            <h3 className="font-semibold text-sm">Implementation Requirements</h3>
            
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <h4 className="text-xs font-semibold mb-1">1. Real Command Execution</h4>
                <p className="text-xs text-muted-foreground">
                  Must use actual CLI tools: adb, fastboot, ideviceinfo, idevicepair, heimdall, edl, mtkclient
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <h4 className="text-xs font-semibold mb-1">2. Capture Real Output</h4>
                <p className="text-xs text-muted-foreground">
                  Must capture real stdout/stderr and return actual exit codes
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <h4 className="text-xs font-semibold mb-1">3. Error Handling</h4>
                <p className="text-xs text-muted-foreground">
                  Return proper error responses for tool not found, timeout, and authorization failures
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <h4 className="text-xs font-semibold mb-1">4. Logging</h4>
                <p className="text-xs text-muted-foreground">
                  Log timestamp, command executed, exit code, stdout/stderr, and success/failure status
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <h4 className="text-xs font-semibold mb-1">5. Security</h4>
                <p className="text-xs text-muted-foreground">
                  Validate inputs, prevent command injection, sanitize paths, rate limit requests
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-xs text-foreground">
            <strong className="text-primary">Note:</strong> For complete API documentation, request/response examples, 
            and detailed implementation guides, see <code className="text-primary">AUTHORIZATION_TRIGGERS_API.md</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
