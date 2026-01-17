// Plugin Registry API - Client for Bobby's World plugin registry
// Handles plugin discovery, download, updates, and synchronization

import type { 
  RegistryPlugin, 
  RegistrySyncStatus, 
  RegistryManifest, 
  PluginUpdate,
  RegistryConfig 
} from '@/types/plugin-registry';

// Resolve API URL from environment for production configurability
const REGISTRY_API_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_REGISTRY_API_URL)
  ? import.meta.env.VITE_REGISTRY_API_URL
  : 'http://localhost:3001/api/plugins';

const DEFAULT_CONFIG: RegistryConfig = {
  apiUrl: REGISTRY_API_URL,
  syncInterval: 3600000, // 1 hour
  autoSync: true,
  allowUncertified: false,
  cacheExpiry: 300000 // 5 minutes
};

interface PluginRegistryAPI {
  config: RegistryConfig;
  getSyncStatus(): RegistrySyncStatus;
  syncWithRegistry(): Promise<RegistrySyncStatus>;
  fetchManifest(): Promise<RegistryManifest>;
  fetchPluginDetails(pluginId: string): Promise<RegistryPlugin | null>;
  searchPlugins(query: string, filters?: { category?: string; platform?: string; certified?: boolean }): Promise<RegistryPlugin[]>;
  checkForUpdates(installedPlugins: Array<{ id: string; version: string }>): Promise<PluginUpdate[]>;
  downloadPlugin(pluginId: string, onProgress?: (progress: number) => void): Promise<Blob>;
  verifyPluginSignature(pluginId: string, signatureHash: string): Promise<boolean>;
  getDependencies(pluginId: string): Promise<RegistryPlugin[]>;
}

// In-memory cache for plugin data
const pluginCache: Map<string, { data: RegistryPlugin; timestamp: number }> = new Map();
let manifestCache: { data: RegistryManifest | null; timestamp: number } = { data: null, timestamp: 0 };
let currentSyncStatus: RegistrySyncStatus = {
  lastSync: null,
  status: 'idle',
  pluginsUpdated: 0,
  pluginsAdded: 0,
  pluginsRemoved: 0
};

// No mock plugins in production paths; require real registry backend

const pluginRegistry: PluginRegistryAPI = {
  config: { ...DEFAULT_CONFIG },

  getSyncStatus(): RegistrySyncStatus {
    return { ...currentSyncStatus };
  },

  async syncWithRegistry(): Promise<RegistrySyncStatus> {
    currentSyncStatus = { ...currentSyncStatus, status: 'syncing' };

    try {
      // In production, this would fetch from the actual registry API
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

      const manifest = await this.fetchManifest();
      
      currentSyncStatus = {
        lastSync: new Date().toISOString(),
        status: 'success',
        pluginsUpdated: 0,
        pluginsAdded: manifest.plugins.length,
        pluginsRemoved: 0
      };

      return currentSyncStatus;
    } catch (error) {
      currentSyncStatus = {
        ...currentSyncStatus,
        status: 'error',
        error: error instanceof Error ? error.message : 'Sync failed'
      };
      throw error;
    }
  },

  async fetchManifest(): Promise<RegistryManifest> {
    const now = Date.now();
    
    // Return cached manifest if still valid
    if (manifestCache.data && (now - manifestCache.timestamp) < this.config.cacheExpiry) {
      return manifestCache.data;
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/manifest`);
      if (!response.ok) {
        throw new Error('Plugin registry manifest unavailable');
      }
      const data = await response.json();
      manifestCache = { data, timestamp: now };
      return data;
    } catch (error) {
      console.error('[PluginRegistry] Failed to fetch manifest:', error);
      throw error;
    }
  },

  async fetchPluginDetails(pluginId: string): Promise<RegistryPlugin | null> {
    const now = Date.now();
    const cached = pluginCache.get(pluginId);
    
    if (cached && (now - cached.timestamp) < this.config.cacheExpiry) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/plugins/${pluginId}`);
      if (!response.ok) {
        throw new Error('Plugin registry unavailable');
      }
      const data = await response.json();
      if (data) {
        pluginCache.set(pluginId, { data, timestamp: now });
      }
      return data || null;
    } catch (error) {
      console.error(`[PluginRegistry] Failed to fetch plugin ${pluginId}:`, error);
      throw error;
    }
  },

  async searchPlugins(
    query: string, 
    filters?: { category?: string; platform?: string; certified?: boolean }
  ): Promise<RegistryPlugin[]> {
    const manifest = await this.fetchManifest();
    
    let results = manifest.plugins;

    // Text search
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.id.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply filters
    if (filters) {
      if (filters.category) {
        results = results.filter(p => p.category === filters.category);
      }
      if (filters.platform) {
        results = results.filter(p => 
          p.platform === filters.platform || p.platform === 'cross-platform'
        );
      }
      if (filters.certified !== undefined) {
        results = results.filter(p => p.certified === filters.certified);
      }
    }

    // Filter uncertified if not allowed
    if (!this.config.allowUncertified) {
      results = results.filter(p => p.certified);
    }

    return results;
  },

  async checkForUpdates(
    installedPlugins: Array<{ id: string; version: string }>
  ): Promise<PluginUpdate[]> {
    const updates: PluginUpdate[] = [];
    const manifest = await this.fetchManifest();

    for (const installed of installedPlugins) {
      const registryPlugin = manifest.plugins.find(p => p.id === installed.id);
      
      if (registryPlugin && registryPlugin.version !== installed.version) {
        // Simple version comparison - in production use semver
        const isNewer = registryPlugin.version > installed.version;
        
        if (isNewer) {
          updates.push({
            pluginId: installed.id,
            currentVersion: installed.version,
            latestVersion: registryPlugin.version,
            releaseNotes: registryPlugin.changelog || 'No release notes available',
            critical: false
          });
        }
      }
    }

    return updates;
  },

  async downloadPlugin(
    pluginId: string, 
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const plugin = await this.fetchPluginDetails(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }
    // Enforce real download; no mock content
    const response = await fetch(plugin.downloadUrl);
    if (!response.ok) {
      throw new Error('Plugin download failed');
    }
    // Optional progress reporting could be implemented via streams; omitted here
    return await response.blob();
  },

  async verifyPluginSignature(pluginId: string, signatureHash: string): Promise<boolean> {
    const plugin = await this.fetchPluginDetails(pluginId);
    
    if (!plugin) {
      return false;
    }

    // In production, this would verify the cryptographic signature
    return plugin.signatureHash === signatureHash;
  },

  async getDependencies(pluginId: string): Promise<RegistryPlugin[]> {
    const plugin = await this.fetchPluginDetails(pluginId);
    
    if (!plugin || plugin.dependencies.length === 0) {
      return [];
    }

    const dependencies: RegistryPlugin[] = [];
    
    for (const depId of plugin.dependencies) {
      const dep = await this.fetchPluginDetails(depId);
      if (dep) {
        dependencies.push(dep);
      }
    }

    return dependencies;
  }
};

export default pluginRegistry;
