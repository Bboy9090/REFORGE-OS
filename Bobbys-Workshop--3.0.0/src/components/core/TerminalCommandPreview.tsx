/**
 * TerminalCommandPreview
 * 
 * Displays a preview of commands that will be executed, with risk indicators.
 * Used before destructive operations to show exactly what will run.
 */

import React from 'react';
import { AlertTriangle, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TerminalCommandPreviewProps {
  commands: string[];
  impactedPartitions?: string[];
  riskLevel?: 'low' | 'medium' | 'high' | 'destructive';
  expectedOutput?: string;
  className?: string;
}

export function TerminalCommandPreview({
  commands,
  impactedPartitions = [],
  riskLevel = 'medium',
  expectedOutput,
  className,
}: TerminalCommandPreviewProps) {
  const getRiskColor = () => {
    switch (riskLevel) {
      case 'destructive':
        return 'border-state-danger text-state-danger';
      case 'high':
        return 'border-tape-yellow text-tape-yellow';
      case 'medium':
        return 'border-ink-muted text-ink-muted';
      default:
        return 'border-state-ready text-state-ready';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <Terminal className="w-4 h-4 text-ink-muted" />
        <h3 className="text-xs font-mono uppercase tracking-wider text-ink-muted">
          Command Preview
        </h3>
        {riskLevel === 'destructive' && (
          <AlertTriangle className="w-4 h-4 text-state-danger" />
        )}
      </div>

      <div
        className={cn(
          'p-4 rounded-lg border font-mono text-sm',
          'bg-drawer-hidden',
          getRiskColor()
        )}
      >
        <div className="space-y-1">
          {commands.map((cmd, index) => (
            <div key={index} className="text-spray-cyan">
              <span className="text-ink-muted">$ </span>
              {cmd}
            </div>
          ))}
        </div>

        {impactedPartitions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-panel">
            <div className="text-xs text-ink-muted mb-1">Impacted Partitions:</div>
            <div className="flex flex-wrap gap-2">
              {impactedPartitions.map((partition, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-workbench-steel border border-panel rounded text-xs text-ink-primary"
                >
                  {partition}
                </span>
              ))}
            </div>
          </div>
        )}

        {expectedOutput && (
          <div className="mt-3 pt-3 border-t border-panel">
            <div className="text-xs text-ink-muted mb-1">Expected Output:</div>
            <div className="text-spray-cyan whitespace-pre-wrap text-xs">
              {expectedOutput}
            </div>
          </div>
        )}
      </div>

      {riskLevel === 'destructive' && (
        <div className="p-3 bg-state-danger/10 border border-state-danger/30 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-state-danger flex-shrink-0 mt-0.5" />
            <p className="text-xs text-state-danger">
              <strong>DESTRUCTIVE OPERATION:</strong> These commands will permanently modify your device.
              Ensure all selections are correct before proceeding.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
