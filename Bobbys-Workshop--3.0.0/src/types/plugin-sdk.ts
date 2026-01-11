export type PluginRiskLevel = 'safe' | 'moderate' | 'high' | 'critical';
export type PluginCapability = 
  | 'detection' 
  | 'diagnostics' 
  | 'flash' 
  | 'recovery' 
  | 'backup'
  | 'restore'
  | 'unlock'
  | 'root'
  | 'custom';

export type PluginStatus = 
  | 'pending' 
  | 'certified' 
  | 'rejected' 
  | 'revoked' 
  | 'deprecated';

export type PluginCategory =
  | 'device-detection'
  | 'diagnostics'
  | 'flashing'
  | 'recovery'
  | 'security'
  | 'workflow'
  | 'utility';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: PluginCategory;
  capabilities: PluginCapability[];
  riskLevel: PluginRiskLevel;
  
  requiredPermissions: string[];
  
  supportedPlatforms: ('android' | 'ios' | 'windows' | 'macos' | 'linux')[];
  supportedDevices?: string[];
  
  dependencies?: {
    [key: string]: string;
  };
  
  minimumSDKVersion: string;
  
  entryPoint: string;
  
  homepage?: string;
  repository?: string;
  license: string;
  
  certification?: PluginCertification;
  
  hooks?: {
    onLoad?: string;
    onUnload?: string;
    beforeOperation?: string;
    afterOperation?: string;
  };
}

export interface PluginCertification {
  certifiedBy: 'bobby' | 'community' | 'oem' | 'self';
  
  status: PluginStatus;
  
  certificationDate?: number;
  expirationDate?: number;
  
  signatureHash: string;
  
  certificateChain?: string[];
  
  securityAudit?: {
    passed: boolean;
    auditor: string;
    auditDate: number;
    findings: string[];
  };
  
  codeReview?: {
    passed: boolean;
    reviewer: string;
    reviewDate: number;
    notes: string[];
  };
  
  restrictions?: {
    requiresUserConfirmation?: boolean;
    requiresOwnerApproval?: boolean;
    maxExecutionsPerDay?: number;
    allowedEnvironments?: ('dev' | 'staging' | 'production')[];
  };
}

export interface PluginContext {
  pluginId: string;
  
  version: string;
  
  environment: 'dev' | 'staging' | 'production';
  
  user: {
    id: string;
    isOwner: boolean;
    permissions: string[];
  };
  
  deviceId?: string;
  
  platform?: 'android' | 'ios' | 'windows' | 'macos' | 'linux';
  
  device?: {
    serial: string;
    platform: string;
    brand: string;
    model: string;
  };
  
  adb?: {
    shell: (deviceId: string, command: string) => Promise<string>;
    execute: (deviceId: string, command: string) => Promise<string>;
  };
  
  kv: {
    get: <T>(key: string) => Promise<T | undefined>;
    set: <T>(key: string, value: T) => Promise<void>;
    delete: (key: string) => Promise<void>;
    keys: () => Promise<string[]>;
  };
  
  logger?: {
    info: (message: string, metadata?: Record<string, any>) => void;
    warn: (message: string, metadata?: Record<string, any>) => void;
    error: (message: string, metadata?: Record<string, any>) => void;
    debug: (message: string, metadata?: Record<string, any>) => void;
  };
  
  emit: (event: string, data: any) => void;
  
  on: (event: string, handler: (data: any) => void) => () => void;
}

export interface PluginAPI {
  getDeviceInfo: (serial: string) => Promise<DeviceInfo>;
  
  executeCommand: (command: string, args: string[]) => Promise<CommandResult>;
  
  detectDevices: () => Promise<DetectedDevice[]>;
  
  startFlashOperation: (config: FlashConfig) => Promise<string>;
  
  monitorProgress: (jobId: string) => AsyncIterableIterator<ProgressUpdate>;
  
  createEvidence: (data: EvidenceData) => Promise<string>;
  
  requestPermission: (permission: string) => Promise<boolean>;
  
  showNotification: (notification: Notification) => void;
  
  openDialog: (dialog: Dialog) => Promise<DialogResult>;
}

export interface Plugin {
  manifest: PluginManifest;
  
  initialize: (context: PluginContext, api: PluginAPI) => Promise<void>;
  
  execute?: (params: PluginExecutionParams) => Promise<PluginResult>;
  
  detect?: (device: DetectedDevice) => Promise<DetectionResult>;
  
  diagnose?: (device: DetectedDevice) => Promise<DiagnosticResult>;
  
  flash?: (config: FlashConfig) => Promise<FlashResult>;
  
