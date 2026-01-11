// Plugin API - backend client used by the Plugin Marketplace UI.
// Truth-first: no mock plugins, no fake installs. Backend must implement these endpoints.

import { getAPIUrl } from '@/lib/apiConfig';
import type { InstalledPlugin, Plugin, PluginSearchFilters } from '@/types/plugin';

export type PluginDownloadProgress = {
  stage: 'downloading' | 'installing' | 'verifying' | 'completed' | 'failed';
  progress: number;
  bytesDownloaded?: number;
  totalBytes?: number;
  error?: string;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    const detail = body ? ` - ${body.slice(0, 300)}` : '';
    throw new Error(`Request failed (${response.status}) ${response.statusText}${detail}`);
  }
  return (await response.json()) as T;
}

const PLUGINS_BASE = '/api/plugins';

function buildSearchParams(filters: PluginSearchFilters): string {
  const params = new URLSearchParams();
  params.set('sortBy', filters.sortBy);
  if (filters.category) params.set('category', filters.category);
  if (filters.riskLevel) params.set('riskLevel', filters.riskLevel);
  if (filters.platform) params.set('platform', filters.platform);
  if (filters.certified !== undefined) params.set('certified', String(filters.certified));
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const pluginAPI = {
  async searchPlugins(filters: PluginSearchFilters): Promise<Plugin[]> {
    const url = getAPIUrl(`${PLUGINS_BASE}/search${buildSearchParams(filters)}`);
    return await fetchJson<Plugin[]>(url);
  },

  async getInstalledPlugins(): Promise<InstalledPlugin[]> {
    const url = getAPIUrl(`${PLUGINS_BASE}/installed`);
    return await fetchJson<InstalledPlugin[]>(url);
  },

  async uninstallPlugin(pluginId: string): Promise<void> {
    const url = getAPIUrl(`${PLUGINS_BASE}/installed/${encodeURIComponent(pluginId)}`);
    await fetchJson<{ success: true }>(url, { method: 'DELETE' });
  },
};
