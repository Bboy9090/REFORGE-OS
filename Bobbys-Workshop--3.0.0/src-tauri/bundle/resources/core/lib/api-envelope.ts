/**
 * Unified API Envelope System
 * 
 * Standardized response format for ALL API endpoints:
 * - Success: { ok: true, data: T, meta: { ts, correlationId, apiVersion, demo? } }
 * - Error: { ok: false, error: { code, message, details? }, meta: { ts, correlationId, apiVersion, demo? } }
 * 
 * Used by both server (Node.js) and frontend (TypeScript/React)
 */

export interface ApiMeta {
  ts: string; // ISO timestamp
  correlationId: string;
  apiVersion: string;
  demo?: boolean;
}

export interface ApiSuccess<T = any> {
  ok: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiError {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  meta: ApiMeta;
}

export type ApiEnvelope<T = any> = ApiSuccess<T> | ApiError;

/**
 * Error codes used across the API
 */
export const ApiErrorCode = {
  // Client errors (4xx)
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // Policy/Safety errors
  POLICY_BLOCKED: 'POLICY_BLOCKED',
  DEVICE_LOCKED: 'DEVICE_LOCKED',
  CONFIRMATION_REQUIRED: 'CONFIRMATION_REQUIRED',
  
  // Server errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  TOOL_NOT_AVAILABLE: 'TOOL_NOT_AVAILABLE',
  
  // Compatibility errors
  VERSION_MISMATCH: 'VERSION_MISMATCH',
} as const;

export type ApiErrorCodeType = typeof ApiErrorCode[keyof typeof ApiErrorCode];

/**
 * Generate correlation ID
 */
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

