/**
 * TrapdoorRoomNavigation
 * 
 * Door plaques list for Secret Rooms navigation.
 * Left sidebar style - shows all rooms, highlights active.
 */

import React from 'react';
import { Lock, Flashlight, Smartphone, Shield, Wrench, Zap, Code, Archive, Headphones, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SecretRoomId =
  | 'unlock-chamber'
  | 'flash-forge'
  | 'jailbreak-sanctum'
  | 'root-vault'
  | 'bypass-laboratory'
  | 'workflow-engine'
  | 'shadow-archive'
  | 'sonic-codex'
  | 'ghost-codex';

interface SecretRoom {
  id: SecretRoomId;
  label: string;
  icon: React.ReactNode;
  description?: string;
  locked?: boolean;
  danger?: boolean;
}

interface TrapdoorRoomNavigationProps {
  activeRoom?: SecretRoomId;
  onSelectRoom: (roomId: SecretRoomId) => void;
}

const SECRET_ROOMS: SecretRoom[] = [
  {
    id: 'unlock-chamber',
    label: 'Unlock Chamber',
    icon: <Lock className="w-5 h-5" />,
    description: 'Bootloader unlock, FRP bypass',
    danger: true,
  },
  {
    id: 'flash-forge',
    label: 'Flash Forge',
    icon: <Flashlight className="w-5 h-5" />,
    description: 'Advanced flashing operations',
    danger: true,
  },
  {
    id: 'jailbreak-sanctum',
    label: 'Jailbreak Sanctum',
    icon: <Smartphone className="w-5 h-5" />,
    description: 'iOS jailbreak & manipulation',
    danger: true,
  },
  {
    id: 'root-vault',
    label: 'Root Vault',
    icon: <Shield className="w-5 h-5" />,
    description: 'Root management & tools',
    danger: true,
  },
  {
    id: 'bypass-laboratory',
    label: 'Bypass Laboratory',
    icon: <Wrench className="w-5 h-5" />,
    description: 'Security bypasses & unlocks',
    danger: true,
  },
  {
    id: 'workflow-engine',
    label: 'Workflow Engine',
    icon: <Zap className="w-5 h-5" />,
    description: 'Advanced automation',
    danger: false,
  },
  {
    id: 'shadow-archive',
    label: 'Shadow Archive',
    icon: <Archive className="w-5 h-5" />,
    description: 'Audit logs & history',
    danger: false,
  },
  {
    id: 'sonic-codex',
    label: 'Sonic Codex',
    icon: <Headphones className="w-5 h-5" />,
    description: 'Audio forensic intelligence',
    danger: false,
  },
  {
    id: 'ghost-codex',
    label: 'Ghost Codex',
    icon: <EyeOff className="w-5 h-5" />,
    description: 'Stealth & identity protection',
    danger: false,
  },
];

export function TrapdoorRoomNavigation({
  activeRoom,
  onSelectRoom,
}: TrapdoorRoomNavigationProps) {
  return (
    <div className="w-64 h-full border-r border-panel bg-basement-concrete flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-panel">
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-ink-primary">
          Secret Rooms
        </h2>
        <p className="text-xs text-ink-muted mt-1">
          Ultra-secure operations
        </p>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {SECRET_ROOMS.map((room) => {
          const isActive = activeRoom === room.id;

          return (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all motion-snap",
                "flex items-start gap-3",
                isActive
                  ? "bg-workbench-steel border-spray-magenta/50 glow-magenta"
                  : "bg-basement-concrete/50 border-panel hover:border-spray-magenta/30 hover:bg-workbench-steel/50",
                room.danger && !isActive && "opacity-80"
              )}
            >
              <span
                className={cn(
                  "shrink-0 mt-0.5",
                  isActive ? "text-spray-magenta" : "text-ink-muted"
                )}
              >
                {room.icon}
              </span>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={cn(
                    "text-sm font-medium",
                    isActive ? "text-ink-primary" : "text-ink-muted"
                  )}>
                    {room.label}
                  </span>
                  {room.danger && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-state-danger/20 text-state-danger border border-state-danger/30 font-mono">
                      DANGER
                    </span>
                  )}
                </div>
                
                {room.description && (
                  <p className="text-xs text-ink-muted/70">
                    {room.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Warning */}
      <div className="p-4 border-t border-panel">
        <div className="p-2 rounded border border-state-danger/30 bg-state-danger/10">
          <p className="text-xs text-state-danger font-mono">
            ⚠️ All operations are audit-logged
          </p>
        </div>
      </div>
    </div>
  );
}
