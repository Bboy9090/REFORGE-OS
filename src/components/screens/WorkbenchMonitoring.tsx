/**
 * WorkbenchMonitoring
 * 
 * Performance + diagnostics
 */

import React from 'react';
import { TerminalLogStream, LogEntry } from '../core/TerminalLogStream';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Activity, Cpu, Battery, HardDrive } from 'lucide-react';

export function WorkbenchMonitoring() {
  const { metrics, status } = useAnalytics();
  const logs: LogEntry[] = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      level: 'info',
      message: '[MONITOR] Performance monitoring active',
      source: 'monitoring',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-primary font-mono mb-2">
          Monitoring
        </h1>
        <p className="text-sm text-ink-muted">
          Real-time performance metrics and diagnostics
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-panel bg-workbench-steel">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-crt-green" />
            <span className="text-xs font-mono text-ink-muted">CPU</span>
          </div>
          <p className="text-lg font-mono font-bold text-ink-primary">
            {metrics.find(m => m.metric === 'cpu')?.value || '--'}%
          </p>
        </div>

        <div className="p-4 rounded-lg border border-panel bg-workbench-steel">
          <div className="flex items-center gap-2 mb-2">
            <Battery className="w-4 h-4 text-crt-green" />
            <span className="text-xs font-mono text-ink-muted">Battery</span>
          </div>
          <p className="text-lg font-mono font-bold text-ink-primary">
            {metrics.find(m => m.metric === 'battery')?.value || '--'}%
          </p>
        </div>

        <div className="p-4 rounded-lg border border-panel bg-workbench-steel">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-4 h-4 text-crt-green" />
            <span className="text-xs font-mono text-ink-muted">Storage</span>
          </div>
          <p className="text-lg font-mono font-bold text-ink-primary">
            {metrics.find(m => m.metric === 'storage')?.value || '--'}%
          </p>
        </div>

        <div className="p-4 rounded-lg border border-panel bg-workbench-steel">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-crt-green" />
            <span className="text-xs font-mono text-ink-muted">Status</span>
          </div>
          <p className="text-xs font-mono text-ink-muted">
            {status === 'connected' ? 'Active' : 'Disconnected'}
          </p>
        </div>
      </div>

      {/* Diagnostics Log */}
      <div className="h-96 rounded-lg border border-panel overflow-hidden">
        <TerminalLogStream
          logs={logs}
          maxLines={100}
          autoScroll={false}
          className="h-full"
        />
      </div>
    </div>
  );
}
