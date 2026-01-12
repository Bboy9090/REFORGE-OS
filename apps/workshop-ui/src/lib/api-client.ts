/**
 * API Client for FastAPI Backend
 * 
 * Connects React frontend to FastAPI service running on port 8001
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

export interface ApiResponse<T = any> {
  ok: boolean;
  error?: string;
  [key: string]: any;
}

async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
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
    return apiRequest<ApiResponse>(`/api/v1/audit/events${query}`);
  },

  getCaseEvents: async (caseId: string) => {
    return apiRequest<ApiResponse>(`/api/v1/audit/cases/${caseId}/events`);
  },
};

// Health check
export const healthApi = {
  check: async () => {
    return apiRequest<ApiResponse>('/health');
  },
};
