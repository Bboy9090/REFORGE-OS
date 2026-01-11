import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  ChartLineUp,
  ListChecks,
  Gear,
  ArrowClockwise,
  Download,
  FileText,
} from '@phosphor-icons/react';
import { AuthorizationHistoryTimeline } from './AuthorizationHistoryTimeline';
import { useAuthorizationHistory } from '@/hooks/use-authorization-history';
import { useKV } from '@github/spark/hooks';
import type { AuthorizationRetryConfig } from '@/types/authorization-history';
import { format } from 'date-fns';

const DEFAULT_RETRY_CONFIG: AuthorizationRetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
  timeout: 30000,
};

export function AuthorizationHistoryDashboard() {
  const [activeTab, setActiveTab] = useState('timeline');
  const { history, getStats, clearHistory } = useAuthorizationHistory();
  const [retryConfig, setRetryConfig] = useKV<AuthorizationRetryConfig>(
    'authorization-retry-config',
    DEFAULT_RETRY_CONFIG
  );

  const stats = getStats();

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `authorization-history-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const updateRetryConfig = (updates: Partial<AuthorizationRetryConfig>) => {
    setRetryConfig((current) => ({ ...(current || DEFAULT_RETRY_CONFIG), ...updates }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-foreground">
            Authorization History
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage all authorization trigger executions with retry mechanisms
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportHistory}
            disabled={(history?.length || 0) === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-secondary">
          <TabsTrigger value="timeline" className="gap-2">
            <Clock className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="statistics" className="gap-2">
            <ChartLineUp className="h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Gear className="h-4 w-4" />
            Retry Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <AuthorizationHistoryTimeline />
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                Overview Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Executions</span>
                  <span className="text-2xl font-bold font-mono">{stats.total}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Successful</span>
                  <span className="text-xl font-bold font-mono text-success">{stats.successful}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Failed</span>
                  <span className="text-xl font-bold font-mono text-destructive">{stats.failed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="text-xl font-bold font-mono text-warning">{stats.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Retrying</span>
                  <span className="text-xl font-bold font-mono text-accent">{stats.retrying}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ChartLineUp className="h-5 w-5 text-primary" />
                Performance Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success transition-all"
                        style={{ width: `${stats.successRate}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold font-mono text-primary">
                      {stats.successRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Execution Time</span>
                  <span className="text-xl font-bold font-mono text-accent">
                    {stats.avgExecutionTime > 0 ? `${stats.avgExecutionTime.toFixed(0)}ms` : '-'}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Failure Rate</span>
                  <span className="text-xl font-bold font-mono text-destructive">
                    {stats.total > 0 ? ((stats.failed / stats.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['trust_security', 'flash_operations', 'diagnostics', 'evidence_reports', 'policy_compliance', 'hotplug_events', 'plugin_actions'].map((category) => {
                const categoryEntries = (history || []).filter((e) => e.category === category);
                const categorySuccess = categoryEntries.filter((e) => e.status === 'success').length;
                const categoryTotal = categoryEntries.length;
                const successRate = categoryTotal > 0 ? (categorySuccess / categoryTotal) * 100 : 0;

                return (
                  <Card key={category} className="p-4 bg-secondary border-border">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                      {category.replace('_', ' ')}
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold font-mono">{categoryTotal}</span>
                      <span className="text-sm text-muted-foreground">total</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${successRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono">{successRate.toFixed(0)}%</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-6">
              <ArrowClockwise className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Retry Configuration</h3>
            </div>

            <div className="space-y-6 max-w-xl">
              <div className="space-y-2">
                <Label htmlFor="maxRetries">Maximum Retry Attempts</Label>
                <Input
                  id="maxRetries"
                  type="number"
                  min="0"
                  max="10"
                  value={retryConfig?.maxRetries || DEFAULT_RETRY_CONFIG.maxRetries}
                  onChange={(e) => updateRetryConfig({ maxRetries: parseInt(e.target.value) })}
                  className="bg-secondary border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Number of times to retry a failed authorization (0-10)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retryDelay">Initial Retry Delay (ms)</Label>
                <Input
                  id="retryDelay"
                  type="number"
                  min="100"
                  max="10000"
                  step="100"
                  value={retryConfig?.retryDelay || DEFAULT_RETRY_CONFIG.retryDelay}
                  onChange={(e) => updateRetryConfig({ retryDelay: parseInt(e.target.value) })}
                  className="bg-secondary border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Initial delay before first retry attempt (100-10000ms)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backoffMultiplier">Backoff Multiplier</Label>
                <Input
                  id="backoffMultiplier"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={retryConfig?.backoffMultiplier || DEFAULT_RETRY_CONFIG.backoffMultiplier}
                  onChange={(e) => updateRetryConfig({ backoffMultiplier: parseFloat(e.target.value) })}
                  className="bg-secondary border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Exponential backoff multiplier for subsequent retries (1-5)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeout">Operation Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min="1000"
                  max="300000"
                  step="1000"
                  value={retryConfig?.timeout || DEFAULT_RETRY_CONFIG.timeout}
                  onChange={(e) => updateRetryConfig({ timeout: parseInt(e.target.value) })}
                  className="bg-secondary border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum time to wait for operation completion (1000-300000ms)
                </p>
              </div>

              <Separator />

              <div className="bg-secondary rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Retry Behavior Preview
                </h4>
                <div className="text-xs text-muted-foreground space-y-1 font-mono">
                  <div>• Attempt 1: {retryConfig?.retryDelay || DEFAULT_RETRY_CONFIG.retryDelay}ms delay</div>
                  <div>• Attempt 2: {((retryConfig?.retryDelay || DEFAULT_RETRY_CONFIG.retryDelay) * (retryConfig?.backoffMultiplier || DEFAULT_RETRY_CONFIG.backoffMultiplier)).toFixed(0)}ms delay</div>
                  <div>• Attempt 3: {((retryConfig?.retryDelay || DEFAULT_RETRY_CONFIG.retryDelay) * Math.pow(retryConfig?.backoffMultiplier || DEFAULT_RETRY_CONFIG.backoffMultiplier, 2)).toFixed(0)}ms delay</div>
                  <div className="pt-1 border-t border-border mt-2">
                    Total attempts: {(retryConfig?.maxRetries || DEFAULT_RETRY_CONFIG.maxRetries) + 1}
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setRetryConfig(DEFAULT_RETRY_CONFIG)}
                className="w-full"
              >
                Reset to Defaults
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
