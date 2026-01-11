/**
 * TrapdoorUnlockChamber
 * 
 * Bootloader unlock flow with full confirmation gates.
 * Destructive sequence template implementation.
 * 
 * Flow:
 * 1. Device selector + status
 * 2. Risk tier display: DANGEROUS
 * 3. Command preview panel
 * 4. Confirmation gates (serial, UNLOCK, hold)
 * 5. Execute with streaming logs
 * 6. Show locks live
 * 7. Completion link to Shadow Archive
 */

import React, { useState, useEffect } from 'react';
import { Lock, AlertTriangle, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TerminalCommandPreview } from '../core/TerminalCommandPreview';
import { TerminalLogStream, LogEntry } from '../core/TerminalLogStream';
import { ToolboxDangerLever } from '../toolbox/ToolboxDangerLever';
import { DeviceIcon } from '../core/DeviceIcon';
import { useApp } from '@/lib/app-context';

interface Device {
  serial: string;
  brand: string;
  model: string;
  state: string;
  platform?: string;
}

interface TrapdoorUnlockChamberProps {
  passcode?: string;
  devices?: Device[];
  onDeviceSelect?: (device: Device) => void;
  className?: string;
}

export function TrapdoorUnlockChamber({
  passcode,
  devices = [],
  onDeviceSelect,
  className,
}: TrapdoorUnlockChamberProps) {
  const { backendAvailable } = useApp();
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [serialConfirmation, setSerialConfirmation] = useState('');
  const [unlockConfirmation, setUnlockConfirmation] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [deviceLocked, setDeviceLocked] = useState(false);
  const [operationComplete, setOperationComplete] = useState(false);
  const [operationId, setOperationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requiredUnlockText = 'UNLOCK';
  const canProceed = 
    selectedDevice &&
    serialConfirmation === selectedDevice.serial &&
    unlockConfirmation === requiredUnlockText &&
    !isExecuting &&
    backendAvailable &&
    passcode;

  const commands = selectedDevice ? [
    {
      command: `fastboot oem unlock`,
      description: 'Unlock bootloader (destructive)',
      risk: 'destructive' as const,
    },
    {
      command: `fastboot flashing unlock`,
      description: 'Alternative unlock command (if oem unlock fails)',
      risk: 'destructive' as const,
    },
  ] : [];

  const impactedPartitions = selectedDevice ? [
    'userdata',
    'system',
    'boot',
    'recovery',
  ] : [];

  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
    setSerialConfirmation('');
    setUnlockConfirmation('');
    setError(null);
    setOperationComplete(false);
    setLogs([]);
    onDeviceSelect?.(device);
  };

  const handleExecute = async () => {
    if (!selectedDevice || !passcode || !canProceed) return;

    setIsExecuting(true);
    setError(null);
    setDeviceLocked(true);
    setLogs([]);
    setOperationComplete(false);

    // Add initial log
    setLogs([{
      id: '1',
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `[UNLOCK] Starting bootloader unlock for device: ${selectedDevice.serial}`,
      source: 'unlock-chamber',
    }]);

    try {
      const response = await fetch('/api/v1/trapdoor/unlock/bootloader', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Secret-Room-Passcode': passcode,
        },
        body: JSON.stringify({
          deviceSerial: selectedDevice.serial,
          confirmation: unlockConfirmation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const envelope = await response.json();

      // Handle error responses
      if (envelope.ok === false || envelope.error) {
        throw new Error(envelope.error?.message || envelope.error?.code || 'Unlock operation failed');
      }
      
      // Check for success (envelope.ok === true or envelope.success === true)
      if (envelope.ok !== true && envelope.success !== true && !envelope.data) {
        throw new Error('Unlock operation failed - invalid response format');
      }

      // Extract data from envelope or use envelope directly
      const resultData = envelope.data || envelope;

      // Stream logs if available
      if (resultData.logs || envelope.data?.logs) {
        const logData = resultData.logs || envelope.data.logs;
        const streamLogs: LogEntry[] = logData.map((log: any, idx: number) => ({
          id: `log-${idx}`,
          timestamp: log.timestamp || new Date().toISOString(),
          level: log.level || 'info',
          message: log.message || log.text || JSON.stringify(log),
          source: 'unlock-chamber',
        }));
        setLogs(streamLogs);
      } else if (resultData.output || resultData.message) {
        // Add output as log if available
        setLogs(prev => [...prev, {
          id: 'output',
          timestamp: new Date().toISOString(),
          level: 'info',
          message: resultData.output || resultData.message || 'Operation completed',
          source: 'unlock-chamber',
        }]);
      }

      setOperationId(resultData.operationId || envelope.meta?.requestId || envelope.meta?.correlationId || null);
      setOperationComplete(true);
      setDeviceLocked(false);

      // Add success log
      setLogs(prev => [...prev, {
        id: 'success',
        timestamp: new Date().toISOString(),
        level: 'success',
        message: '[UNLOCK] Bootloader unlock completed successfully',
        source: 'unlock-chamber',
      }]);

    } catch (err) {
      console.error('[TrapdoorUnlockChamber] Execution error:', err);
      setError(err instanceof Error ? err.message : 'Operation failed');
      setDeviceLocked(false);
      
      setLogs(prev => [...prev, {
        id: 'error',
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `[UNLOCK] Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        source: 'unlock-chamber',
      }]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className={cn("h-full flex flex-col bg-basement-concrete", className)}>
      {/* Header */}
      <div className="p-4 border-b border-panel bg-basement-concrete">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg border border-state-danger/50 bg-state-danger/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-state-danger" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink-primary font-mono">
              Unlock Chamber
            </h1>
            <p className="text-xs text-ink-muted">
              Bootloader unlock & FRP bypass
            </p>
          </div>
        </div>

        {/* Risk Tier Display */}
        <div className="p-3 rounded-lg border-2 border-state-danger/50 bg-state-danger/10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-state-danger" />
            <span className="text-lg font-bold text-state-danger font-mono uppercase tracking-wider">
              DANGEROUS OPERATION
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-2">
            This will erase all user data and void warranty. Cannot be undone.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Device Selector */}
        <div className="space-y-2">
          <h3 className="text-sm font-mono uppercase tracking-wider text-ink-muted">
            Select Device
          </h3>
          {devices.length === 0 ? (
            <div className="p-4 rounded-lg border border-panel bg-workbench-steel text-center text-ink-muted">
              <p className="text-sm">No devices available</p>
              <p className="text-xs mt-1">Connect a device via USB</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {devices.map((device) => (
                <button
                  key={device.serial}
                  onClick={() => handleDeviceSelect(device)}
                  className={cn(
                    "p-3 rounded-lg border transition-all motion-snap text-left",
                    "flex items-center gap-3",
                    selectedDevice?.serial === device.serial
                      ? "bg-workbench-steel border-spray-cyan glow-cyan"
                      : "bg-basement-concrete border-panel hover:border-spray-cyan/50"
                  )}
                >
                  <DeviceIcon
                    platform={device.platform}
                    className="w-6 h-6"
                    size={24}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono text-ink-primary truncate">
                      {device.serial}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {device.brand} {device.model}
                    </p>
                  </div>
                  {selectedDevice?.serial === device.serial && (
                    <CheckCircle2 className="w-5 h-5 text-spray-cyan shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Command Preview */}
        {selectedDevice && (
          <>
            <TerminalCommandPreview
              commands={commands}
              impactedPartitions={impactedPartitions}
              riskLevel="destructive"
              expectedOutput="... OKAY\n... finished. total time: 2.345s"
            />

            {/* Confirmation Gates */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-ink-muted">
                  Type device serial to confirm: <span className="text-spray-cyan">{selectedDevice.serial}</span>
                </label>
                <input
                  type="text"
                  value={serialConfirmation}
                  onChange={(e) => setSerialConfirmation(e.target.value)}
                  placeholder={selectedDevice.serial}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg bg-workbench-steel border font-mono text-sm",
                    "text-ink-primary placeholder:text-ink-muted",
                    "focus:outline-none transition-all motion-snap",
                    serialConfirmation === selectedDevice.serial
                      ? "border-state-ready focus:border-state-ready"
                      : serialConfirmation.length > 0
                      ? "border-state-danger focus:border-state-danger"
                      : "border-panel focus:border-spray-cyan focus:glow-cyan"
                  )}
                />
                {serialConfirmation.length > 0 && serialConfirmation !== selectedDevice.serial && (
                  <p className="text-xs text-state-danger">Serial must match exactly</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-ink-muted">
                  Type "{requiredUnlockText}" to confirm unlock
                </label>
                <input
                  type="text"
                  value={unlockConfirmation}
                  onChange={(e) => setUnlockConfirmation(e.target.value)}
                  placeholder={requiredUnlockText}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg bg-workbench-steel border font-mono text-sm",
                    "text-ink-primary placeholder:text-ink-muted",
                    "focus:outline-none transition-all motion-snap",
                    unlockConfirmation === requiredUnlockText
                      ? "border-state-ready focus:border-state-ready"
                      : unlockConfirmation.length > 0
                      ? "border-state-danger focus:border-state-danger"
                      : "border-panel focus:border-spray-cyan focus:glow-cyan"
                  )}
                />
                {unlockConfirmation.length > 0 && unlockConfirmation !== requiredUnlockText && (
                  <p className="text-xs text-state-danger">Text must match exactly</p>
                )}
              </div>

              {/* Device Lock Status */}
              {deviceLocked && (
                <div className="p-3 rounded-lg border border-tape-yellow/50 bg-tape-yellow/10">
                  <p className="text-sm font-mono text-tape-yellow">
                    🔒 Device Lock: HELD
                  </p>
                  <p className="text-xs text-ink-muted mt-1">
                    Device is locked for this operation
                  </p>
                </div>
              )}

              {/* Danger Lever */}
              <ToolboxDangerLever
                onConfirm={handleExecute}
                disabled={!canProceed}
                label="HOLD TO UNLOCK BOOTLOADER"
                warning="This will permanently unlock the bootloader and erase all user data. This cannot be undone."
              />

              {/* Error Display */}
              {error && (
                <div className="p-3 rounded-lg border border-state-danger/50 bg-state-danger/10 flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-state-danger shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-state-danger font-mono">{error}</p>
                  </div>
                </div>
              )}

              {/* Success & Archive Link */}
              {operationComplete && operationId && (
                <div className="p-4 rounded-lg border border-state-ready/50 bg-state-ready/10">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-state-ready" />
                    <span className="text-sm font-bold text-state-ready font-mono">
                      Operation Complete
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mb-3">
                    Bootloader unlock completed. Operation ID: {operationId}
                  </p>
                  <a
                    href="#shadow-archive"
                    className="inline-flex items-center gap-2 text-xs text-spray-cyan hover:text-spray-magenta transition-colors motion-snap font-mono"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View in Shadow Archive
                  </a>
                </div>
              )}
            </div>

            {/* Execution Logs */}
            {logs.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-mono uppercase tracking-wider text-ink-muted">
                  Execution Logs
                </h3>
                <div className="h-64 rounded-lg border border-panel overflow-hidden">
                  <TerminalLogStream
                    logs={logs}
                    maxLines={100}
                    autoScroll={true}
                    className="h-full"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
