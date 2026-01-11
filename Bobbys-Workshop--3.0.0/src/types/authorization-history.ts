export interface AuthorizationHistoryEntry {
  id: string;
  triggerId: string;
  triggerName: string;
  category: string;
  deviceId?: string;
  deviceName?: string;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  userResponse: 'approved' | 'rejected' | 'timeout';
  timestamp: number;
  executionTime?: number;
  errorMessage?: string;
  retryCount?: number;
  maxRetries?: number;
  metadata?: Record<string, any>;
  auditLog?: {
    action: string;
    triggerId: string;
    deviceId?: string;
    userResponse: string;
    timestamp: number;
    executionResult?: any;
    errorDetails?: string;
  };
}

export interface AuthorizationRetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  timeout: number;
}

export interface TimelineGroup {
  date: string;
  entries: AuthorizationHistoryEntry[];
}
