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
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: `HTTP error! status: ${response.status}`,
          error: response.statusText 
        }));
        const errorObj = new Error(error.message || error.error || `HTTP error! status: ${response.status}`);
        (errorObj as any).status = response.status;
        (errorObj as any).response = error;
        throw errorObj;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - o servidor demorou muito para responder');
        }
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

  async getUTMStats() {
    return this.request('/utm/stats');
  }

  async getUTMStatsById(utmId: string) {
    return this.request(`/utm/stats/${utmId}`);
  }

  getTrackingUrl(utmId: string, originalUrl: string): string {
    const apiEndpoint = localStorage.getItem("api_endpoint") || this.baseUrl;
    const encodedUrl = encodeURIComponent(originalUrl);
    return `${apiEndpoint}/utm/track/${utmId}?url=${encodedUrl}`;
  }

  async shortenUrl(url: string, customCode?: string) {
    return this.request<{
      success: boolean;
      shortCode: string;
      shortUrl: string;
      originalUrl: string;
    }>('/s/shorten', {
      method: 'POST',
      body: JSON.stringify({ url, customCode })
    });
  }

  async getShortUrlInfo(code: string) {
    return this.request<{
      shortCode: string;
      shortUrl: string;
      originalUrl: string;
      clicks: number;
      createdAt: string;
      lastClick: string | null;
    }>(`/s/info/${code}`);
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }
}

export const api = new ApiClient();

