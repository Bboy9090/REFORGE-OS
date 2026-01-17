import { useState, useCallback } from 'react';
import { dependencyResolver, type DependencyResolution, type InstallProgress } from '@/lib/plugin-dependency-resolver';
import type { PluginManifest } from '@/types/plugin-sdk';

export interface DependencyStatus {
  isResolving: boolean;
  resolution: DependencyResolution | null;
  error: string | null;
}

export interface InstallStatus {
  isInstalling: boolean;
  progress: InstallProgress | null;
  success: boolean;
  installed: string[];
  errors: string[];
}

export function usePluginDependencies() {
  const [dependencyStatus, setDependencyStatus] = useState<DependencyStatus>({
    isResolving: false,
    resolution: null,
    error: null,
  });

  const [installStatus, setInstallStatus] = useState<InstallStatus>({
    isInstalling: false,
    progress: null,
    success: false,
    installed: [],
    errors: [],
  });

  const resolveDependencies = useCallback(async (pluginId: string, version?: string) => {
    setDependencyStatus({
      isResolving: true,
      resolution: null,
      error: null,
    });

    try {
      const resolution = await dependencyResolver.resolveDependencies(pluginId, version);
      
      setDependencyStatus({
        isResolving: false,
        resolution,
        error: null,
      });

      return resolution;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to resolve dependencies';
      
      setDependencyStatus({
        isResolving: false,
        resolution: null,
        error: errorMsg,
      });

      throw error;
    }
  }, []);

  const installWithDependencies = useCallback(async (pluginId: string, version?: string) => {
    setInstallStatus({
      isInstalling: true,
      progress: null,
      success: false,
      installed: [],
      errors: [],
    });

    try {
      const result = await dependencyResolver.installWithDependencies(
        pluginId,
        version,
        (progress) => {
          setInstallStatus(prev => ({
            ...prev,
            progress,
          }));
        }
      );

      setInstallStatus({
        isInstalling: false,
        progress: null,
        success: result.success,
        installed: result.installed,
        errors: result.errors,
      });

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Installation failed';
      
      setInstallStatus({
        isInstalling: false,
        progress: null,
        success: false,
        installed: [],
        errors: [errorMsg],
      });

      throw error;
    }
  }, []);

  const updateInstalledPlugins = useCallback((plugins: Array<{ id: string; version: string; manifest: PluginManifest }>) => {
    dependencyResolver.setInstalledPlugins(plugins);
  }, []);

  const reset = useCallback(() => {
    setDependencyStatus({
      isResolving: false,
      resolution: null,
      error: null,
    });
    
    setInstallStatus({
      isInstalling: false,
      progress: null,
      success: false,
      installed: [],
      errors: [],
    });
  }, []);

  return {
    dependencyStatus,
    installStatus,
    resolveDependencies,
    installWithDependencies,
    updateInstalledPlugins,
    reset,
  };
}
