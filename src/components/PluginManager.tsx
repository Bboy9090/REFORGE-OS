import { useState, useEffect } from 'react';
import {
  Plugin,
  PluginManifest,
  PluginCertification,
  PluginRegistry,
  RegisteredPlugin,
  PluginStatus,
  PluginRiskLevel,
  PluginCategory,
  PluginFilter,
  PluginSecurityPolicy,
} from '@/types/plugin-sdk';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Shield,
  ShieldCheck,
  ShieldWarning,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Warning,
  Download,
  Upload,
  Trash,
  Play,
  Gear,
  MagnifyingGlass,
  Funnel,
  ArrowCounterClockwise,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';

interface PluginManagerProps {
  onNavigate?: (section: string) => void;
}

export function PluginManager({ onNavigate }: PluginManagerProps) {
  const [plugins = [], setPlugins] = useKV<RegisteredPlugin[]>('bobby-plugins', []);
  const [securityPolicy = {
    allowUncertified: false,
    requireSignature: true,
    allowedRiskLevels: ['safe' as const, 'moderate' as const],
    maxExecutionsPerDay: 100,
    requireUserConfirmationFor: ['high' as const, 'critical' as const],
    blocklist: [],
    allowlist: [],
    sandboxEnabled: true,
    auditLogging: true,
  }, setSecurityPolicy] = useKV<PluginSecurityPolicy>('bobby-security-policy', {
    allowUncertified: false,
    requireSignature: true,
    allowedRiskLevels: ['safe', 'moderate'],
    maxExecutionsPerDay: 100,
    requireUserConfirmationFor: ['high', 'critical'],
    blocklist: [],
    allowlist: [],
    sandboxEnabled: true,
    auditLogging: true,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PluginCategory | 'all'>('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<PluginRiskLevel | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<PluginStatus | 'all'>('all');
  const [selectedPlugin, setSelectedPlugin] = useState<RegisteredPlugin | null>(null);

  const getRiskLevelColor = (level: PluginRiskLevel) => {
    switch (level) {
      case 'safe':
        return 'bg-success/20 text-success border-success/30';
      case 'moderate':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'high':
        return 'bg-accent/20 text-accent border-accent/30';
      case 'critical':
        return 'bg-destructive/20 text-destructive border-destructive/30';
    }
  };

  const getStatusColor = (status: PluginStatus) => {
    switch (status) {
      case 'certified':
        return 'bg-success/20 text-success border-success/30';
      case 'pending':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'rejected':
      case 'revoked':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'deprecated':
        return 'bg-muted/50 text-muted-foreground border-muted';
    }
  };

  const getStatusIcon = (status: PluginStatus) => {
    switch (status) {
      case 'certified':
        return <ShieldCheck className="text-success" weight="bold" />;
      case 'pending':
        return <Clock className="text-warning" />;
      case 'rejected':
      case 'revoked':
        return <ShieldWarning className="text-destructive" weight="bold" />;
      case 'deprecated':
        return <Warning className="text-muted-foreground" />;
    }
  };

  const filteredPlugins = plugins.filter((p) => {
    if (searchQuery && !p.plugin.manifest.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.plugin.manifest.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'all' && p.plugin.manifest.category !== selectedCategory) {
      return false;
    }
    if (selectedRiskLevel !== 'all' && p.plugin.manifest.riskLevel !== selectedRiskLevel) {
      return false;
    }
    if (selectedStatus !== 'all' && p.plugin.manifest.certification?.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  const enablePlugin = (pluginId: string) => {
    setPlugins((current) =>
      (current || []).map((p) =>
        p.plugin.manifest.id === pluginId ? { ...p, enabled: true } : p
      )
    );
    toast.success('Plugin enabled');
  };

  const disablePlugin = (pluginId: string) => {
    setPlugins((current) =>
      (current || []).map((p) =>
        p.plugin.manifest.id === pluginId ? { ...p, enabled: false } : p
      )
    );
    toast.success('Plugin disabled');
  };

  const uninstallPlugin = (pluginId: string) => {
    setPlugins((current) => (current || []).filter((p) => p.plugin.manifest.id !== pluginId));
    setSelectedPlugin(null);
    toast.success('Plugin uninstalled');
  };

  const executePlugin = async (pluginId: string) => {
    const plugin = plugins.find((p) => p.plugin.manifest.id === pluginId);
    if (!plugin) {
      toast.error('Plugin not found');
      return;
    }

    if (!plugin.enabled) {
      toast.error('Plugin is disabled');
      return;
    }

    const requiresConfirmation = securityPolicy.requireUserConfirmationFor.includes(
      plugin.plugin.manifest.riskLevel
    );

    if (requiresConfirmation) {
      toast.info('High-risk plugin requires confirmation');
    }

    toast.success(`Executing plugin: ${plugin.plugin.manifest.name}`);
    
    setPlugins((current) =>
      (current || []).map((p) =>
        p.plugin.manifest.id === pluginId
          ? {
              ...p,
              executionCount: p.executionCount + 1,
              lastExecuted: Date.now(),
            }
          : p
      )
    );
  };

  const certifyPlugin = (pluginId: string) => {
    setPlugins((current) =>
      (current || []).map((p) =>
        p.plugin.manifest.id === pluginId
          ? {
              ...p,
              plugin: {
                ...p.plugin,
                manifest: {
                  ...p.plugin.manifest,
                  certification: {
                    ...p.plugin.manifest.certification!,
                    status: 'certified',
                    certifiedBy: 'bobby',
                    certificationDate: Date.now(),
                  },
                },
              },
              trustScore: 100,
            }
          : p
      )
    );
    toast.success('Plugin certified');
  };

  const revokePlugin = (pluginId: string) => {
    setPlugins((current) =>
      (current || []).map((p) =>
        p.plugin.manifest.id === pluginId
          ? {
              ...p,
              enabled: false,
              plugin: {
                ...p.plugin,
                manifest: {
                  ...p.plugin.manifest,
                  certification: {
                    ...p.plugin.manifest.certification!,
                    status: 'revoked',
                  },
                },
              },
              trustScore: 0,
            }
          : p
      )
    );
    toast.success('Plugin certification revoked');
  };

  const statsData = {
    total: plugins.length,
    enabled: plugins.filter((p) => p.enabled).length,
    certified: plugins.filter((p) => p.plugin.manifest.certification?.status === 'certified').length,
    pending: plugins.filter((p) => p.plugin.manifest.certification?.status === 'pending').length,
    highRisk: plugins.filter((p) => ['high', 'critical'].includes(p.plugin.manifest.riskLevel)).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display tracking-wide text-primary">Plugin Manager</h1>
          <p className="text-muted-foreground mt-1">
            Manage and certify plugins for Bobby's World
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => onNavigate?.('plugin-install-demo')}>
            <Play />
            Installation Demo
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate?.('plugin-rollback')}>
            <ArrowCounterClockwise />
            Rollback System
          </Button>
          <Button variant="outline" size="sm">
            <Upload />
            Install Plugin
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate?.('settings')}>
            <Gear />
            Security Policy
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Plugins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{statsData.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{statsData.enabled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Certified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{statsData.certified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{statsData.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{statsData.highRisk}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Installed Plugins</CardTitle>
              <CardDescription>Browse and manage your plugins</CardDescription>
            </div>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search plugins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="device-detection">Detection</SelectItem>
                  <SelectItem value="diagnostics">Diagnostics</SelectItem>
                  <SelectItem value="flashing">Flashing</SelectItem>
                  <SelectItem value="recovery">Recovery</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="workflow">Workflow</SelectItem>
                  <SelectItem value="utility">Utility</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedRiskLevel} onValueChange={(v) => setSelectedRiskLevel(v as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="safe">Safe</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="certified">Certified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPlugins.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No plugins found</h3>
              <p className="text-muted-foreground">
                {plugins.length === 0
                  ? 'Install your first plugin to get started'
                  : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredPlugins.map((plugin) => (
                <Card
                  key={plugin.plugin.manifest.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setSelectedPlugin(plugin)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{plugin.plugin.manifest.name}</CardTitle>
                          {plugin.plugin.manifest.certification?.status &&
                            getStatusIcon(plugin.plugin.manifest.certification.status)}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {plugin.plugin.manifest.description}
                        </CardDescription>
                      </div>
                      <Switch
                        checked={plugin.enabled}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            enablePlugin(plugin.plugin.manifest.id);
                          } else {
                            disablePlugin(plugin.plugin.manifest.id);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={getRiskLevelColor(plugin.plugin.manifest.riskLevel)}>
                        {plugin.plugin.manifest.riskLevel}
                      </Badge>
                      <Badge variant="outline">{plugin.plugin.manifest.category}</Badge>
                      {plugin.plugin.manifest.certification?.status && (
                        <Badge variant="outline" className={getStatusColor(plugin.plugin.manifest.certification.status)}>
                          {plugin.plugin.manifest.certification.status}
                        </Badge>
                      )}
                      <div className="text-xs text-muted-foreground ml-auto">
                        v{plugin.plugin.manifest.version}
                      </div>
                    </div>
                    {plugin.executionCount > 0 && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Executed {plugin.executionCount} times
                        {plugin.lastExecuted && ` • Last: ${new Date(plugin.lastExecuted).toLocaleString()}`}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPlugin && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{selectedPlugin.plugin.manifest.name}</CardTitle>
                <CardDescription>
                  by {selectedPlugin.plugin.manifest.author} • v{selectedPlugin.plugin.manifest.version}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => executePlugin(selectedPlugin.plugin.manifest.id)}
                  disabled={!selectedPlugin.enabled}
                >
                  <Play />
                  Execute
                </Button>
                {selectedPlugin.plugin.manifest.certification?.status !== 'certified' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => certifyPlugin(selectedPlugin.plugin.manifest.id)}
                  >
                    <ShieldCheck />
                    Certify
                  </Button>
                )}
                {selectedPlugin.plugin.manifest.certification?.status === 'certified' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => revokePlugin(selectedPlugin.plugin.manifest.id)}
                  >
                    <ShieldWarning />
                    Revoke
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => uninstallPlugin(selectedPlugin.plugin.manifest.id)}
                >
                  <Trash />
                  Uninstall
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
                <TabsTrigger value="certification">Certification</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedPlugin.plugin.manifest.description}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Category</h4>
                    <Badge variant="outline">{selectedPlugin.plugin.manifest.category}</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Risk Level</h4>
                    <Badge variant="outline" className={getRiskLevelColor(selectedPlugin.plugin.manifest.riskLevel)}>
                      {selectedPlugin.plugin.manifest.riskLevel}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">License</h4>
                    <p className="text-sm">{selectedPlugin.plugin.manifest.license}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">SDK Version</h4>
                    <p className="text-sm">{selectedPlugin.plugin.manifest.minimumSDKVersion}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Executions</div>
                      <div className="text-2xl font-bold">{selectedPlugin.executionCount}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Trust Score</div>
                      <div className="text-2xl font-bold">{selectedPlugin.trustScore}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Errors</div>
                      <div className="text-2xl font-bold">{selectedPlugin.errors.length}</div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="capabilities" className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Supported Capabilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlugin.plugin.manifest.capabilities.map((cap) => (
                      <Badge key={cap} variant="secondary">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Supported Platforms</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlugin.plugin.manifest.supportedPlatforms.map((platform) => (
                      <Badge key={platform} variant="outline">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedPlugin.plugin.manifest.supportedDevices && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3">Supported Devices</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedPlugin.plugin.manifest.supportedDevices.map((device) => (
                          <Badge key={device} variant="outline">
                            {device}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="certification" className="space-y-4">
                {selectedPlugin.plugin.manifest.certification ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Status</h4>
                        <Badge
                          variant="outline"
                          className={getStatusColor(selectedPlugin.plugin.manifest.certification.status)}
                        >
                          {selectedPlugin.plugin.manifest.certification.status}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Certified By</h4>
                        <p className="text-sm capitalize">
                          {selectedPlugin.plugin.manifest.certification.certifiedBy}
                        </p>
                      </div>
                      {selectedPlugin.plugin.manifest.certification.certificationDate && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Certification Date</h4>
                          <p className="text-sm">
                            {new Date(selectedPlugin.plugin.manifest.certification.certificationDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Signature Hash</h4>
                        <p className="text-xs font-mono break-all">
                          {selectedPlugin.plugin.manifest.certification.signatureHash.slice(0, 16)}...
                        </p>
                      </div>
                    </div>

                    {selectedPlugin.plugin.manifest.certification.securityAudit && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-semibold mb-2">Security Audit</h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {selectedPlugin.plugin.manifest.certification.securityAudit.passed ? (
                                <CheckCircle className="text-success" weight="fill" />
                              ) : (
                                <XCircle className="text-destructive" weight="fill" />
                              )}
                              <span>
                                {selectedPlugin.plugin.manifest.certification.securityAudit.passed
                                  ? 'Passed'
                                  : 'Failed'}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              By {selectedPlugin.plugin.manifest.certification.securityAudit.auditor} on{' '}
                              {new Date(
                                selectedPlugin.plugin.manifest.certification.securityAudit.auditDate
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {selectedPlugin.plugin.manifest.certification.restrictions && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-semibold mb-2">Restrictions</h3>
                          <ul className="space-y-2 text-sm">
                            {selectedPlugin.plugin.manifest.certification.restrictions.requiresUserConfirmation && (
                              <li className="flex items-center gap-2">
                                <Warning size={16} />
                                Requires user confirmation before execution
                              </li>
                            )}
                            {selectedPlugin.plugin.manifest.certification.restrictions.requiresOwnerApproval && (
                              <li className="flex items-center gap-2">
                                <Shield size={16} />
                                Requires owner approval
                              </li>
                            )}
                            {selectedPlugin.plugin.manifest.certification.restrictions.maxExecutionsPerDay && (
                              <li className="flex items-center gap-2">
                                <Clock size={16} />
                                Limited to{' '}
                                {selectedPlugin.plugin.manifest.certification.restrictions.maxExecutionsPerDay}{' '}
                                executions per day
                              </li>
                            )}
                          </ul>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <Alert>
                    <Warning />
                    <AlertTitle>No Certification</AlertTitle>
                    <AlertDescription>
                      This plugin has not been certified yet. Use with caution.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="permissions" className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Required Permissions</h3>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {selectedPlugin.plugin.manifest.requiredPermissions.map((perm) => (
                        <div key={perm} className="flex items-center gap-2 p-2 rounded-md bg-muted">
                          <Shield size={16} className="text-muted-foreground" />
                          <span className="text-sm font-mono">{perm}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export type { Plugin } from '@/types/plugin-sdk';
