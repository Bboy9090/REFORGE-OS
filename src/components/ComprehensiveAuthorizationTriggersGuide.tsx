import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ShieldCheck, 
  Lightning, 
  TestTube, 
  Archive, 
  ShieldWarning, 
  Plug, 
  Package,
  BookOpen,
  Code,
  ListChecks
} from '@phosphor-icons/react';

export function ComprehensiveAuthorizationTriggersGuide() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Comprehensive Authorization Triggers Guide</CardTitle>
              <CardDescription>
                Complete reference for device authorization, user prompts, and backend API integration
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="border-primary/50 bg-primary/5">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <AlertDescription>
              All triggers are backed by <strong>real backend endpoints</strong> with{' '}
              <strong>audit logging</strong>. No simulated values, no ghost connections.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <ScrollArea className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trust">Trust & Security</TabsTrigger>
            <TabsTrigger value="flash">Flash Operations</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
            <TabsTrigger value="evidence">Evidence & Reports</TabsTrigger>
            <TabsTrigger value="policy">Policy & Compliance</TabsTrigger>
            <TabsTrigger value="hotplug">Hotplug Events</TabsTrigger>
            <TabsTrigger value="plugins">Plugin Actions</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
          </TabsList>
        </ScrollArea>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What Are Authorization Triggers?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Authorization triggers are interactive prompts that request explicit user confirmation
                before executing sensitive operations. Each trigger is mapped to a real backend API
                endpoint and produces structured audit logs for compliance and traceability.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ListChecks className="h-4 w-4 text-primary" />
                    Key Principles
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Truth-only data - no placeholders</li>
                    <li>Explicit confirmation required</li>
                    <li>Real backend execution</li>
                    <li>Structured audit logging</li>
                    <li>Risk-based validation</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ShieldWarning className="h-4 w-4 text-warning" />
                    Risk Levels
                  </div>
                  <div className="space-y-1">
                    <Badge className="bg-success/20 text-success border-success/50">Low - Safe operations</Badge>
                    <Badge className="bg-warning/20 text-warning border-warning/50 ml-2">Medium - Caution required</Badge>
                    <Badge className="bg-accent/20 text-accent border-accent/50 ml-2">High - Elevated risk</Badge>
                    <Badge className="bg-destructive/20 text-destructive border-destructive/50 ml-2">Destructive - Cannot undo</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trust" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <CardTitle>Trust & Security Triggers</CardTitle>
              </div>
              <CardDescription>Device authorization and permission management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TriggerSection
                title="Trust Device"
                endpoint="POST /api/devices/trust"
                prompt="Do you want to trust this device?"
                modal="Authorize this device for diagnostics and flashing?"
                riskLevel="medium"
                auditFields={['deviceId', 'userResponse', 'timestamp']}
              />
              
              <TriggerSection
                title="Grant USB Debugging"
                endpoint="POST /api/devices/authorize-debugging"
                prompt="Allow USB debugging?"
                modal="Enable USB debugging for this device?"
                riskLevel="medium"
                auditFields={['deviceId', 'adbAuth', 'timestamp']}
              />

              <TriggerSection
                title="Authorize File Transfer"
                endpoint="POST /api/devices/authorize-transfer"
                prompt="Allow file transfer access?"
                modal="Grant file transfer permissions for this device?"
                riskLevel="low"
                auditFields={['deviceId', 'transferMode', 'timestamp']}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flash" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightning className="h-5 w-5 text-warning" />
                <CardTitle>Flash Operations Triggers</CardTitle>
              </div>
              <CardDescription>Firmware flashing and bootloader operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TriggerSection
                title="Flash Firmware"
                endpoint="POST /api/flash/start"
                prompt="Do you want to flash this firmware?"
                modal="Confirm flashing firmware to device. This will overwrite partitions."
                typedConfirm="CONFIRM"
                riskLevel="destructive"
                auditFields={['deviceId', 'partitions', 'firmwareHash', 'userResponse', 'timestamp']}
              />

              <TriggerSection
                title="Unlock Bootloader"
                endpoint="POST /api/flash/unlock-bootloader"
                prompt="Unlock bootloader?"
                modal="This will erase all data and void warranty. Type UNLOCK to confirm."
                typedConfirm="UNLOCK"
                riskLevel="destructive"
                auditFields={['deviceId', 'unlockToken', 'userResponse', 'timestamp']}
              />

              <TriggerSection
                title="Factory Reset"
                endpoint="POST /api/devices/factory-reset"
                prompt="Factory reset device?"
                modal="This will erase all data. Type RESET to confirm."
                typedConfirm="RESET"
                riskLevel="destructive"
                auditFields={['deviceId', 'resetType', 'userResponse', 'timestamp']}
              />

              <TriggerSection
                title="Reboot to Bootloader"
                endpoint="POST /api/devices/reboot-bootloader"
                prompt="Reboot to bootloader?"
                modal="Reboot device into bootloader/fastboot mode?"
                riskLevel="low"
                auditFields={['deviceId', 'rebootMode', 'timestamp']}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-success" />
                <CardTitle>Diagnostics Triggers</CardTitle>
              </div>
              <CardDescription>Device health checks and performance testing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TriggerSection
                title="Run Diagnostics"
                endpoint="POST /api/diagnostics/run"
                prompt="Run full diagnostics on connected devices?"
                modal="Run health checks (CPU, memory, storage, battery) on device?"
                riskLevel="low"
                auditFields={['deviceId', 'diagnosticSuite', 'results', 'timestamp']}
              />

              <TriggerSection
                title="Collect Logs"
                endpoint="POST /api/diagnostics/logs"
                prompt="Collect device logs?"
                modal="Capture ADB logcat, fastboot logs, and system logs from device?"
                riskLevel="low"
                auditFields={['deviceId', 'logTypes', 'logSize', 'timestamp']}
              />

              <TriggerSection
                title="Benchmark Device"
                endpoint="POST /api/diagnostics/benchmark"
                prompt="Run performance benchmark?"
                modal="Run flash speed and performance profiling on device?"
                riskLevel="low"
                auditFields={['deviceId', 'benchmarkType', 'results', 'timestamp']}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-accent" />
                <CardTitle>Evidence & Reports Triggers</CardTitle>
              </div>
              <CardDescription>Signed evidence bundles and audit reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TriggerSection
                title="Export Evidence Bundle"
                endpoint="POST /api/evidence/export"
                prompt="Export signed evidence bundle?"
                modal="Generate cryptographically signed diagnostic report for device?"
                riskLevel="low"
                auditFields={['deviceId', 'bundleId', 'signature', 'timestamp']}
              />

              <TriggerSection
                title="Sign Evidence"
                endpoint="POST /api/evidence/sign"
                prompt="Sign evidence bundle?"
                modal="Apply cryptographic signature to evidence bundle?"
                riskLevel="medium"
                auditFields={['bundleId', 'signerId', 'signatureHash', 'timestamp']}
              />

              <TriggerSection
                title="Create Snapshot"
                endpoint="POST /api/snapshots/create"
                prompt="Create diagnostic snapshot?"
                modal="Capture current device state for backup?"
                riskLevel="low"
                auditFields={['deviceId', 'snapshotId', 'dataSize', 'timestamp']}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policy" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldWarning className="h-5 w-5 text-destructive" />
                <CardTitle>Policy & Compliance Triggers</CardTitle>
              </div>
              <CardDescription>Compliance gates and supervisor approvals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TriggerSection
                title="Policy Gate Confirmation"
                endpoint="POST /api/policy/confirm"
                prompt="This is a destructive action. Do you want to continue?"
                modal="This action cannot be undone. Type YES to proceed."
                typedConfirm="YES"
                riskLevel="destructive"
                auditFields={['action', 'riskLevel', 'userResponse', 'timestamp']}
              />

              <TriggerSection
                title="Supervisor Approval"
                endpoint="POST /api/policy/supervisor-approval"
                prompt="High-risk action requires supervisor approval"
                modal="Submit request for supervisor approval of this action?"
                riskLevel="high"
                auditFields={['requestId', 'supervisorId', 'approvalStatus', 'timestamp']}
              />

              <TriggerSection
                title="Audit Consent"
                endpoint="POST /api/policy/audit-consent"
                prompt="Consent to audit logging?"
                modal="Agree to record this operation in audit log?"
                riskLevel="low"
                auditFields={['userId', 'consentGiven', 'timestamp']}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hotplug" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Plug className="h-5 w-5 text-primary" />
                <CardTitle>Hotplug Events Triggers</CardTitle>
              </div>
              <CardDescription>USB device connection and driver management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TriggerSection
                title="Authorize Hotplug Device"
                endpoint="POST /api/hotplug/authorize"
                prompt="New device detected. Do you want to connect?"
                modal="Device connected via USB. Authorize for monitoring?"
                riskLevel="medium"
                auditFields={['deviceId', 'vendorId', 'productId', 'userResponse', 'timestamp']}
              />

              <TriggerSection
                title="Install Device Driver"
                endpoint="POST /api/devices/install-driver"
                prompt="Install missing driver?"
                modal="Device requires driver installation. Download and install?"
                riskLevel="medium"
                auditFields={['deviceId', 'driverName', 'driverVersion', 'timestamp']}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plugins" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-accent" />
                <CardTitle>Plugin Actions Triggers</CardTitle>
              </div>
              <CardDescription>Plugin installation, updates, and removal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TriggerSection
                title="Install Plugin"
                endpoint="POST /api/plugins/install"
                prompt="Install plugin?"
                modal="Install certified plugin?"
                riskLevel="medium"
                auditFields={['pluginId', 'pluginVersion', 'userResponse', 'timestamp']}
              />

              <TriggerSection
                title="Update Plugin"
                endpoint="PUT /api/plugins/update"
                prompt="Update plugin?"
                modal="Update plugin to latest version?"
                riskLevel="low"
                auditFields={['pluginId', 'oldVersion', 'newVersion', 'timestamp']}
              />

              <TriggerSection
                title="Uninstall Plugin"
                endpoint="DELETE /api/plugins/uninstall"
                prompt="Uninstall plugin?"
                modal="Remove plugin and all associated data?"
                riskLevel="medium"
                auditFields={['pluginId', 'userResponse', 'timestamp']}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="implementation" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                <CardTitle>Backend Implementation Guide</CardTitle>
              </div>
              <CardDescription>How to implement authorization triggers in your backend</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <BookOpen className="h-4 w-4" />
                <AlertDescription>
                  All trigger endpoints must return real data from device probes (ADB, Fastboot, libusb).
                  No simulated responses.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="text-sm font-medium">Endpoint Structure</div>
                <div className="bg-card border border-border rounded-md p-4 font-mono text-xs space-y-2">
                  <div className="text-muted-foreground">// Request</div>
                  <div className="text-primary">POST /api/devices/trust</div>
                  <div className="text-foreground">
                    {`{
  "triggerId": "trust_device",
  "deviceId": "XYZ123",
  "timestamp": "2024-01-15T10:30:00Z"
}`}
                  </div>
                  
                  <div className="text-muted-foreground mt-4">// Response</div>
                  <div className="text-foreground">
                    {`{
  "success": true,
  "deviceId": "XYZ123",
  "trustedAt": "2024-01-15T10:30:05Z",
  "auditLogId": "audit_abc123"
}`}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium">Audit Log Structure</div>
                <div className="bg-card border border-border rounded-md p-4 font-mono text-xs">
                  <div className="text-foreground">
                    {`{
  "id": "audit_abc123",
  "action": "trust_device",
  "triggerId": "trust_device",
  "deviceId": "XYZ123",
  "userResponse": "approved",
  "timestamp": "2024-01-15T10:30:05Z",
  "userId": "user_456",
  "metadata": {
    "deviceName": "Samsung Galaxy S21",
    "ipAddress": "192.168.1.100"
  }
}`}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface TriggerSectionProps {
  title: string;
  endpoint: string;
  prompt: string;
  modal: string;
  typedConfirm?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'destructive';
  auditFields: string[];
}

