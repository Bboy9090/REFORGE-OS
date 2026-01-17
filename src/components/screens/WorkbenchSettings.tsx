/**
 * WorkbenchSettings
 * 
 * System tools + logs viewer + atmosphere/audio
 */

import React from 'react';
import { TerminalLogStream, LogEntry } from '../core/TerminalLogStream';
import { WorkbenchSystemStatus } from '../workbench/WorkbenchSystemStatus';
import { Settings, Volume2, Moon } from 'lucide-react';

export function WorkbenchSettings() {
  const logs: LogEntry[] = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      level: 'info',
      message: '[SETTINGS] Settings panel loaded',
      source: 'settings',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-primary font-mono mb-2">
          Settings
        </h1>
        <p className="text-sm text-ink-muted">
          System tools, logs viewer, and atmosphere settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <div>
          <h2 className="text-sm font-mono uppercase tracking-wider text-ink-muted mb-4">
            System Status
          </h2>
          <WorkbenchSystemStatus />
        </div>

        {/* Atmosphere Settings */}
        <div className="space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-wider text-ink-muted">
            Atmosphere
          </h2>
          
          <div className="p-4 rounded-lg border border-panel bg-workbench-steel space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-ink-muted" />
                <span className="text-sm text-ink-primary">Audio</span>
              </div>
              <button className="px-3 py-1.5 rounded-md border border-panel bg-basement-concrete text-xs font-mono text-ink-primary hover:border-spray-cyan transition-all motion-snap">
                OFF
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-ink-muted" />
                <span className="text-sm text-ink-primary">Theme</span>
              </div>
              <select className="px-3 py-1.5 rounded-md border border-panel bg-basement-concrete text-xs font-mono text-ink-primary focus:outline-none focus:border-spray-cyan transition-all motion-snap">
                <option>Classic Bronx Night</option>
                <option>Space Jam After-Hours</option>
                <option>Basement Terminal Mode</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Viewer */}
      <div>
        <h2 className="text-sm font-mono uppercase tracking-wider text-ink-muted mb-4">
          System Logs
        </h2>
        <div className="h-96 rounded-lg border border-panel overflow-hidden">
          <TerminalLogStream
            logs={logs}
            maxLines={100}
            autoScroll={false}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
