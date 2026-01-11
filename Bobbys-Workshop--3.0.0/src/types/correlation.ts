export type CorrelationBadge = 
  | 'CORRELATED' 
  | 'CORRELATED (WEAK)' 
  | 'SYSTEM-CONFIRMED' 
  | 'LIKELY' 
  | 'UNCONFIRMED';

export interface PolicyGates {
  require_explicit_device_select: boolean;
  require_typed_confirmation_for_destructive: boolean;
  block_destructive_if_confidence_below: number;
  correlation_present: boolean;
  allowed_actions: string[];
  blocked_actions: string[];
  reasons: string[];
}

export interface DossierSeed {
  platform: string;
  device_mode: string;
  confidence: number;
  detection_evidence: {
    usb_evidence: string[];
    tools_evidence: string[];
  };
  capabilities: {
    can_run_adb_shell: boolean;
    can_use_fastboot: boolean;
    can_collect_ios_info: boolean;
  };
  policy_gates: PolicyGates;
  summary_lines: string[];
  warnings: string[];
  correlation_badge: CorrelationBadge;
  matched_ids: string[];
  correlation_notes: string[];
}

export interface DeviceRecord {
  id: string;
  serial?: string;
  vendorId?: number;
  productId?: number;
  matched_tool_ids?: string[];
  platform?: string;
  mode?: string;
  confidence?: number;
  [key: string]: any;
}
