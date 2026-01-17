export interface RegistryPlugin {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: 'diagnostic' | 'flash' | 'utility' | 'security' | 'repair';
  platform: 'android' | 'ios' | 'cross-platform';
  certified: boolean;
  signatureHash: string;
  downloadUrl: string;
  dependencies: string[];
  permissions: string[];
  lastUpdated: string;
  downloads: number;
  rating: number;
  reviews: number;
  checksum: string;
  size: number;
  screenshots?: string[];
  changelog?: string;
  verifiedPublisher: boolean;
  securityScan?: {
    status: 'passed' | 'failed' | 'pending';
    scannedAt: string;
    issues: string[];
  };
}

export interface RegistrySyncStatus {
  lastSync: string | null;
  status: 'idle' | 'syncing' | 'success' | 'error';
  error?: string;
  pluginsUpdated: number;
  pluginsAdded: number;
  pluginsRemoved: number;
}

export interface RegistryManifest {
  version: string;
  generatedAt: string;
  plugins: RegistryPlugin[];
  categories: Record<string, number>;
  totalDownloads: number;
}

export interface PluginUpdate {
  pluginId: string;
  currentVersion: string;
  latestVersion: string;
  releaseNotes: string;
  critical: boolean;
}

export interface RegistryConfig {
  apiUrl: string;
  syncInterval: number;
  autoSync: boolean;
  allowUncertified: boolean;
  cacheExpiry: number;
}