  cleanup?: () => Promise<void>;
}

export interface PluginExecutionParams {
  operation: string;
  
  device?: DetectedDevice;
  
  parameters: Record<string, any>;
  
  dryRun?: boolean;
}

export interface PluginResult<T = any> {
  success: boolean;
  
  message?: string;
  
  data?: T;
  
  error?: string;
  
  warnings?: string[];
  
  errors?: string[];
  
  metadata?: {
    executionTime: number;
    resourceUsage?: {
      cpu?: number;
      memory?: number;
    };
  };
}

export interface DetectionResult {
  detected: boolean;
  
  confidence: number;
  
  platform?: string;
  brand?: string;
  model?: string;
  
  deviceMode?: string;
  
  capabilities?: string[];
  
  correlationBadge?: string;
  matchedIds?: string[];
  
  warnings?: string[];
}

export interface DiagnosticResult {
  passed: boolean;
  
  findings: DiagnosticFinding[];
  
  healthScore?: number;
  
  recommendations?: string[];
  
  nextSteps?: string[];
}

export interface DiagnosticFinding {
  category: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  resolution?: string;
}

export interface FlashConfig {
  deviceSerial: string;
  method: string;
  partitions: PartitionConfig[];
  verifyAfterFlash: boolean;
  autoReboot: boolean;
}

export interface PartitionConfig {
  name: string;
  imagePath: string;
  size: number;
  hash?: string;
}

export interface FlashResult {
  success: boolean;
  jobId: string;
  status: string;
  completedPartitions: string[];
  failedPartitions: string[];
  logs: string[];
  error?: string;
}

export interface DeviceInfo {
  serial: string;
  platform: string;
  brand: string;
  model: string;
  androidVersion?: string;
  iosVersion?: string;
  bootloaderUnlocked?: boolean;
  securityState?: string;
  correlationBadge?: string;
}

export interface DetectedDevice {
  serial: string;
  usbPath: string;
  vendorId: string;
  productId: string;
  platform: 'android' | 'ios' | 'unknown';
  currentMode: string;
  brand?: string;
  model?: string;
}

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  executionTime: number;
}

export interface ProgressUpdate {
  progress: number;
  stage: string;
  message: string;
  bytesTransferred?: number;
  transferSpeed?: number;
}

export interface EvidenceData {
  deviceSerial: string;
  operation: string;
  timestamp: number;
  data: Record<string, any>;
  hash?: string;
}

export interface Notification {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

export interface Dialog {
  title: string;
  message: string;
  type: 'confirm' | 'alert' | 'input';
  confirmLabel?: string;
  cancelLabel?: string;
  inputPlaceholder?: string;
}

export interface DialogResult {
  confirmed: boolean;
  value?: string;
}

export interface PluginRegistry {
  plugins: Map<string, RegisteredPlugin>;
  
  register: (plugin: Plugin) => Promise<void>;
  
  unregister: (pluginId: string) => Promise<void>;
  
  getPlugin: (pluginId: string) => RegisteredPlugin | undefined;
  
  listPlugins: (filter?: PluginFilter) => RegisteredPlugin[];
  
  executePlugin: (pluginId: string, params: PluginExecutionParams) => Promise<PluginResult>;
  
  certifyPlugin: (pluginId: string, certification: PluginCertification) => Promise<void>;
  
  revokePlugin: (pluginId: string, reason: string) => Promise<void>;
}

export interface RegisteredPlugin {
  plugin: Plugin;
  
  registeredAt: number;
  
  enabled: boolean;
  
  executionCount: number;
  lastExecuted?: number;
  
  errors: PluginError[];
  
  trustScore: number;
}

export interface PluginError {
  timestamp: number;
  error: string;
  stackTrace?: string;
  context?: Record<string, any>;
}

export interface PluginFilter {
  category?: PluginCategory;
  riskLevel?: PluginRiskLevel;
  capability?: PluginCapability;
  status?: PluginStatus;
  certifiedOnly?: boolean;
}

export interface PluginSecurityPolicy {
  allowUncertified: boolean;
  
  requireSignature: boolean;
  
  allowedRiskLevels: PluginRiskLevel[];
  
  maxExecutionsPerDay: number;
  
  requireUserConfirmationFor: PluginRiskLevel[];
  
  blocklist: string[];
  
  allowlist: string[];
  
  sandboxEnabled: boolean;
  
  auditLogging: boolean;
}

export interface PluginAuditLog {
  timestamp: number;
  pluginId: string;
  version: string;
  user: string;
  operation: string;
  success: boolean;
  duration: number;
  error?: string;
  metadata?: Record<string, any>;
}
