/**
 * WorkbenchSecretRooms
 * 
 * Trapdoor entry gate + room navigation + room workbenches
 */

import React, { useState, useEffect } from 'react';
import { TrapdoorEntryGate } from '../trapdoor/TrapdoorEntryGate';
import { TrapdoorRoomNavigation, type SecretRoomId } from '../trapdoor/TrapdoorRoomNavigation';
import { TrapdoorUnlockChamber } from '../trapdoor/TrapdoorUnlockChamber';
import { TrapdoorShadowArchive } from '../trapdoor/TrapdoorShadowArchive';
import { TrapdoorFlashForge } from '../trapdoor/TrapdoorFlashForge';
import { TrapdoorRootVault } from '../trapdoor/TrapdoorRootVault';
import { TrapdoorBypassLaboratory } from '../trapdoor/TrapdoorBypassLaboratory';
import { TrapdoorWorkflowEngine } from '../trapdoor/TrapdoorWorkflowEngine';
import { WizardFlow } from '../sonic/WizardFlow';
import { GhostDashboard } from '../ghost/GhostDashboard';
import { ChainBreakerDashboard } from '../pandora/ChainBreakerDashboard';
import { RoomTransition } from '../trapdoor/RoomTransition';
import { PhoenixKey } from '../auth/PhoenixKey';
import { useAuthStore } from '@/stores/authStore';

interface Device {
  serial: string;
  brand: string;
  model: string;
  state: string;
  platform?: string;
}

