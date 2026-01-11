/**
 * TrapdoorShadowArchive
 * 
 * Encrypted audit log viewer for Secret Rooms operations.
 * Monument Park style - history, discipline, stats.
 * 
 * NO MOCKS - connects to real API only.
 */

import React, { useState, useEffect } from 'react';
import { Archive, Search, Download, Filter, Calendar, Shield, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TerminalLogStream, LogEntry } from '../core/TerminalLogStream';
import { useApp } from '@/lib/app-context';
import { toast } from 'sonner';

interface AuditEntry {
  id: string;
  timestamp: string;
  operation: string;
  deviceSerial?: string;
  user: string;
  result: 'success' | 'failure' | 'denied';
  details?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'destructive';
}

interface TrapdoorShadowArchiveProps {
  passcode?: string; // Secret Room passcode for API auth
  className?: string;
}

function convertAuditToLog(entry: AuditEntry): LogEntry {
  const level: LogEntry['level'] = 
    entry.result === 'success' ? 'success' :
    entry.result === 'failure' ? 'error' :
    'warn';

  const message = [
    `[${entry.operation}]`,
    entry.deviceSerial && `Device: ${entry.deviceSerial}`,
    entry.result,
    entry.details,
  ].filter(Boolean).join(' - ');

  return {
    id: entry.id,
    timestamp: entry.timestamp,
    level,
    message,
    source: 'shadow-archive',
  };
}

export function TrapdoorShadowArchive({ 
  passcode,
  className 
}: TrapdoorShadowArchiveProps) {
  const { backendAvailable } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterResult, setFilterResult] = useState<string>('all');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch shadow logs from API
  useEffect(() => {
    if (!backendAvailable || !passcode) {
      setLogs([]);
      setError('Backend unavailable or passcode required');
      return;
    }

    let cancelled = false;

    async function fetchShadowLogs() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (filterRisk !== 'all') params.append('riskLevel', filterRisk);
        if (filterResult !== 'all') params.append('result', filterResult);
        if (searchQuery) params.append('search', searchQuery);
        params.append('limit', '1000');

        const response = await fetch(`/api/v1/trapdoor/logs/shadow?${params}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Secret-Room-Passcode': passcode,
          },
        });

        if (cancelled) return;

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.error?.message || `HTTP ${response.status}`);
          setLogs([]);
          setTotalCount(0);
          return;
        }

        const envelope = await response.json();

        if (cancelled) return;

        if (!envelope.ok || !envelope.data) {
          setError(envelope.error?.message || 'Failed to load shadow logs');
          setLogs([]);
          setTotalCount(0);
          return;
        }

        // Convert API response to audit entries
        const entries: AuditEntry[] = envelope.data.logs || envelope.data.entries || [];
        const convertedLogs = entries.map((entry: any) => ({
          id: entry.id || entry.timestamp || Math.random().toString(),
          timestamp: entry.timestamp || new Date().toISOString(),
          operation: entry.operation || 'unknown',
          deviceSerial: entry.deviceSerial,
          user: entry.userId || entry.user || 'unknown',
          result: entry.success === true ? 'success' : entry.success === false ? 'failure' : 'denied',
          details: entry.metadata ? JSON.stringify(entry.metadata) : entry.details,
          riskLevel: entry.riskLevel || 'medium',
        })).map(convertAuditToLog);

        setLogs(convertedLogs);
        setTotalCount(envelope.data.count || convertedLogs.length);
      } catch (err) {
        if (cancelled) return;
        console.error('[TrapdoorShadowArchive] Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Network error');
        setLogs([]);
        setTotalCount(0);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchShadowLogs();

    return () => {
      cancelled = true;
    };
  }, [backendAvailable, passcode, filterRisk, filterResult, searchQuery]);

  const handleExport = async () => {
    if (!passcode) return;

    try {
      const response = await fetch('/api/v1/trapdoor/logs/shadow?limit=10000', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Secret-Room-Passcode': passcode,
        },
      });

      if (!response.ok) {
        toast.error('Failed to export logs', {
          description: 'Unable to download audit log export',
        });
        return;
      }

      const envelope = await response.json();
      const data = JSON.stringify(envelope.data, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shadow-archive-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[TrapdoorShadowArchive] Export error:', err);
      toast.error('Export failed', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  return (
    <div className={cn("h-full flex flex-col bg-basement-concrete", className)}>
      {/* Header */}
      <div className="p-4 border-b border-panel bg-basement-concrete">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg border border-spray-magenta/30 bg-spray-magenta/10 flex items-center justify-center">
            <Archive className="w-5 h-5 text-spray-magenta" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink-primary font-mono">
              Shadow Archive
            </h1>
            <p className="text-xs text-ink-muted">
              Encrypted audit logs — All Secret Room operations
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-4 p-3 rounded-lg border border-state-danger/50 bg-state-danger/10 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-state-danger shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-state-danger font-mono">{error}</p>
              {!backendAvailable && (
                <p className="text-xs text-ink-muted mt-1">Backend is offline</p>
              )}
              {!passcode && (
                <p className="text-xs text-ink-muted mt-1">Secret Room passcode required</p>
              )}
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search operations, devices, users..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-workbench-steel border border-panel text-ink-primary text-sm font-mono placeholder:text-ink-muted focus:outline-none focus:border-spray-cyan focus:glow-cyan transition-all motion-snap"
            />
          </div>

          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-3 py-2 rounded-lg bg-workbench-steel border border-panel text-ink-primary text-sm font-mono focus:outline-none focus:border-spray-cyan transition-all motion-snap"
          >
            <option value="all">All Risks</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="destructive">Destructive</option>
          </select>

          <select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
            className="px-3 py-2 rounded-lg bg-workbench-steel border border-panel text-ink-primary text-sm font-mono focus:outline-none focus:border-spray-cyan transition-all motion-snap"
          >
            <option value="all">All Results</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="denied">Denied</option>
          </select>

          <button
            onClick={handleExport}
            disabled={!passcode || loading || logs.length === 0}
            className="px-3 py-2 rounded-lg bg-workbench-steel border border-panel text-ink-primary text-sm font-mono hover:border-spray-cyan hover:glow-cyan transition-all motion-snap flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-4 py-2 border-b border-panel bg-basement-concrete">
        <div className="flex items-center gap-6 text-xs font-mono text-ink-muted">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Total Entries: {loading ? '...' : totalCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Last 30 days</span>
          </div>
          {loading && (
            <span className="text-spray-cyan">Loading...</span>
          )}
        </div>
      </div>

      {/* Log Stream */}
      <div className="flex-1 min-h-0">
        {loading && logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-ink-muted">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-spray-cyan border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm font-mono">Loading shadow logs...</p>
            </div>
          </div>
        ) : (
          <TerminalLogStream
            logs={logs}
            maxLines={1000}
            autoScroll={false}
            className="h-full"
          />
        )}
      </div>

      {/* Footer Note */}
      <div className="p-3 border-t border-panel bg-basement-concrete">
        <p className="text-xs text-ink-muted/70 font-mono text-center">
          All operations are encrypted and immutable. Logs cannot be deleted or modified.
        </p>
      </div>
    </div>
  );
}
