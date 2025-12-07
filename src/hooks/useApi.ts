import { useEffect } from 'react';
import { api } from '@/lib/api';

export function useApi() {
  useEffect(() => {
    // Set API base URL from localStorage on mount, or use default
    // Priority: localStorage > VITE_API_URL > default Render URL
    const apiEndpoint = localStorage.getItem('api_endpoint') 
      || import.meta.env.VITE_API_URL 
      || 'https://funnelflow-backend.onrender.com';
    api.setBaseUrl(apiEndpoint);
  }, []);
}