export function WorkbenchSecretRooms() {
  const [passcode, setPasscode] = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<SecretRoomId | null>(null);
  const [previousRoom, setPreviousRoom] = useState<SecretRoomId | null>(null);
  const [targetRoom, setTargetRoom] = useState<SecretRoomId | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [showPhoenixKey, setShowPhoenixKey] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { token, isAuthenticated, checkExpired } = useAuthStore();

  const scanDevices = async () => {
    setDevicesLoading(true);
    try {
      // Try ADB devices first
      const adbResponse = await fetch('/api/v1/adb/devices');
      if (adbResponse.ok) {
        const adbData = await adbResponse.json();
        if (adbData.ok && adbData.data?.devices) {
          const adbDevices: Device[] = adbData.data.devices
            .filter((d: any) => d.serial && d.connected)
            .map((d: any) => ({
              serial: d.serial,
              brand: d.properties?.brand || d.properties?.manufacturer || 'Unknown',
              model: d.properties?.model || 'Unknown',
              state: d.status || 'device',
              platform: 'android'
            }));
          
          if (adbDevices.length > 0) {
            setDevices(adbDevices);
            setDevicesLoading(false);
            return;
          }
        }
      }

      // Fallback to device scan
      const scanResponse = await fetch('/api/devices/scan');
      if (scanResponse.ok) {
        const scanData = await scanResponse.json();
        if (scanData.devices && Array.isArray(scanData.devices)) {
          const scannedDevices: Device[] = scanData.devices
            .filter((d: any) => d.evidence?.serial || d.display_name)
            .map((d: any) => ({
              serial: d.evidence?.serial || d.display_name || d.device_uid,
              brand: d.evidence?.brand || 'Unknown',
              model: d.evidence?.model || 'Unknown',
              state: d.mode || 'unknown',
              platform: d.platform_hint || 'android'
            }));
          setDevices(scannedDevices);
        }
      }
    } catch (error) {
      console.error('[WorkbenchSecretRooms] Device scan error:', error);
    } finally {
      setDevicesLoading(false);
    }
  };

  useEffect(() => {
    if (passcode && activeRoom === 'unlock-chamber') {
      scanDevices();
      // Refresh devices every 10 seconds
      const interval = setInterval(scanDevices, 10000);
      return () => clearInterval(interval);
    }
  }, [passcode, activeRoom]);

  // Check authentication on mount and periodically
  useEffect(() => {
    if (token) {
      const expired = checkExpired();
      if (!expired && isAuthenticated) {
        setPasscode(token);
      } else {
        setShowPhoenixKey(true);
      }
    }
    
    // Check every minute
    const interval = setInterval(() => {
      if (token) {
        const expired = checkExpired();
        if (expired) {
          setPasscode(null);
          setActiveRoom(null);
          setShowPhoenixKey(true);
        }
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [token, isAuthenticated, checkExpired]);

  const handleUnlock = (enteredPasscode: string) => {
    setPasscode(enteredPasscode);
    setShowPhoenixKey(false);
    // Default to Unlock Chamber
    setActiveRoom('unlock-chamber');
  };

  const handleCancel = () => {
    setPasscode(null);
    setActiveRoom(null);
    setDevices([]);
    setShowPhoenixKey(false);
  };

  const handleRoomChange = (roomId: SecretRoomId) => {
    if (roomId !== activeRoom) {
      setPreviousRoom(activeRoom);
      setTargetRoom(roomId);
      setShowTransition(true);
      // Don't set activeRoom yet - wait for transition
    }
  };

  const handleTransitionComplete = () => {
    // Transition complete, now change room
    if (targetRoom) {
      setActiveRoom(targetRoom);
      setPreviousRoom(null);
      setTargetRoom(null);
      setShowTransition(false);
    }
  };

  // Get room theme for transition
  const getRoomTheme = (roomId: SecretRoomId | null): 'sonic' | 'ghost' | 'pandora' | 'default' => {
    if (roomId === 'sonic-codex') return 'sonic';
    if (roomId === 'ghost-codex') return 'ghost';
    if (roomId === 'jailbreak-sanctum') return 'pandora';
    return 'default';
  };

  // Show Phoenix Key if needed
  if (showPhoenixKey) {
    return <PhoenixKey onUnlock={handleUnlock} onCancel={handleCancel} />;
  }

  // Show transition animation
  if (showTransition && targetRoom) {
    const roomNames: Record<SecretRoomId, string> = {
      'unlock-chamber': 'Unlock Chamber',
      'flash-forge': 'Flash Forge',
      'jailbreak-sanctum': 'Jailbreak Sanctum',
      'root-vault': 'Root Vault',
      'bypass-laboratory': 'Bypass Laboratory',
      'workflow-engine': 'Workflow Engine',
      'shadow-archive': 'Shadow Archive',
      'sonic-codex': 'Sonic Codex',
      'ghost-codex': 'Ghost Codex',
    };
    
    return (
      <RoomTransition
        roomName={roomNames[targetRoom] || 'Secret Room'}
        theme={getRoomTheme(targetRoom)}
        onComplete={handleTransitionComplete}
      />
    );
  }

  // Show gate if not unlocked
  if (!passcode || !isAuthenticated) {
    return <TrapdoorEntryGate onUnlock={handleUnlock} onCancel={handleCancel} />;
  }

  // Show rooms interface
  return (
    <div className="h-full flex flex-col lg:flex-row bg-basement-concrete">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 border border-gray-700 rounded-lg text-white hover:bg-gray-800"
        aria-label="Toggle navigation menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Navigation sidebar - hidden on mobile unless menu is open */}
      <div className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:static inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out
        bg-gray-900 border-r border-gray-800
      `}>
        <TrapdoorRoomNavigation
          activeRoom={activeRoom || undefined}
          onSelectRoom={(roomId) => {
            handleRoomChange(roomId);
            setIsMobileMenuOpen(false); // Close mobile menu after selection
          }}
        />
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <div className="flex-1 overflow-hidden w-full lg:w-auto">
        {/* Room 1: Unlock Chamber */}
        {activeRoom === 'unlock-chamber' && (
          <TrapdoorUnlockChamber
            passcode={passcode}
            devices={devices}
          />
        )}
        
        {/* Room 2: Flash Forge */}
        {activeRoom === 'flash-forge' && (
          <TrapdoorFlashForge passcode={passcode} />
        )}
        
        {/* Room 3: Jailbreak Sanctum */}
        {activeRoom === 'jailbreak-sanctum' && (
          <ChainBreakerDashboard />
        )}
        
        {/* Room 4: Root Vault */}
        {activeRoom === 'root-vault' && (
          <TrapdoorRootVault passcode={passcode} devices={devices} />
        )}
        
        {/* Room 5: Bypass Laboratory */}
        {activeRoom === 'bypass-laboratory' && (
          <TrapdoorBypassLaboratory passcode={passcode} />
        )}
        
        {/* Room 6: Workflow Engine */}
        {activeRoom === 'workflow-engine' && (
          <TrapdoorWorkflowEngine passcode={passcode} />
        )}
        
        {/* Room 7: Shadow Archive */}
        {activeRoom === 'shadow-archive' && (
          <TrapdoorShadowArchive passcode={passcode} />
        )}
        
        {/* Room 8: Sonic Codex */}
        {activeRoom === 'sonic-codex' && (
          <WizardFlow />
        )}
        
        {/* Room 9: Ghost Codex */}
        {activeRoom === 'ghost-codex' && (
          <GhostDashboard />
        )}
        
        {/* No room selected */}
        {!activeRoom && (
          <div className="h-full flex items-center justify-center text-ink-muted">
            <div className="text-center space-y-2">
              <p className="text-sm font-mono">Select a room from the navigation</p>
              <p className="text-xs text-ink-muted/50">9 Secret Rooms Available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
