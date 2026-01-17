/**
 * PANDORA CODEX AUDIT HOOKS
 * 
 * INTERNAL ONLY - Logs all access to Pandora Codex
 */

import { AccessLevel } from './permissions';

export interface PandoraAuditEntry {
  timestamp: Date;
  actor: string;
  accessLevel: AccessLevel;
  action: string;
  resource: string;
  result: 'ALLOWED' | 'DENIED';
  reason?: string;
}

/**
 * Audit log storage (in-memory for now, should be persisted)
 */
const auditLog: PandoraAuditEntry[] = [];

/**
 * Log access attempt to Pandora Codex
 */
export function logPandoraAccess(
  actor: string,
  accessLevel: AccessLevel,
  action: string,
  resource: string,
  result: 'ALLOWED' | 'DENIED',
  reason?: string
): void {
  const entry: PandoraAuditEntry = {
    timestamp: new Date(),
    actor,
    accessLevel,
    action,
    resource,
    result,
    reason
  };
  
  auditLog.push(entry);
  
  // In production, this should write to immutable audit storage
  console.log(`[PANDORA AUDIT] ${result}: ${actor} (${accessLevel}) - ${action} on ${resource}`);
}

/**
 * Get audit log (for compliance export)
 */
export function getAuditLog(
  startDate?: Date,
  endDate?: Date
): PandoraAuditEntry[] {
  return auditLog.filter(entry => {
    if (startDate && entry.timestamp < startDate) return false;
    if (endDate && entry.timestamp > endDate) return false;
    return true;
  });
}

/**
 * Export audit log for compliance (immutable format)
 */
export function exportAuditLog(): string {
  return JSON.stringify(auditLog, null, 2);
}