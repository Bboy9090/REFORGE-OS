/**
 * Ghost Codex - Canary Alert Dashboard
 * Display all triggered canary token alerts
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Clock, Trash2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useGhostAlertStore } from '@/stores/ghostAlertStore';
import { API_CONFIG, apiRequest } from '@/lib/api-client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface CanaryAlert {
  token: string;
  ip: string;
  device_info: string;
  time: string;
  status: string;
}

export function CanaryDashboard() {
  const { token } = useAuthStore();
  const { alerts, setAlerts } = useGhostAlertStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadAlerts();
    }
  }, [token]);

  const loadAlerts = async () => {
    if (!token) {
      setLoading(false);
      setAlerts([]);
      return;
    }
    
    setLoading(true);
    try {
      const response = await apiRequest<{ alerts: CanaryAlert[] }>(
        API_CONFIG.ENDPOINTS.GHOST_CANARY_ALERTS,
        {
          method: 'GET',
          requireAuth: true,
          showErrorToast: false,
        }
      );
      
      if (response.success && response.data) {
        setAlerts(response.data.alerts || []);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load alerts';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleString();
    } catch {
      return timeString;
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white p-3 sm:p-6 overflow-y-auto">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-amber-500">Canary Alerts</h2>
          <p className="text-sm sm:text-base text-gray-400">Tripwire triggers and access attempts</p>
        </div>
        <button
          onClick={loadAlerts}
          disabled={loading || !token}
          className="px-3 sm:px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 touch-target-min transition-colors"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <LoadingSpinner size="lg" text="Loading alerts..." />
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p>No alerts yet. All tokens are safe.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <div>
                    <h3 className="font-bold text-red-400">COMPROMISED</h3>
                    <p className="text-sm text-gray-400">Token: {alert.token}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-mono">
                  {alert.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span>IP Address</span>
                  </div>
                  <p className="font-mono text-white">{alert.ip}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span>Time</span>
                  </div>
                  <p className="text-white">{formatTime(alert.time)}</p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-red-500/20">
                <div className="text-sm">
                  <span className="text-gray-400">Device Info: </span>
                  <span className="text-white font-mono text-xs">{alert.device_info}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
