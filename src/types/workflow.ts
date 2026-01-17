// Workflow type definitions

export type WorkflowStatus = 
  | 'backlog' 
  | 'in_progress' 
  | 'review' 
  | 'done';

export type WorkflowRiskLevel = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'destructive';

export type WorkflowPlatform = 
  | 'android' 
  | 'ios' 
  | 'windows' 
  | 'universal';

export type WorkflowCategory = 
  | 'diagnostics' 
  | 'bypass' 
  | 'unlock' 
  | 'restore' 
  | 'flash' 
  | 'recovery';

export type WorkflowStepType = 
  | 'command' 
  | 'check' 
  | 'wait' 
  | 'prompt' 
  | 'log';

export type WorkflowStepFailureAction = 
  | 'continue' 
  | 'abort' 
  | 'retry';

export interface WorkflowStep {
  id: string;
  name: string;
  type: WorkflowStepType;
  action: string;
  success_criteria: string;
  on_failure: WorkflowStepFailureAction;
  note?: string;
  prompt_text?: string;
  required_input?: string;
  log_data?: Record<string, any>;
}

export interface WorkflowOutput {
  format: 'json' | 'text' | 'binary';
  fields: string[];
}

export interface WorkflowMetadata {
  status: WorkflowStatus;
  pr_link: string | null;
  placeholder_found?: boolean;
  created_at?: number;
  updated_at?: number;
  version: string;
  author: string;
  tags?: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  platform: WorkflowPlatform;
  category: WorkflowCategory;
  risk_level: WorkflowRiskLevel;
  requires_authorization: boolean;
  authorization_prompt?: string;
  legal_notice?: string;
  steps: WorkflowStep[];
  output: WorkflowOutput;
  metadata?: WorkflowMetadata;
}

export interface WorkflowExecutionResult {
  workflow_id: string;
  success: boolean;
  steps: WorkflowStepResult[];
  timestamp: number;
  duration: number;
  error?: string;
}

export interface WorkflowStepResult {
  step_id: string;
  step_name: string;
  success: boolean;
  output?: string;
  error?: string;
  duration: number;
}
