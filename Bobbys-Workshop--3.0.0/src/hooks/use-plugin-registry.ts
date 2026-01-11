import { useEffect, useState, useCallback } from 'react';
import type { RegistryPlugin, RegistrySyncStatus, PluginUpdate } from '@/types/plugin-registry';
import pluginRegistry from '@/lib/plugin-registry-api';

export function usePluginRegistry() {
  const [syncStatus, setSyncStatus] = useState<RegistrySyncStatus>(pluginRegistry.getSyncStatus());
  const [isLoading, setIsLoading] = useState(false);

  const sync = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = await pluginRegistry.syncWithRegistry();
      setSyncStatus(status);
      return status;
    } catch (error) {
      console.error('[usePluginRegistry] Sync error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchManifest = useCallback(async () => {
    setIsLoading(true);
    try {
      return await pluginRegistry.fetchManifest();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPlugin = useCallback(async (pluginId: string) => {
    setIsLoading(true);
    try {
      return await pluginRegistry.fetchPluginDetails(pluginId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchPlugins = useCallback(async (
    query: string,
    filters?: { category?: string; platform?: string; certified?: boolean }
  ) => {
    setIsLoading(true);
    try {
      return await pluginRegistry.searchPlugins(query, filters);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkUpdates = useCallback(async (installedPlugins: Array<{ id: string; version: string }>) => {
    setIsLoading(true);
    try {
      return await pluginRegistry.checkForUpdates(installedPlugins);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(pluginRegistry.getSyncStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    syncStatus,
    isLoading,
    sync,
    fetchManifest,
    fetchPlugin,
    searchPlugins,
    checkUpdates,
  };
}

export function usePluginDownload(pluginId: string) {
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(async () => {
    setIsDownloading(true);
    setError(null);
    setProgress(0);

    try {
      const blob = await pluginRegistry.downloadPlugin(pluginId, setProgress);
      return blob;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Download failed';
      setError(message);
      throw err;
    } finally {
      setIsDownloading(false);
    }
  }, [pluginId]);

  return {
    progress,
    isDownloading,
    error,
    download,
  };
}

export function usePluginUpdates(installedPlugins: Array<{ id: string; version: string }>) {
  const [updates, setUpdates] = useState<PluginUpdate[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  const checkForUpdates = useCallback(async () => {
    setIsChecking(true);
    try {
      const availableUpdates = await pluginRegistry.checkForUpdates(installedPlugins);
      setUpdates(availableUpdates);
      setLastCheck(new Date().toISOString());
      return availableUpdates;
    } catch (error) {
      console.error('[usePluginUpdates] Check error:', error);
      throw error;
    } finally {
      setIsChecking(false);
    }
  }, [installedPlugins]);

  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  return {
    updates,
    isChecking,
    lastCheck,
    checkForUpdates,
  };
}
