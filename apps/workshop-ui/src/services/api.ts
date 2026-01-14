// API Service Layer
// Safe, analysis-only endpoints - no execution endpoints
// Enhanced with error handling, interceptors, and Trapdoor API

import { 
  DeviceProfile, 
  OwnershipAttestation, 
  LegalClassification, 
  LanguageOutput,
  ComplianceReport,
  AuthorityRoute,
  ApiError,
  AuditEvent,
  AuditEventsResponse
} from '../types/api';
import {
  TrapdoorWorkflow,
  TrapdoorWorkflowExecution,
  TrapdoorWorkflowResponse,
  TrapdoorBatchExecution,
  TrapdoorBatchResponse,
  ShadowLogsResponse,
  ShadowLogStats
} from '../types/trapdoor';
import {
  Solution,
  SolutionSearchParams,
  SolutionListResponse,
  SolutionResponse
} from '../types/custodial-closet';

const API_BASE = '/api/v1';
const TRAPDOOR_BASE = '/api/trapdoor';

// Configuration
const API_TIMEOUT = 30000; // 30 seconds
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// Request interceptor for adding auth headers
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  
  // Add admin API key if available (from localStorage or env)
  const adminKey = localStorage.getItem('admin_api_key') || import.meta.env.VITE_ADMIN_API_KEY;
  if (adminKey) {
    headers['X-API-Key'] = adminKey;
  }
  
  // Add ownership confidence if available
  const ownershipConfidence = localStorage.getItem('ownership_confidence');
  if (ownershipConfidence) {
    headers['X-Ownership-Confidence'] = ownershipConfidence;
  }
  
  return headers;
}

// Error handling with retry logic
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = RETRY_ATTEMPTS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // Don't retry on 4xx errors (client errors)
      if (response.status >= 400 && response.status < 500) {
        throw await parseError(response);
      }
      
      // Retry on 5xx errors (server errors) or network errors
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(url, options, retries - 1);
      }
      
      throw await parseError(response);
    }
    
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    
    if (retries > 0 && !(error instanceof Error && error.message.includes('HTTP'))) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    
    throw error;
  }
}

