/**
 * TrapdoorEntryGate
 * 
 * The ritual entry point to Secret Rooms.
 * Requires passcode, system checks, and acceptance.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Lock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { ToolboxDangerLever } from '../toolbox/ToolboxDangerLever';
import { cn } from '@/lib/utils';
import { checkBackendHealth } from '@/lib/backend-health';

interface SystemCheck {
  id: string;
  label: string;
  status: 'checking' | 'ready' | 'failed';
}

interface TrapdoorEntryGateProps {
  onUnlock: (passcode: string) => void;
  onCancel: () => void;
}

export function TrapdoorEntryGate({ onUnlock, onCancel }: TrapdoorEntryGateProps) {
  const [passcode, setPasscode] = useState('');
  const [acceptanceText, setAcceptanceText] = useState('');
  const [systemChecks, setSystemChecks] = useState<SystemCheck[]>([
    { id: 'backend', label: 'Backend Ready', status: 'checking' },
    { id: 'catalog', label: 'Catalog Loaded', status: 'checking' },
    { id: 'locks', label: 'Lock Manager Active', status: 'checking' },
    { id: 'audit', label: 'Audit Logger Active', status: 'checking' },
  ]);
  const [showRules, setShowRules] = useState(false);

  const requiredAcceptance = 'I ACCEPT THE RISKS';

  useEffect(() => {
    // Check backend health
    checkBackendHealth().then((health) => {
      setSystemChecks(prev => prev.map(check => 
        check.id === 'backend' 
          ? { ...check, status: health.isHealthy ? 'ready' : 'failed' }
          : check
      ));
    });

    // Simulate other checks (in real implementation, these would be API calls)
    setTimeout(() => {
      setSystemChecks(prev => prev.map(check => 
        check.id !== 'backend' 
          ? { ...check, status: 'ready' }
          : check
      ));
    }, 500);
  }, []);

  // Use useMemo to compute allChecksPassed instead of setState in effect
  const allChecksPassed = useMemo(() => {
    return systemChecks.every(check => check.status === 'ready');
  }, [systemChecks]);

  const handleConfirm = () => {
    if (passcode && acceptanceText === requiredAcceptance && allChecksPassed) {
      onUnlock(passcode);
    }
  };

  const canProceed = passcode.length > 0 && 
                     acceptanceText === requiredAcceptance && 
                     allChecksPassed;

  return (
    <div className="min-h-screen bg-drawer-hidden flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-spray-magenta/30 bg-spray-magenta/10 mb-4">
            <Lock className="w-8 h-8 text-spray-magenta" />
          </div>
          <h1 className="text-2xl font-bold text-ink-primary">Secret Rooms</h1>
          <p className="text-sm text-ink-muted">Ultra-secure device operations</p>
        </div>

        {/* System Checks */}
        <div className="space-y-2 p-4 rounded-lg bg-workbench-steel border border-panel">
          <h3 className="text-xs font-mono uppercase tracking-wider text-ink-muted mb-3">
            System Status
          </h3>
          {systemChecks.map((check) => (
            <div key={check.id} className="flex items-center justify-between">
              <span className="text-sm text-ink-primary">{check.label}</span>
              <div className="flex items-center gap-2">
                {check.status === 'checking' && (
                  <div className="w-4 h-4 border-2 border-spray-cyan border-t-transparent rounded-full animate-spin" />
                )}
                {check.status === 'ready' && (
                  <CheckCircle2 className="w-4 h-4 text-state-ready" />
                )}
                {check.status === 'failed' && (
                  <XCircle className="w-4 h-4 text-state-danger" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Rules Drawer */}
        <div className="space-y-2">
          <button
            onClick={() => setShowRules(!showRules)}
            className="flex items-center justify-between w-full p-3 rounded-lg bg-workbench-steel border border-panel hover:border-accent transition-colors motion-snap"
          >
            <span className="text-sm font-mono text-ink-primary">Rules & Warnings</span>
            <AlertTriangle className={cn(
              "w-4 h-4 transition-transform motion-snap",
              showRules && "rotate-180"
            )} />
          </button>
          
          {showRules && (
            <div className="p-4 rounded-lg bg-workbench-steel border border-tape-yellow/30 space-y-3 text-sm text-ink-primary">
              <p className="font-bold text-tape-yellow">⚠️ READ THIS</p>
              <ul className="space-y-2 list-disc list-inside text-ink-muted">
                <li>All operations are for owner devices only</li>
                <li>Destructive operations cannot be undone</li>
                <li>Every action is audit-logged</li>
                <li>Device locks prevent concurrent operations</li>
                <li>Use responsibly and in compliance with laws</li>
              </ul>
            </div>
          )}
        </div>

        {/* Passcode Input */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-ink-muted">
            Secret Room Passcode
          </label>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter passcode"
            className="w-full px-4 py-3 rounded-lg bg-workbench-steel border border-panel text-ink-primary font-mono placeholder:text-ink-muted focus:outline-none focus:border-spray-cyan focus:glow-cyan transition-all motion-snap"
          />
        </div>

        {/* Acceptance Text */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-ink-muted">
            Type: "{requiredAcceptance}"
          </label>
          <input
            type="text"
            value={acceptanceText}
            onChange={(e) => setAcceptanceText(e.target.value)}
            placeholder={requiredAcceptance}
            className={cn(
              "w-full px-4 py-3 rounded-lg bg-workbench-steel border rounded-lg transition-all motion-snap",
              "text-ink-primary font-mono placeholder:text-ink-muted",
              "focus:outline-none focus:border-spray-cyan focus:glow-cyan",
              acceptanceText === requiredAcceptance 
                ? "border-state-ready" 
                : acceptanceText.length > 0 
                  ? "border-state-danger" 
                  : "border-panel"
            )}
          />
          {acceptanceText.length > 0 && acceptanceText !== requiredAcceptance && (
            <p className="text-xs text-state-danger">Text must match exactly</p>
          )}
        </div>

        {/* Danger Lever */}
        <ToolboxDangerLever
          onConfirm={handleConfirm}
          disabled={!canProceed}
          label="HOLD TO ENTER SECRET ROOMS"
          warning="This grants access to destructive operations. Proceed only if you understand the risks."
        />

        {/* Cancel */}
        <button
          onClick={onCancel}
          className="w-full py-2 text-sm text-ink-muted hover:text-ink-primary transition-colors motion-snap"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

