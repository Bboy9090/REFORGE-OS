/**
 * WorkbenchQuickActions
 * 
 * Quick action buttons for common operations.
 * Styled like physical switches/buttons on the workbench.
 */

import React from 'react';
import { Smartphone, Flashlight, Search, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger' | 'warning';
}

interface WorkbenchQuickActionsProps {
  actions?: QuickAction[];
  onScanDevices?: () => void;
  onFlashDevice?: () => void;
  onSearchFirmware?: () => void;
  onRefresh?: () => void;
}

const DEFAULT_ACTIONS: QuickAction[] = [];

export function WorkbenchQuickActions({
  actions = DEFAULT_ACTIONS,
  onScanDevices,
  onFlashDevice,
  onSearchFirmware,
  onRefresh,
}: WorkbenchQuickActionsProps) {
  const quickActions: QuickAction[] = actions.length > 0 ? actions : [
    {
      id: 'scan',
      label: 'Scan Devices',
      icon: <Smartphone className="w-4 h-4" />,
      onClick: () => onScanDevices?.(),
    },
    {
      id: 'flash',
      label: 'Flash Device',
      icon: <Flashlight className="w-4 h-4" />,
      onClick: () => onFlashDevice?.(),
      variant: 'warning',
    },
    {
      id: 'search',
      label: 'Search Firmware',
      icon: <Search className="w-4 h-4" />,
      onClick: () => onSearchFirmware?.(),
    },
    {
      id: 'refresh',
      label: 'Refresh',
      icon: <RefreshCw className="w-4 h-4" />,
      onClick: () => onRefresh?.(),
    },
  ];

  return (
    <div className="p-4 rounded-lg bg-workbench-steel border border-panel">
      <h3 className="text-xs font-mono uppercase tracking-wider text-ink-muted mb-3">
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            disabled={action.disabled}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md border transition-all motion-snap",
              "bg-basement-concrete border-panel",
              "hover:border-spray-cyan hover:glow-cyan",
              "active:scale-[0.98]",
              action.disabled && "opacity-50 cursor-not-allowed",
              action.variant === 'danger' && "border-state-danger/30 hover:border-state-danger hover:glow-danger",
              action.variant === 'warning' && "border-tape-yellow/30 hover:border-tape-yellow"
            )}
          >
            <span className={cn(
              "text-ink-muted",
              action.variant === 'danger' && "text-state-danger",
              action.variant === 'warning' && "text-tape-yellow"
            )}>
              {action.icon}
            </span>
            <span className="text-xs font-medium text-ink-primary">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
