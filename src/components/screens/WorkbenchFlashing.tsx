/**
 * WorkbenchFlashing
 * 
 * Flash jobs, history, status; heavy confirmations
 */

import React, { useState } from 'react';
import { TerminalCommandPreview } from '../core/TerminalCommandPreview';
import { TerminalLogStream, LogEntry } from '../core/TerminalLogStream';
import { ToolboxDangerLever } from '../toolbox/ToolboxDangerLever';
import { WorkbenchDeviceStack } from '../core/WorkbenchDeviceStack';
import { AlertTriangle } from 'lucide-react';

interface Device {
  serial: string;
  brand: string;
  model: string;
  state: string;
  platform?: string;
}

export function WorkbenchFlashing() {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [flashLogs, setFlashLogs] = useState<LogEntry[]>([]);
  const [isFlashing, setIsFlashing] = useState(false);

  // TODO: Wire up real device list from API
  const devices: Device[] = [];

  const commands = selectedDevice ? [
    {
      command: `fastboot flash system system.img`,
      description: 'Flash system partition',
      risk: 'destructive' as const,
    },
  ] : [];

  const handleFlash = () => {
    if (!selectedDevice) return;
    setIsFlashing(true);
    // TODO: Wire up real flash API
    console.log('Flash started for:', selectedDevice.serial);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-primary font-mono mb-2">
          Flashing
        </h1>
        <p className="text-sm text-ink-muted">
          Flash jobs, history, status — heavy confirmations required
        </p>
      </div>

      {/* Warning Banner */}
      <div className="p-4 rounded-lg border-2 border-state-danger/50 bg-state-danger/10">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-state-danger shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-state-danger font-mono mb-1">
              DESTRUCTIVE OPERATION
            </p>
            <p className="text-xs text-ink-muted">
              Flashing will overwrite device partitions. Ensure you have backups and understand the risks.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Device Selection & Command Preview */}
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-mono uppercase tracking-wider text-ink-muted mb-3">
              Select Device
            </h2>
            <WorkbenchDeviceStack
              devices={devices}
              onSelectDevice={setSelectedDevice}
              selectedSerial={selectedDevice?.serial}
            />
          </div>

          {selectedDevice && (
            <>
              <TerminalCommandPreview
                commands={commands}
                impactedPartitions={['system', 'boot', 'recovery']}
                riskLevel="destructive"
              />

              <ToolboxDangerLever
                onConfirm={handleFlash}
                disabled={!selectedDevice || isFlashing}
                label="HOLD TO START FLASH"
                warning="This will overwrite device partitions. This cannot be undone."
              />
            </>
          )}
        </div>

        {/* Right: Flash Logs */}
        <div className="space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-wider text-ink-muted">
            Flash Logs
          </h2>
          <div className="h-96 rounded-lg border border-panel overflow-hidden">
            <TerminalLogStream
              logs={flashLogs}
              maxLines={100}
              autoScroll={true}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
