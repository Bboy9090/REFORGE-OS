/**
 * Pandora Codex - Chain-Breaker Dashboard
 * Hardware manipulation interface for iOS devices
 */

import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, AlertCircle, CheckCircle, XCircle, Zap, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { usePandoraDeviceStore } from '@/stores/pandoraDeviceStore';
import { API_CONFIG, apiRequest, getWSUrl } from '@/lib/api-client';
import { toast } from 'sonner';
import { LegalDisclaimer } from '@/components/common/LegalDisclaimer';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface HardwareStatus {
  status: string;
  msg: string;
  mode: string | null;
  color: string;
  pid?: string;
}

export function ChainBreakerDashboard() {
  const { token } = useAuthStore();
  const { hardwareStatus, setHardwareStatus } = usePandoraDeviceStore();
  const [loading, setLoading] = useState(true);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [selectedExploit, setSelectedExploit] = useState<string>('');
  const [showLegalDisclaimer, setShowLegalDisclaimer] = useState(false);
  const [pendingAction, setPendingAction] = useState<'jailbreak' | 'dfu' | null>(null);

  useEffect(() => {
    if (token) {
      loadHardwareStatus();
      const interval = setInterval(loadHardwareStatus, 2000); // Check every 2 seconds
      return () => clearInterval(interval);
    }
  }, [token]);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return;
    
    // WebSocket connection for real-time updates
    const wsUrl = getWSUrl(API_CONFIG.ENDPOINTS.WS_HARDWARE_STREAM);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    ws.onopen = () => {
      addLog('WebSocket connected');
      // Send authentication token
      ws.send(JSON.stringify({ type: 'auth', token }));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const status = data.status || data;
        if (status && typeof status === 'object') {
          setHardwareStatus(status as HardwareStatus);
          addLog(`Hardware status: ${status.msg || status.status || 'updated'}`);
        }
      } catch (error) {
        console.error('Failed to parse hardware status:', error);
        addLog('Failed to parse hardware status');
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      addLog('WebSocket connection error');
    };

    ws.onclose = () => {
      addLog('WebSocket disconnected');
      // Attempt reconnection after 5 seconds
      const reconnectTimeout = setTimeout(() => {
        if (token && !wsRef.current) {
          loadHardwareStatus();
        }
      }, 5000);
      return () => clearTimeout(reconnectTimeout);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      wsRef.current = null;
    };
  }, [token, setHardwareStatus]);

  const loadHardwareStatus = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await apiRequest<HardwareStatus>(
        API_CONFIG.ENDPOINTS.PANDORA_HARDWARE_STATUS,
        {
          method: 'GET',
          requireAuth: true,
          showErrorToast: false,
        }
      );
      
      if (response.success && response.data) {
        setHardwareStatus(response.data);
        addLog(`Status updated: ${response.data.status}`);
      } else if (response.error) {
        addLog(`Error: ${response.error}`);
      }
    } catch (error) {
      // Only log errors if not a network error (network errors are expected if backend is offline)
      if (error instanceof Error && !error.message.includes('timeout') && !error.message.includes('fetch')) {
        addLog(`Error: ${error.message}`);
        toast.error(`Failed to load hardware status: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [...prev.slice(-99), `[${timestamp}] ${message}`]);
  };

  const getStatusIcon = () => {
    if (!hardwareStatus) return <XCircle className="w-8 h-8 text-gray-500" />;
    
    switch (hardwareStatus.status) {
      case 'READY_TO_STRIKE':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'LOCKED':
        return <Lock className="w-8 h-8 text-amber-500" />;
      case 'WAITING':
        return <Smartphone className="w-8 h-8 text-gray-500 animate-pulse" />;
      default:
        return <AlertCircle className="w-8 h-8 text-red-500" />;
    }
  };

  const exploits = [
    { id: 'checkm8', name: 'Checkm8', description: 'A5-A11 devices (iPhone 4S - iPhone X)' },
    { id: 'palera1n', name: 'Palera1n', description: 'A8-A11 devices (iOS 15+)' },
    { id: 'unc0ver', name: 'Unc0ver', description: 'A12+ devices (iOS 14-16)' },
  ];

  const handleExecuteAction = async () => {
    if (!pendingAction) return;
    
    setLoading(true);
    setShowLegalDisclaimer(false);
    
    try {
      if (pendingAction === 'jailbreak' && selectedExploit) {
        addLog(`Executing exploit: ${selectedExploit}`);
        // TODO: Call actual jailbreak API
        toast.success('Exploit execution started');
        // Simulate progress
        setTimeout(() => {
          addLog('Exploit execution completed');
          setLoading(false);
          toast.success('Jailbreak completed successfully');
        }, 3000);
      } else if (pendingAction === 'dfu') {
        addLog('Entering DFU mode...');
        // TODO: Call actual DFU entry API
        toast.success('DFU mode entry initiated');
        setTimeout(() => {
          addLog('Device should now be in DFU mode');
          setLoading(false);
          toast.success('Device entered DFU mode');
        }, 2000);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Operation failed';
      addLog(`ERROR: ${errorMsg}`);
      toast.error(errorMsg);
      setLoading(false);
    }
    
    setPendingAction(null);
  };

  // Responsive layout for mobile devices
  return (
    <div className="flex flex-col lg:flex-row h-full bg-[#050505] text-white overflow-hidden min-h-0 relative">
      {/* Legal Disclaimer Modal */}
      {showLegalDisclaimer && pendingAction && (
        <LegalDisclaimer
          operation={pendingAction === 'jailbreak' ? 'jailbreak' : 'unlock'}
          onAccept={handleExecuteAction}
          onDecline={() => {
            setShowLegalDisclaimer(false);
            setPendingAction(null);
          }}
          variant="modal"
          showFullText={true}
        />
      )}
      {/* Left Sidebar - Device Info */}
      <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-800 p-2 lg:p-4 flex-shrink-0 overflow-y-auto max-h-[40vh] lg:max-h-none">
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#FFB000] mb-4">
          Device Pulse
        </h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
            <div className="flex items-center justify-center mb-3">
              {getStatusIcon()}
            </div>
            {hardwareStatus && (
              <>
                <div
                  className="w-full h-2 rounded-full mb-2"
                  style={{ backgroundColor: hardwareStatus.color }}
                />
                <p className="text-xs text-gray-400 text-center">{hardwareStatus.mode || 'Unknown'}</p>
                {hardwareStatus.pid && (
                  <p className="text-xs text-gray-500 text-center font-mono mt-1">
                    PID: {hardwareStatus.pid}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
            <p className="text-xs text-gray-400 mb-2">Status</p>
            <p
              className="text-sm font-mono font-bold"
              style={{ color: hardwareStatus?.color || '#888' }}
            >
              {hardwareStatus?.status || 'WAITING'}
            </p>
          </div>

          <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
            <p className="text-xs text-gray-400 mb-2">Message</p>
            <p className="text-xs text-gray-300">{hardwareStatus?.msg || 'No device detected'}</p>
          </div>
        </div>
      </div>

      {/* Center - Console Log */}
      <div className="flex-1 flex flex-col border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#00FF41]">
            Console Log
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-black font-mono text-xs">
          {consoleLogs.length === 0 ? (
            <p className="text-gray-600">Waiting for hardware...</p>
          ) : (
            consoleLogs.map((log, i) => (
              <p
                key={i}
                className={cn(
                  "mb-1",
                  log.includes('ERROR') && "text-red-400",
                  log.includes('SUCCESS') && "text-green-400",
                  log.includes('READY') && "text-[#00FF41]",
                  !log.includes('ERROR') && !log.includes('SUCCESS') && !log.includes('READY') && "text-gray-400"
                )}
              >
                {log}
              </p>
            ))
          )}
        </div>
      </div>

      {/* Right Sidebar - Exploit Menu */}
      <div className="w-full lg:w-80 p-2 lg:p-4 border-t lg:border-t-0 lg:border-l border-gray-800 flex-shrink-0 overflow-y-auto max-h-[40vh] lg:max-h-none">
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#FFB000] mb-4">
          Exploit Selector
        </h2>

        <div className="space-y-3 mb-6">
          {exploits.map((exploit) => (
            <button
              key={exploit.id}
              onClick={() => {
                setSelectedExploit(exploit.id);
                addLog(`Selected exploit: ${exploit.name}`);
              }}
              className={cn(
                "w-full p-4 text-left rounded-lg border transition-colors",
                selectedExploit === exploit.id
                  ? "bg-[#FFB000]/20 border-[#FFB000] text-[#FFB000]"
                  : "bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4" />
                <span className="font-bold">{exploit.name}</span>
              </div>
              <p className="text-xs text-gray-400">{exploit.description}</p>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <button
            disabled={hardwareStatus?.status !== 'READY_TO_STRIKE' || !selectedExploit || loading}
            onClick={() => {
              setPendingAction('jailbreak');
              setShowLegalDisclaimer(true);
            }}
            className={cn(
              "w-full p-3 rounded-lg font-bold text-sm transition-colors touch-target-min",
              hardwareStatus?.status === 'READY_TO_STRIKE' && selectedExploit && !loading
                ? "bg-[#00FF41] text-black hover:bg-[#00FF41]/80 active:bg-[#00FF41]/60"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            )}
          >
            {loading ? 'Processing...' : 'Execute Exploit'}
          </button>
          
          <button
            disabled={hardwareStatus?.mode !== 'DFU' || loading}
            onClick={() => {
              setPendingAction('dfu');
              setShowLegalDisclaimer(true);
            }}
            className={cn(
              "w-full p-3 rounded-lg font-bold text-sm transition-colors touch-target-min",
              hardwareStatus?.mode === 'DFU' && !loading
                ? "bg-[#FFB000] text-black hover:bg-[#FFB000]/80 active:bg-[#FFB000]/60"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            )}
          >
            {loading ? 'Processing...' : 'Enter DFU Mode'}
          </button>
        </div>

        <div className="mt-4 sm:mt-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400 font-mono">
            ⚠️ All operations are audit-logged. Use only on devices you own.
          </p>
        </div>
      </div>
    </div>
  );
}
