/**
 * WorkbenchDashboard
 * 
 * Apartment workbench overview + quick actions + system status
 */

import React from 'react';
import { WorkbenchQuickActions } from '../workbench/WorkbenchQuickActions';
import { WorkbenchSystemStatus } from '../workbench/WorkbenchSystemStatus';
import { TerminalLogStream, LogEntry } from '../core/TerminalLogStream';
import { OrnamentGraffitiTag } from '../ornaments/OrnamentGraffitiTag';
import { OrnamentStickyNote } from '../ornaments/OrnamentStickyNote';

export function WorkbenchDashboard() {
  // TODO: Wire up real recent activity from API
  const recentLogs: LogEntry[] = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      level: 'info',
      message: '[SYSTEM] Workshop initialized',
      source: 'dashboard',
    },
  ];

  return (
    <div className="space-y-6 relative">
      <OrnamentGraffitiTag text="WORKBENCH" position="top-right" />
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-primary font-mono mb-2">
          Dashboard
        </h1>
        <p className="text-sm text-ink-muted">
          Apartment workbench overview
        </p>
      </div>

      {/* Quick Actions & System Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WorkbenchQuickActions
          onScanDevices={() => console.log('Scan devices')}
          onFlashDevice={() => console.log('Flash device')}
          onSearchFirmware={() => console.log('Search firmware')}
          onRefresh={() => window.location.reload()}
        />
        
        <WorkbenchSystemStatus />
      </div>

      {/* Recent Activity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono uppercase tracking-wider text-ink-muted">
            Recent Activity
          </h2>
        </div>
        
        <div className="h-48 rounded-lg border border-panel overflow-hidden">
          <TerminalLogStream
            logs={recentLogs}
            maxLines={10}
            autoScroll={false}
            className="h-full"
          />
        </div>
      </div>

      {/* Sticky Note Tip */}
      <div className="relative">
        <OrnamentStickyNote
          text="Use Quick Actions to jump into common operations. System Status shows backend health and catalog state."
          variant="tip"
          position="static"
        />
      </div>
    </div>
  );
}