function TriggerSection({
  title,
  endpoint,
  prompt,
  modal,
  typedConfirm,
  riskLevel,
  auditFields,
}: TriggerSectionProps) {
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-success/20 text-success border-success/50';
      case 'medium':
        return 'bg-warning/20 text-warning border-warning/50';
      case 'high':
        return 'bg-accent/20 text-accent border-accent/50';
      case 'destructive':
        return 'bg-destructive/20 text-destructive border-destructive/50';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="border border-border rounded-md p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-foreground">{title}</h4>
        <Badge className={getRiskLevelColor(riskLevel)}>
          <span className="text-[10px] uppercase tracking-wider font-bold">{riskLevel}</span>
        </Badge>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-muted-foreground font-medium">Frontend Prompt: </span>
          <span className="text-foreground">"{prompt}"</span>
        </div>
        
        <div>
          <span className="text-muted-foreground font-medium">Backend Endpoint: </span>
          <code className="text-primary font-mono text-xs">{endpoint}</code>
        </div>

        <div>
          <span className="text-muted-foreground font-medium">Modal Text: </span>
          <span className="text-foreground">"{modal}"</span>
        </div>

        {typedConfirm && (
          <div>
            <span className="text-muted-foreground font-medium">Typed Confirmation: </span>
            <code className="text-primary font-mono">{typedConfirm}</code>
          </div>
        )}

        <div>
          <span className="text-muted-foreground font-medium">Audit Fields: </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {auditFields.map((field) => (
              <Badge key={field} variant="outline" className="text-xs font-mono">
                {field}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
