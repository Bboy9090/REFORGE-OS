/**
 * API Client for FastAPI Backend
 * 
 * Connects React frontend to FastAPI service running on port 8001
 */

// ForgeWorks Core API (port 8001)
const FORGEWORKS_API_URL = import.meta.env.VITE_FORGEWORKS_API_URL || 'http://localhost:8001';
// Legacy API (port 8000 for cases, diagnostics, etc.)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  ok: boolean;
  error?: string;
  [key: string]: any;
}

async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  useForgeWorks: boolean = false
): Promise<T> {
  const baseUrl = useForgeWorks ? FORGEWORKS_API_URL : API_BASE_URL;
  const url = `${baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// Cases API
export const casesApi = {
  create: async (data: {
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    notes?: string;
  }) => {
    return apiRequest<ApiResponse>('/api/v1/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  list: async (status?: string) => {
    const params = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest<ApiResponse>(`/api/v1/cases${params}`);
  },

  get: async (caseId: string) => {
    return apiRequest<ApiResponse>(`/api/v1/cases/${caseId}`);
  },

  updateStatus: async (caseId: string, status: string) => {
    return apiRequest<ApiResponse>(`/api/v1/cases/${caseId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// Devices API
export const devicesApi = {
  detect: async () => {
    return apiRequest<ApiResponse>('/api/v1/devices/detect');
  },

  addToCase: async (caseId: string, device: {
    platform: string;
    model?: string;
    serial?: string;
    imei?: string;
    os_version?: string;
    connection_state?: string;
    trust_state?: Record<string, any>;
    passport?: Record<string, any>;
  }) => {
    return apiRequest<ApiResponse>(`/api/v1/cases/${caseId}/devices`, {
      method: 'POST',
      body: JSON.stringify(device),
    });
  },

  getCaseDevices: async (caseId: string) => {
    return apiRequest<ApiResponse>(`/api/v1/cases/${caseId}/devices`);
  },
};

// Evidence bundles API
export const bundlesApi = {
  generate: async (data: {
    case_id: string;
    bundle_type: string;
    carrier?: string;
  }) => {
    return apiRequest<ApiResponse>("/api/v1/bundles/generate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// Solutions API (Custodial Closet)
export const solutionsApi = {
  list: async (params?: {
    device_type?: string;
    category?: string;
    search?: string;
    difficulty?: string;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.device_type) queryParams.append("device_type", params.device_type);
    if (params?.category) queryParams.append("category", params.category);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.difficulty) queryParams.append("difficulty", params.difficulty);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    
    const query = queryParams.toString();
    return apiRequest<ApiResponse>(`/api/v1/solutions${query ? `?${query}` : ""}`);
  },

  get: async (solutionId: string) => {
    return apiRequest<ApiResponse>(`/api/v1/solutions/${solutionId}`);
  },

  getByDeviceType: async (deviceType: string) => {
    return apiRequest<ApiResponse>(`/api/v1/solutions/device-types/${deviceType}`);
  },
};

// Diagnostics API
export const diagnosticsApi = {
  run: async (data: {
    device_serial: string;
    platform: string;
    connection_state: string;
    trust_state: Record<string, any>;
    operations?: string[];
    ownership_attested: boolean;
    confirmation_phrase?: string;
    case_id?: string;
    device_id?: string;
  }) => {
    return apiRequest<ApiResponse>('/api/v1/diagnostics/run', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Recovery API
export const recoveryApi = {
  lookupFirmware: async (oem: string, model?: string, version?: string) => {
    const params = new URLSearchParams({ oem });
    if (model) params.append('model', model);
    if (version) params.append('version', version);
    return apiRequest<ApiResponse>(`/api/v1/recovery/firmware?${params}`);
  },

  getGuidance: async (data: {
    platform: string;
    oem?: string;
    model?: string;
    guidance_type?: string;
  }) => {
    return apiRequest<ApiResponse>('/api/v1/recovery/guidance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Audit API
export const auditApi = {
  getEvents: async (params?: {
    limit?: number;
    level?: string;
    action?: string;
  }) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest<ApiResponse>(`/api/v1/audit/events${query}`, {}, true);
  },

  getCaseEvents: async (caseId: string) => {
    return apiRequest<ApiResponse>(`/api/v1/audit/cases/${caseId}/events`, {}, true);
  },

  export: async (deviceId: string) => {
    return apiRequest<ApiResponse>(
      `/api/v1/audit/export?device_id=${encodeURIComponent(deviceId)}`,
      {},
      true
    );
  },
};

// Health check
export const healthApi = {
  check: async () => {
    return apiRequest<ApiResponse>('/health');
  },
};

// ============================================================================
// FORGEWORKS CORE API (Compliance-First Device Analysis)
// ============================================================================

// Device Analysis
export const deviceAnalysisApi = {
  analyze: async (data: {
    device_metadata: string;
    platform?: string;
    connection_state?: string;
  }) => {
    return apiRequest<ApiResponse>('/api/v1/device/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Ownership Verification
export const ownershipApi = {
  verify: async (data: {
    user_id: string;
    device_id: string;
    attestation_type: string;
    documentation_references?: string[];
  }) => {
    return apiRequest<ApiResponse>('/api/v1/ownership/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true); // Use ForgeWorks API
  },
};

// Legal Classification
export const legalApi = {
  classify: async (data: {
    device_id: string;
    ownership_confidence: number;
    jurisdiction: string;
  }) => {
    return apiRequest<ApiResponse>('/api/v1/legal/classify', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true); // Use ForgeWorks API
  },
};

// Compliance Summary
export const complianceApi = {
  getSummary: async (data: {
    device_id: string;
    include_audit?: boolean;
  }) => {
    return apiRequest<ApiResponse>('/api/v1/compliance/summary', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true); // Use ForgeWorks API
  },
};

// Interpretive Review (Custodian Vault)
export const interpretiveApi = {
  review: async (data: {
    device_id: string;
    scenario: string;
    ownership_confidence: number;
  }, ownershipConfidence: number) => {
    return apiRequest<ApiResponse>('/api/v1/interpretive/review', {
      method: 'POST',
      headers: {
        'X-Ownership-Confidence': ownershipConfidence.toString(),
      },
      body: JSON.stringify(data),
    }, true); // Use ForgeWorks API
  },
};

// Authority Routing
export const routingApi = {
  getAuthority: async (device_id: string, classification_status: string) => {
    return apiRequest<ApiResponse>(
      `/api/v1/route/authority?device_id=${encodeURIComponent(device_id)}&classification_status=${encodeURIComponent(classification_status)}`,
      {},
      true // Use ForgeWorks API
    );
  },
};

// Certification
export const certificationApi = {
  getStatus: async (user_id?: string) => {
    const params = user_id ? `?user_id=${encodeURIComponent(user_id)}` : '';
    return apiRequest<ApiResponse>(`/api/v1/certification/status${params}`, {}, true);
  },
};

// Operations Metrics
export const opsApi = {
  getMetrics: async () => {
    return apiRequest<ApiResponse>('/api/v1/ops/metrics', {}, true);
  },
};

// ============================================================================
// TRAPDOOR API (Admin/Secret Room Endpoints)
// ============================================================================

// Trapdoor API - requires admin authentication
export const trapdoorApi = {
  // Execute FRP Bypass Workflow
  executeFRP: async (data: {
    deviceSerial: string;
    authorization: {
      confirmed: boolean;
      userInput: string;
    };
  }) => {
    return apiRequest<ApiResponse>('/api/trapdoor/frp', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  },

  // Execute Bootloader Unlock
  executeUnlock: async (data: {
    deviceSerial: string;
    authorization: {
      confirmed: boolean;
      userInput: string;
    };
  }) => {
    return apiRequest<ApiResponse>('/api/trapdoor/unlock', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  },

  // Execute Custom Workflow
  executeWorkflow: async (data: {
    category: string;
    workflowId: string;
    deviceSerial: string;
    authorization?: {
      confirmed: boolean;
      userInput: string;
    } | null;
  }) => {
    return apiRequest<ApiResponse>('/api/trapdoor/workflow/execute', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  },

  // List Available Workflows
  listWorkflows: async () => {
    return apiRequest<ApiResponse>('/api/trapdoor/workflows', {}, true);
  },

  // Execute Batch Commands
  executeBatch: async (data: {
    deviceSerial: string;
    throttle?: number;
    commands: Array<{
      category: string;
      workflowId: string;
      authorization?: {
        confirmed: boolean;
        userInput: string;
      } | null;
    }>;
  }) => {
    return apiRequest<ApiResponse>('/api/trapdoor/batch/execute', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  },

  // Get Shadow Logs
  getShadowLogs: async (date?: string) => {
    const query = date ? `?date=${date}` : '';
    return apiRequest<ApiResponse>(`/api/trapdoor/logs/shadow${query}`, {}, true);
  },

  // Get Shadow Log Statistics
  getShadowLogStats: async () => {
    return apiRequest<ApiResponse>('/api/trapdoor/logs/stats', {}, true);
  },

  // Rotate Shadow Logs
  rotateShadowLogs: async () => {
    return apiRequest<ApiResponse>('/api/trapdoor/logs/rotate', {
      method: 'POST',
    }, true);
  },
};
