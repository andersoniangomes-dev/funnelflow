import { useEffect } from 'react';
import { api } from '@/lib/api';

export function useApi() {
  useEffect(() => {
    // Set API base URL from localStorage on mount, or use default
    const apiEndpoint = localStorage.getItem('api_endpoint') || 'http://localhost:3000';
    api.setBaseUrl(apiEndpoint);
  }, []);
}

