const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface HealthResponse {
  status: 'ok' | 'error';
  ga4: 'connected' | 'not_configured' | 'connection_failed' | 'not_initialized' | 'unknown_error';
  propertyId?: string;
  message?: string;
  error?: string;
}

export interface KPIsResponse {
  sessions: {
    value: string;
    change: number;
    changeLabel: string;
  };
  users: {
    value: string;
    change: number;
    changeLabel: string;
  };
  conversions: {
    value: string;
    change: number;
    changeLabel: string;
  };
  conversionRate: {
    value: string;
    change: number;
    changeLabel: string;
  };
  period: {
    startDate: string;
    endDate: string;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  async health(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  async getKPIs(startDate: string = '30daysAgo', endDate: string = 'today'): Promise<KPIsResponse> {
    return this.request<KPIsResponse>(`/kpis?startDate=${startDate}&endDate=${endDate}`);
  }

  async getEvents(startDate: string = '30daysAgo', endDate: string = 'today') {
    return this.request(`/events?startDate=${startDate}&endDate=${endDate}`);
  }

  async getFunnel(steps: string, startDate: string = '30daysAgo', endDate: string = 'today') {
    return this.request(`/funnel?steps=${steps}&startDate=${startDate}&endDate=${endDate}`);
  }

  async getTrafficSources(startDate: string = '30daysAgo', endDate: string = 'today') {
    return this.request(`/traffic/sources?startDate=${startDate}&endDate=${endDate}`);
  }

  async getCampaigns(startDate: string = '30daysAgo', endDate: string = 'today') {
    return this.request(`/traffic/campaigns?startDate=${startDate}&endDate=${endDate}`);
  }

  async getConfig() {
    return this.request<{
      propertyId: string;
      hasCredentials: boolean;
      credentialsPath: string | null;
      configured: boolean;
    }>('/config');
  }

  async saveConfig(propertyId: string, credentials: string | object) {
    return this.request<{
      success: boolean;
      message: string;
      propertyId: string;
      hasCredentials: boolean;
    }>('/config', {
      method: 'POST',
      body: JSON.stringify({
        propertyId,
        credentials: typeof credentials === 'string' ? credentials : JSON.stringify(credentials)
      })
    });
  }

  async deleteConfig() {
    return this.request('/config', {
      method: 'DELETE'
    });
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }
}

export const api = new ApiClient();