// Parse error response
async function parseError(response: Response): Promise<Error> {
  try {
    const errorData: ApiError = await response.json();
    const errorMessage = errorData.detail || errorData.message || errorData.error || response.statusText;
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    (error as any).code = errorData.code;
    return error;
  } catch {
    return new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
}

export class ForgeWorksAPI {
  // Device Analysis
  static async analyzeDevice(metadata: any): Promise<DeviceProfile> {
    const response = await fetchWithRetry(`${API_BASE}/device/analyze`, {
      method: 'POST',
      body: JSON.stringify(metadata),
    });
    return response.json();
  }

  // Ownership Verification
  static async verifyOwnership(
    deviceId: string, 
    attestations: any
  ): Promise<OwnershipAttestation> {
    const response = await fetchWithRetry(`${API_BASE}/ownership/verify`, {
      method: 'POST',
      body: JSON.stringify({ deviceId, attestations }),
    });
    return response.json();
  }

  // Legal Classification
  static async classifyLegal(
    deviceId: string,
    jurisdiction: string
  ): Promise<LegalClassification> {
    const response = await fetchWithRetry(`${API_BASE}/legal/classify`, {
      method: 'POST',
      body: JSON.stringify({ deviceId, jurisdiction }),
    });
    return response.json();
  }

  // Language Shaping (uses risk-language-engine)
  static async shapeLanguage(
    deviceContext: any,
    classification: any
  ): Promise<LanguageOutput> {
    const response = await fetchWithRetry(`${API_BASE}/language/shape`, {
      method: 'POST',
      body: JSON.stringify({ deviceContext, classification }),
    });
    return response.json();
  }

  // Authority Routing
  static async getAuthorityRoutes(
    deviceId: string,
    classification: string
  ): Promise<AuthorityRoute[]> {
    const response = await fetchWithRetry(`${API_BASE}/route/authority`, {
      method: 'POST',
      body: JSON.stringify({ deviceId, classification }),
    });
    return response.json();
  }

  // Compliance Summary
  static async getComplianceSummary(deviceId: string): Promise<ComplianceReport> {
    const response = await fetchWithRetry(`${API_BASE}/compliance/summary`, {
      method: 'POST',
      body: JSON.stringify({ deviceId }),
    });
    return response.json();
  }

  // Interpretive Review (Custodian Vault - gated)
  static async interpretiveReview(
    deviceId: string,
    ownershipConfidence: number
  ): Promise<{
    riskFraming: string;
    historicalContext: string;
    authorityPaths: AuthorityRoute[];
  }> {
    const response = await fetchWithRetry(`${API_BASE}/interpretive/review`, {
      method: 'POST',
      headers: {
        'X-Ownership-Confidence': ownershipConfidence.toString(),
      },
      body: JSON.stringify({ deviceId }),
    });
    return response.json();
  }

  // Generate Compliance Report
  static async generateComplianceReport(
    deviceId: string
  ): Promise<ComplianceReport> {
    const response = await fetchWithRetry(`${API_BASE}/report/compliance`, {
      method: 'POST',
      body: JSON.stringify({ deviceId }),
    });
    return response.json();
  }

  // Audit Log Events
  static async getAuditEvents(params?: {
    deviceId?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditEventsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.deviceId) queryParams.append('deviceId', params.deviceId);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const query = queryParams.toString();
    const response = await fetchWithRetry(`${API_BASE}/audit/events${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
    return response.json();
  }

  // Audit Log Export
  static async exportAuditLog(deviceId: string): Promise<Blob> {
    const response = await fetchWithRetry(`${API_BASE}/audit/export?deviceId=${deviceId}`, {
      method: 'GET',
    });
    return response.blob();
  }

  // Certification Status
  static async getCertificationStatus(): Promise<{
    level: string;
    requirements_met: boolean;
    next_level?: string;
  }> {
    const response = await fetchWithRetry(`${API_BASE}/certification/status`, {
      method: 'GET',
    });
    return response.json();
  }

  // Operations Metrics
  static async getOpsMetrics(): Promise<{
    activeUnits: number;
    auditCoverage: number;
    complianceEscalations: number;
  }> {
    const response = await fetchWithRetry(`${API_BASE}/ops/metrics`, {
      method: 'GET',
    });
    return response.json();
  }
}

// Trapdoor API (Admin/Secret Room Endpoints)
export class TrapdoorAPI {
  // Execute FRP Bypass Workflow
  static async executeFRP(
    deviceSerial: string,
    authorization: { confirmed: boolean; userInput: string }
  ): Promise<TrapdoorWorkflowResponse> {
    const response = await fetchWithRetry(`${TRAPDOOR_BASE}/frp`, {
      method: 'POST',
      body: JSON.stringify({
        deviceSerial,
        authorization,
      }),
    });
    return response.json();
  }

  // Execute Bootloader Unlock
  static async executeUnlock(
    deviceSerial: string,
    authorization: { confirmed: boolean; userInput: string }
  ): Promise<TrapdoorWorkflowResponse> {
    const response = await fetchWithRetry(`${TRAPDOOR_BASE}/unlock`, {
      method: 'POST',
      body: JSON.stringify({
        deviceSerial,
        authorization,
      }),
    });
    return response.json();
  }

  // Execute Custom Workflow
  static async executeWorkflow(
    execution: TrapdoorWorkflowExecution
  ): Promise<TrapdoorWorkflowResponse> {
    const response = await fetchWithRetry(`${TRAPDOOR_BASE}/workflow/execute`, {
      method: 'POST',
      body: JSON.stringify(execution),
    });
    return response.json();
  }

  // List Available Workflows
  static async listWorkflows(): Promise<{
    success: boolean;
    workflows: TrapdoorWorkflow[];
  }> {
    const response = await fetchWithRetry(`${TRAPDOOR_BASE}/workflows`, {
      method: 'GET',
    });
    return response.json();
  }

  // Execute Batch Commands
  static async executeBatch(
    batch: TrapdoorBatchExecution
  ): Promise<TrapdoorBatchResponse> {
    const response = await fetchWithRetry(`${TRAPDOOR_BASE}/batch/execute`, {
      method: 'POST',
      body: JSON.stringify(batch),
    });
    return response.json();
  }

  // Get Shadow Logs
  static async getShadowLogs(date?: string): Promise<ShadowLogsResponse> {
    const query = date ? `?date=${date}` : '';
    const response = await fetchWithRetry(`${TRAPDOOR_BASE}/logs/shadow${query}`, {
      method: 'GET',
    });
    return response.json();
  }

  // Get Shadow Log Statistics
  static async getShadowLogStats(): Promise<{
    success: boolean;
    stats: ShadowLogStats;
  }> {
    const response = await fetchWithRetry(`${TRAPDOOR_BASE}/logs/stats`, {
      method: 'GET',
    });
    return response.json();
  }

  // Rotate Shadow Logs
  static async rotateShadowLogs(): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await fetchWithRetry(`${TRAPDOOR_BASE}/logs/rotate`, {
      method: 'POST',
    });
    return response.json();
  }
}

// Custodial Closet API (Solutions Database)
export class CustodialClosetAPI {
  // List Solutions
  static async listSolutions(
    params?: SolutionSearchParams
  ): Promise<SolutionListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.device_type) queryParams.append('device_type', params.device_type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params?.tags) params.tags.forEach(tag => queryParams.append('tags', tag));
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const query = queryParams.toString();
    const response = await fetchWithRetry(`${API_BASE}/solutions${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
    return response.json();
  }

  // Get Solution by ID
  static async getSolution(solutionId: string): Promise<SolutionResponse> {
    const response = await fetchWithRetry(`${API_BASE}/solutions/${solutionId}`, {
      method: 'GET',
    });
    return response.json();
  }

  // Get Solutions by Device Type
  static async getSolutionsByDeviceType(
    deviceType: string
  ): Promise<SolutionListResponse> {
    const response = await fetchWithRetry(`${API_BASE}/solutions/device-types/${deviceType}`, {
      method: 'GET',
    });
    return response.json();
  }
}

// Forbidden endpoints (these should never exist):
// - /execute
// - /apply
// - /tool
// - /bypass
// - /unlock
// - /jailbreak
// - /root
