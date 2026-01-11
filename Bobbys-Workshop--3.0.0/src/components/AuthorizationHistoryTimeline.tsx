import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowClockwise,
  DeviceMobile,
  Trash,
  MagnifyingGlass,
  FunnelSimple,
} from '@phosphor-icons/react';
import { format } from 'date-fns';
import { useAuthorizationHistory } from '@/hooks/use-authorization-history';
import type { AuthorizationHistoryEntry } from '@/types/authorization-history';
import { motion, AnimatePresence } from 'framer-motion';

export function AuthorizationHistoryTimeline() {
  const {
    getTimelineGroups,
    getFilteredHistory,
    deleteHistoryEntry,
    clearHistory,
    retryAuthorization,
    isRetrying,
    getStats,
  } = useAuthorizationHistory();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const stats = getStats();
  
  const filteredHistory = getFilteredHistory({
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  }).filter((entry) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.triggerName.toLowerCase().includes(query) ||
      entry.deviceId?.toLowerCase().includes(query) ||
      entry.deviceName?.toLowerCase().includes(query)
    );
  });

  const timelineGroups = getTimelineGroups();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" weight="fill" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-destructive" weight="fill" />;
      case 'retrying':
        return <ArrowClockwise className="h-5 w-5 text-warning animate-spin" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      success: 'bg-success/20 text-success border-success/50',
      failed: 'bg-destructive/20 text-destructive border-destructive/50',
      retrying: 'bg-warning/20 text-warning border-warning/50',
      pending: 'bg-muted text-muted-foreground border-border',
    };
    return variants[status] || variants.pending;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      trust_security: 'bg-primary/20 text-primary border-primary/50',
      flash_operations: 'bg-accent/20 text-accent border-accent/50',
      diagnostics: 'bg-success/20 text-success border-success/50',
      evidence_reports: 'bg-foreground/20 text-foreground border-foreground/50',
      policy_compliance: 'bg-destructive/20 text-destructive border-destructive/50',
      hotplug_events: 'bg-warning/20 text-warning border-warning/50',
      plugin_actions: 'bg-primary/20 text-primary border-primary/50',
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="text-sm text-muted-foreground mb-1">Total</div>
          <div className="text-2xl font-bold font-mono">{stats.total}</div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <div className="text-sm text-muted-foreground mb-1">Success</div>
          <div className="text-2xl font-bold font-mono text-success">{stats.successful}</div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <div className="text-sm text-muted-foreground mb-1">Failed</div>
          <div className="text-2xl font-bold font-mono text-destructive">{stats.failed}</div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <div className="text-sm text-muted-foreground mb-1">Success Rate</div>
          <div className="text-2xl font-bold font-mono text-primary">{stats.successRate.toFixed(1)}%</div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <div className="text-sm text-muted-foreground mb-1">Avg Time</div>
          <div className="text-2xl font-bold font-mono text-accent">
            {stats.avgExecutionTime > 0 ? `${stats.avgExecutionTime.toFixed(0)}ms` : '-'}
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-card border-border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by trigger, device ID, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px] bg-secondary border-border">
                <FunnelSimple className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="trust_security">Trust & Security</SelectItem>
                <SelectItem value="flash_operations">Flash Ops</SelectItem>
                <SelectItem value="diagnostics">Diagnostics</SelectItem>
                <SelectItem value="evidence_reports">Evidence</SelectItem>
                <SelectItem value="policy_compliance">Policy</SelectItem>
                <SelectItem value="hotplug_events">Hotplug</SelectItem>
                <SelectItem value="plugin_actions">Plugins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-secondary border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="retrying">Retrying</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            {stats.total > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Clear all authorization history?')) {
                    clearHistory();
                  }
                }}
                className="text-destructive hover:text-destructive"
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      <ScrollArea className="h-[600px]">
        {timelineGroups.length === 0 ? (
          <Card className="p-12 bg-card border-border text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Authorization History</h3>
            <p className="text-sm text-muted-foreground">
              Authorization triggers will appear here once executed
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {timelineGroups.map((group) => (
              <div key={group.date} className="space-y-4">
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.date}
                  </h3>
                </div>
                <div className="space-y-3 relative pl-6 before:absolute before:left-[11px] before:top-0 before:bottom-0 before:w-[2px] before:bg-border">
                  <AnimatePresence>
                    {group.entries
                      .filter((entry) => filteredHistory.some((f) => f.id === entry.id))
                      .map((entry) => (
                        <TimelineEntry
                          key={entry.id}
                          entry={entry}
                          onDelete={deleteHistoryEntry}
                          onRetry={retryAuthorization}
                          isRetrying={isRetrying[entry.id] || false}
                          getStatusIcon={getStatusIcon}
                          getStatusBadge={getStatusBadge}
                          getCategoryColor={getCategoryColor}
                        />
                      ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

interface TimelineEntryProps {
  entry: AuthorizationHistoryEntry;
  onDelete: (id: string) => void;
  onRetry: (id: string, fn: () => Promise<any>) => Promise<boolean>;
  isRetrying: boolean;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusBadge: (status: string) => string;
  getCategoryColor: (category: string) => string;
}

function TimelineEntry({
  entry,
  onDelete,
  onRetry,
  isRetrying,
  getStatusIcon,
  getStatusBadge,
  getCategoryColor,
}: TimelineEntryProps) {
  const handleRetry = async () => {
    console.log('[Timeline] Retry not implemented for entry:', entry.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="relative"
    >
      <div className="absolute left-[-1.3rem] top-3 w-6 h-6 rounded-full bg-card border-2 border-border flex items-center justify-center">
        {getStatusIcon(entry.status)}
      </div>
      <Card className="p-4 bg-card border-border hover:border-primary/50 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-foreground">{entry.triggerName}</h4>
              <Badge className={getStatusBadge(entry.status)}>
                {entry.status}
              </Badge>
              <Badge className={getCategoryColor(entry.category)} variant="outline">
                {entry.category.replace('_', ' ')}
              </Badge>
            </div>

            {entry.deviceId && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DeviceMobile className="h-4 w-4" />
                <span className="font-mono">{entry.deviceId}</span>
                {entry.deviceName && (
                  <span className="text-foreground">({entry.deviceName})</span>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(entry.timestamp, 'h:mm:ss a')}
              </div>
              {entry.executionTime && (
                <div className="font-mono">
                  {entry.executionTime}ms
                </div>
              )}
              {entry.retryCount && entry.retryCount > 0 && (
                <div className="flex items-center gap-1">
                  <ArrowClockwise className="h-3 w-3" />
                  Retry {entry.retryCount}/{entry.maxRetries}
                </div>
              )}
              <div className="text-xs">
                {entry.userResponse}
              </div>
            </div>

            {entry.errorMessage && (
              <div className="text-sm text-destructive bg-destructive/10 px-2 py-1 rounded">
                {entry.errorMessage}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {entry.status === 'failed' && entry.retryCount! < entry.maxRetries! && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRetry}
                disabled={isRetrying}
                className="text-warning hover:text-warning"
              >
                <ArrowClockwise className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(entry.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
