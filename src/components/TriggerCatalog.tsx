import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  MagnifyingGlass,
  Info,
  Warning,
  Code
} from '@phosphor-icons/react';
import { 
  AUTHORIZATION_TRIGGERS, 
  type TriggerCategory,
  type AuthorizationTrigger 
} from '@/lib/authorization-triggers';
import { AuthorizationTriggerModal } from './AuthorizationTriggerModal';
import { useAuthorizationTrigger } from '@/hooks/use-authorization-trigger';
import { toast } from 'sonner';

const CATEGORY_ICONS: Record<TriggerCategory, React.ReactNode> = {
  trust_security: <ShieldCheck className="h-4 w-4" />,
  flash_operations: <Lightning className="h-4 w-4" />,
  diagnostics: <TestTube className="h-4 w-4" />,
  evidence_reports: <Archive className="h-4 w-4" />,
  policy_compliance: <ShieldWarning className="h-4 w-4" />,
  hotplug_events: <Plug className="h-4 w-4" />,
  plugin_actions: <Package className="h-4 w-4" />,
};

const CATEGORY_LABELS: Record<TriggerCategory, string> = {
  trust_security: 'Trust & Security',
  flash_operations: 'Flash Operations',
  diagnostics: 'Diagnostics',
  evidence_reports: 'Evidence & Reports',
  policy_compliance: 'Policy & Compliance',
  hotplug_events: 'Hotplug Events',
  plugin_actions: 'Plugin Actions',
};

export function TriggerCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TriggerCategory | 'all'>('all');
  const [androidSerial, setAndroidSerial] = useState('');
  const [iosUdid, setIosUdid] = useState('');
  const { trigger, deviceId, deviceName, additionalData, isOpen, openTrigger, closeTrigger } =
    useAuthorizationTrigger();

  const filteredTriggers = AUTHORIZATION_TRIGGERS.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.frontendPrompt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedTriggers = filteredTriggers.reduce((acc, trigger) => {
    if (!acc[trigger.category]) {
      acc[trigger.category] = [];
    }
    acc[trigger.category].push(trigger);
    return acc;
  }, {} as Record<TriggerCategory, AuthorizationTrigger[]>);

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

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low':
        return <Info className="h-3 w-3" />;
      case 'medium':
        return <Warning className="h-3 w-3" />;
      case 'high':
      case 'destructive':
        return <ShieldWarning className="h-3 w-3" />;
      default:
        return <Info className="h-3 w-3" />;
    }
  };

  const handleRunTrigger = (t: AuthorizationTrigger) => {
    const selectedDeviceId =
      t.deviceIdField === 'udid' ? iosUdid.trim() : androidSerial.trim();

    if (t.deviceIdRequired && !selectedDeviceId) {
      toast.error('Device ID required', {
        description:
          t.deviceIdField === 'udid'
            ? 'Enter an iOS UDID to run this trigger.'
            : 'Enter an Android device serial to run this trigger.',
      });
      return;
    }

    openTrigger(t.id, {
      deviceId: t.deviceIdRequired ? selectedDeviceId : undefined,
      deviceName: t.deviceIdRequired ? selectedDeviceId : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Authorization Trigger Catalog</CardTitle>
              <CardDescription>
                {AUTHORIZATION_TRIGGERS.length} triggers mapped to backend endpoints with audit
                logging
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              v1.0
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Android Serial
              </div>
              <Input
                id="trigger-catalog-android-serial"
                placeholder="e.g. R58M1234ABC"
                value={androidSerial}
                onChange={(e) => setAndroidSerial(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                iOS UDID
              </div>
              <Input
                id="trigger-catalog-ios-udid"
                placeholder="e.g. 00008110-0012345678901234"
                value={iosUdid}
                onChange={(e) => setIosUdid(e.target.value)}
              />
            </div>
          </div>

          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="trigger-search"
              placeholder="Search triggers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
            <ScrollArea className="w-full">
              <TabsList className="inline-flex w-max">
                <TabsTrigger value="all">All ({AUTHORIZATION_TRIGGERS.length})</TabsTrigger>
                {(Object.keys(CATEGORY_LABELS) as TriggerCategory[]).map((category) => {
                  const count = AUTHORIZATION_TRIGGERS.filter((t) => t.category === category).length;
                  return (
                    <TabsTrigger key={category} value={category} className="gap-2">
                      {CATEGORY_ICONS[category]}
                      {CATEGORY_LABELS[category]} ({count})
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </ScrollArea>

            <TabsContent value={selectedCategory} className="mt-4">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  {Object.entries(groupedTriggers).map(([category, triggers]) => (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {CATEGORY_ICONS[category as TriggerCategory]}
                        {CATEGORY_LABELS[category as TriggerCategory]}
                      </div>

                      <div className="grid gap-3">
                        {triggers.map((trigger) => (
                          <Card key={trigger.id} className="hover:border-primary/50 transition-colors">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium text-foreground">{trigger.name}</h4>
                                      <Badge className={getRiskLevelColor(trigger.riskLevel)}>
                                        {getRiskIcon(trigger.riskLevel)}
                                        <span className="ml-1 text-[10px] uppercase tracking-wider font-bold">
                                          {trigger.riskLevel}
                                        </span>
                                      </Badge>
                                      {trigger.requiresTypedConfirmation && (
                                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                                          Typed Confirm
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {trigger.frontendPrompt}
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRunTrigger(trigger)}
                                  >
                                    Run
                                  </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div className="space-y-1">
                                    <div className="text-muted-foreground uppercase tracking-wider font-medium">
                                      Backend Endpoint
                                    </div>
                                    <div className="flex items-center gap-1 font-mono text-primary">
                                      <Code className="h-3 w-3" />
                                      <span className="text-[11px]">
                                        {trigger.method} {trigger.backendEndpoint}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-muted-foreground uppercase tracking-wider font-medium">
                                      Device Required
                                    </div>
                                    <Badge variant={trigger.deviceIdRequired ? 'default' : 'secondary'}>
                                      {trigger.deviceIdRequired ? 'Yes' : 'No'}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                                  <span className="font-medium">Modal: </span>
                                  {trigger.modalText}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AuthorizationTriggerModal
        trigger={trigger}
        deviceId={deviceId}
        deviceName={deviceName}
        additionalData={additionalData}
        open={isOpen}
        onClose={closeTrigger}
        onSuccess={(data) => {
          toast.success('Trigger executed successfully', {
            description: `Action: ${trigger?.name}`,
          });
        }}
        onError={(error) => {
          toast.error('Trigger execution failed', {
            description: error,
          });
        }}
      />
    </div>
  );
}
