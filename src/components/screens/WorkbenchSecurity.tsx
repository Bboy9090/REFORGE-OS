/**
 * WorkbenchSecurity
 * 
 * FRP/MDM/root/bootloader status
 */

import React from 'react';
import { Shield, Lock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityStatus {
  id: string;
  label: string;
  status: 'locked' | 'unlocked' | 'unknown';
  description: string;
}

export function WorkbenchSecurity() {
  const statuses: SecurityStatus[] = [
    {
      id: 'frp',
      label: 'FRP Lock',
      status: 'unknown',
      description: 'Factory Reset Protection status',
    },
    {
      id: 'mdm',
      label: 'MDM',
      status: 'unknown',
      description: 'Mobile Device Management status',
    },
    {
      id: 'root',
      label: 'Root Access',
      status: 'unknown',
      description: 'Root detection status',
    },
    {
      id: 'bootloader',
      label: 'Bootloader',
      status: 'unknown',
      description: 'Bootloader lock status',
    },
  ];

  const getStatusIcon = (status: SecurityStatus['status']) => {
    switch (status) {
      case 'locked':
        return <Lock className="w-5 h-5 text-state-locked" />;
      case 'unlocked':
        return <CheckCircle2 className="w-5 h-5 text-state-ready" />;
      case 'unknown':
        return <AlertCircle className="w-5 h-5 text-ink-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-primary font-mono mb-2">
          Security
        </h1>
        <p className="text-sm text-ink-muted">
          FRP, MDM, root, and bootloader status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statuses.map((status) => (
          <div
            key={status.id}
            className="p-4 rounded-lg border border-panel bg-workbench-steel"
          >
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(status.status)}
              <h3 className="text-sm font-mono font-bold text-ink-primary">
                {status.label}
              </h3>
            </div>
            <p className="text-xs text-ink-muted mb-3">
              {status.description}
            </p>
            <div className={cn(
              "text-xs font-mono px-2 py-1 rounded inline-block",
              status.status === 'locked' && "bg-state-locked/20 text-state-locked",
              status.status === 'unlocked' && "bg-state-ready/20 text-state-ready",
              status.status === 'unknown' && "bg-ink-muted/20 text-ink-muted"
            )}>
              {status.status.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
