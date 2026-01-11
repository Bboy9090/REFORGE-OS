/**
 * WorkbenchIOS
 * 
 * iOS scan, DFU, libimobiledevice tools
 */

import React from 'react';
import { TerminalLogStream, LogEntry } from '../core/TerminalLogStream';
import { Smartphone, Download } from 'lucide-react';

export function WorkbenchIOS() {
  const logs: LogEntry[] = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      level: 'info',
      message: '[iOS] Ready to scan for iOS devices',
      source: 'ios',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-primary font-mono mb-2">
          iOS Operations
        </h1>
        <p className="text-sm text-ink-muted">
          iOS device detection, DFU mode, libimobiledevice tools
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-panel bg-workbench-steel">
          <div className="flex items-center gap-3 mb-3">
            <Smartphone className="w-5 h-5 text-spray-cyan" />
            <h3 className="text-sm font-mono font-bold text-ink-primary">
              Device Scanner
            </h3>
          </div>
          <p className="text-xs text-ink-muted mb-3">
            Scan for connected iOS devices via USB
          </p>
          <button className="w-full px-3 py-2 rounded-md border border-panel bg-basement-concrete text-ink-primary text-sm font-mono hover:border-spray-cyan hover:glow-cyan transition-all motion-snap">
            Scan Devices
          </button>
        </div>

        <div className="p-4 rounded-lg border border-panel bg-workbench-steel">
          <div className="flex items-center gap-3 mb-3">
            <Download className="w-5 h-5 text-spray-cyan" />
            <h3 className="text-sm font-mono font-bold text-ink-primary">
              DFU Mode
            </h3>
          </div>
          <p className="text-xs text-ink-muted mb-3">
            Enter DFU mode for advanced operations
          </p>
          <button className="w-full px-3 py-2 rounded-md border border-panel bg-basement-concrete text-ink-primary text-sm font-mono hover:border-spray-cyan hover:glow-cyan transition-all motion-snap">
            Enter DFU
          </button>
        </div>

        <div className="p-4 rounded-lg border border-panel bg-workbench-steel">
          <h3 className="text-sm font-mono font-bold text-ink-primary mb-3">
            libimobiledevice
          </h3>
          <p className="text-xs text-ink-muted">
            Advanced iOS device communication tools
          </p>
        </div>
      </div>

      <div className="h-64 rounded-lg border border-panel overflow-hidden">
        <TerminalLogStream
          logs={logs}
          maxLines={50}
          autoScroll={false}
          className="h-full"
        />
      </div>
    </div>
  );
}
