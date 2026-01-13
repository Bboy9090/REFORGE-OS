// Trapdoor API Type Definitions
// Admin/Secret Room API types - protected endpoints

export interface TrapdoorWorkflow {
  id: string;
  name: string;
  category: string;
  platform: string;
  risk_level: 'low' | 'medium' | 'high';
  requires_authorization: boolean;
  description?: string;
}

export interface TrapdoorWorkflowExecution {
  deviceSerial: string;
  category?: string;
  workflowId?: string;
  authorization?: {
    confirmed: boolean;
    userInput: string;
  };
}

export interface TrapdoorWorkflowResult {
  stepId: string;
  stepName: string;
  stepIndex: number;
  success: boolean;
  output?: string;
  error?: string;
  timestamp: string;
}

export interface TrapdoorWorkflowResponse {
  success: boolean;
  workflow: string;
  results: TrapdoorWorkflowResult[];
  auditReference?: string;
}

export interface ShadowLogEntry {
  timestamp: string;
  operation: string;
  deviceSerial?: string;
  userId?: string;
  authorization?: string;
  success: boolean;
  metadata?: Record<string, any>;
  tampered: boolean;
  recordVersion: string;
}

export interface ShadowLogsResponse {
  success: boolean;
  date: string;
  entries: ShadowLogEntry[];
  count: number;
  totalEntries: number;
  tamperedEntries: number;
}

export interface ShadowLogStats {
  shadowLogs: number;
  publicLogs: number;
  retentionDays: number;
  anonymousMode: boolean;
  logDirectory: string;
}

export interface TrapdoorBatchCommand {
  category: string;
  workflowId: string;
  authorization?: {
    confirmed: boolean;
    userInput: string;
  } | null;
}

export interface TrapdoorBatchExecution {
  deviceSerial: string;
  throttle?: number;
  commands: TrapdoorBatchCommand[];
}

export interface TrapdoorBatchResult {
  index: number;
  command: TrapdoorBatchCommand;
  result: TrapdoorWorkflowResponse;
  timestamp: string;
}

export interface TrapdoorBatchResponse {
  success: boolean;
  totalCommands: number;
  results: TrapdoorBatchResult[];
}
