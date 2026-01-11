/**
 * WorkbenchSystemStatus
 * 
 * System status indicators: backend health, catalog loaded, device locks, active operations.
 * Status strip style - always visible, never intrusive.
 * 
 * NO MOCKS - connects to real state/API only.
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/app-context';
import { useBackendHealth } from '@/lib/backend-health';

interface StatusItem {
  id: string;
  label: string;
  status: 'ready' | 'warning' | 'error' | 'checking';
  message?: string;
}

interface WorkbenchSystemStatusProps {
  showCatalog?: boolean;
  showLocks?: boolean;
  showActiveOps?: boolean;
}

interface CatalogStatus {
  loaded: boolean;
  checking: boolean;
  error?: string;
}

export function WorkbenchSystemStatus({
  showCatalog = true,
  showLocks = true,
  showActiveOps = true,
}: WorkbenchSystemStatusProps) {
  const { backendAvailable } = useApp();
  const backendHealth = useBackendHealth(30000); // Check every 30s
  const [catalogStatus, setCatalogStatus] = useState<CatalogStatus>({
    loaded: false,
    checking: true,
  });
  const [activeLocks, setActiveLocks] = useState<number | null>(null);
  const [activeOps, setActiveOps] = useState<number | null>(null);

  // Check catalog status from API
  useEffect(() => {
    if (!backendAvailable || !showCatalog) {
      // Use setTimeout to avoid setState during render
      const timer = setTimeout(() => setCatalogStatus({ loaded: false, checking: false }), 0);
      return () => clearTimeout(timer);
    }

    let cancelled = false;

    async function checkCatalog() {
      setCatalogStatus(prev => ({ ...prev, checking: true }));
      
      try {
        const response = await fetch('/api/v1/catalog', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (cancelled) return;

        if (!response.ok) {
          setCatalogStatus({
            loaded: false,
            checking: false,
            error: `HTTP ${response.status}`,
          });
          return;
        }

        const envelope = await response.json();
        
        if (cancelled) return;

        if (envelope.ok && envelope.data?.available) {
          setCatalogStatus({ loaded: true, checking: false });
        } else {
          setCatalogStatus({
            loaded: false,
            checking: false,
            error: envelope.error?.message || 'Catalog unavailable',
          });
        }
      } catch (error) {
        if (cancelled) return;
        console.error('[WorkbenchSystemStatus] Catalog check failed:', error);
        setCatalogStatus({
          loaded: false,
          checking: false,
          error: error instanceof Error ? error.message : 'Network error',
        });
      }
    }

    checkCatalog();

    return () => {
      cancelled = true;
    };
  }, [backendAvailable, showCatalog]);

  // Check device locks (if API endpoint exists)
  useEffect(() => {
    if (!backendAvailable || !showLocks) {
      // Use setTimeout to avoid setState during render
      const timer = setTimeout(() => setActiveLocks(null), 0);
      return () => clearTimeout(timer);
    }

    // TODO: Wire up to real locks API endpoint when available
    // For now, show null (unknown state) instead of fake data
    setActiveLocks(null);
  }, [backendAvailable, showLocks]);

  // Check active operations (if API endpoint exists)
  useEffect(() => {
    if (!backendAvailable || !showActiveOps) {
      // Use setTimeout to avoid setState during render
      const timer = setTimeout(() => setActiveOps(null), 0);
      return () => clearTimeout(timer);
    }

    // TODO: Wire up to real operations API endpoint when available
    // For now, show null (unknown state) instead of fake data
    setActiveOps(null);
  }, [backendAvailable, showActiveOps]);

  const statusItems: StatusItem[] = [
    {
      id: 'backend',
      label: 'Backend',
      status: backendHealth.isHealthy ? 'ready' : 'error',
      message: backendHealth.isHealthy ? 'Connected' : 'Offline',
    },
    ...(showCatalog ? [{
      id: 'catalog',
      label: 'Catalog',
      status: catalogStatus.checking
        ? 'checking'
        : catalogStatus.loaded
        ? 'ready'
        : catalogStatus.error
        ? 'error'
        : 'warning',
      message: catalogStatus.checking
        ? 'Checking...'
        : catalogStatus.loaded
        ? 'Loaded'
        : catalogStatus.error || 'Unavailable',
    }] : []),
    ...(showLocks ? [{
      id: 'locks',
      label: 'Locks',
      status: activeLocks === null ? 'checking' : activeLocks > 0 ? 'warning' : 'ready',
      message: activeLocks === null ? 'Unknown' : activeLocks > 0 ? `${activeLocks} active` : 'None',
    }] : []),
    ...(showActiveOps ? [{
      id: 'ops',
      label: 'Operations',
      status: activeOps === null ? 'checking' : activeOps > 0 ? 'warning' : 'ready',
      message: activeOps === null ? 'Unknown' : activeOps > 0 ? `${activeOps} running` : 'Idle',
    }] : []),
  ];

  const getStatusIcon = (status: StatusItem['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle2 className="w-3.5 h-3.5 text-state-ready" />;
      case 'warning':
        return <AlertCircle className="w-3.5 h-3.5 text-state-warning" />;
      case 'error':
        return <XCircle className="w-3.5 h-3.5 text-state-danger" />;
      case 'checking':
        return <Loader2 className="w-3.5 h-3.5 text-ink-muted animate-spin" />;
    }
  };

  return (
    <div className="p-4 rounded-lg bg-workbench-steel border border-panel">
      <h3 className="text-xs font-mono uppercase tracking-wider text-ink-muted mb-3">
        System Status
      </h3>
      
      <div className="space-y-2">
        {statusItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-1.5"
          >
            <div className="flex items-center gap-2">
              {getStatusIcon(item.status)}
              <span className="text-sm text-ink-primary">{item.label}</span>
            </div>
            {item.message && (
              <span className={cn(
                "text-xs font-mono",
                item.status === 'ready' && "text-ink-muted",
                item.status === 'warning' && "text-tape-yellow",
                item.status === 'error' && "text-state-danger",
                item.status === 'checking' && "text-ink-muted"
              )}>
                {item.message}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
