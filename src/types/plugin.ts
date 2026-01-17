export type PluginStatus = 'pending' | 'testing' | 'approved' | 'rejected' | 'suspended';
export type PluginCategory = 'diagnostic' | 'flashing' | 'detection' | 'workflow' | 'automation' | 'utility';
export type RiskLevel = 'safe' | 'moderate' | 'advanced' | 'expert-only';

export interface PluginAuthor {
  id: string;
  username: string;
  avatarUrl?: string;
  verified: boolean;
  reputation: number;
  totalDownloads: number;
}

export interface PluginCapabilities {
  requiresUSB: boolean;
  requiresRoot: boolean;
  modifiesSystem: boolean;
  platforms: ('android' | 'ios' | 'universal')[];
  permissions: string[];
}

export interface PluginTestResult {
  id: string;
  testName: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  message?: string;
  timestamp: number;
}

export interface PluginVersion {
  version: string;
  releaseDate: number;
  changelog: string;
  downloadUrl: string;
  hash: string;
  size: number;
  minAppVersion: string;
}

export interface Plugin {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  category: PluginCategory;
  riskLevel: RiskLevel;
  status: PluginStatus;
  author: PluginAuthor;
  capabilities: PluginCapabilities;
  currentVersion: PluginVersion;
  versions: PluginVersion[];
  testResults: PluginTestResult[];
  certified: boolean;
  certificationDate?: number;
  downloads: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  icon?: string;
  screenshots: string[];
  documentation: string;
  repository?: string;
  license: string;
  createdAt: number;
  updatedAt: number;
}

export interface PluginSubmission {
  pluginId?: string;
  name: string;
  description: string;
  longDescription: string;
  category: PluginCategory;
  riskLevel: RiskLevel;
  capabilities: PluginCapabilities;
  version: string;
  changelog: string;
  packageUrl: string;
  documentation: string;
  repository?: string;
  license: string;
  submittedBy: string;
  submittedAt: number;
}

export interface InstalledPlugin {
  plugin: Plugin;
  installedVersion: string;
  installedAt: number;
  enabled: boolean;
  autoUpdate: boolean;
}

export interface PluginSearchFilters {
  category?: PluginCategory;
  riskLevel?: RiskLevel;
  platform?: 'android' | 'ios' | 'universal';
  certified?: boolean;
  sortBy: 'popular' | 'recent' | 'rating' | 'name';
}
