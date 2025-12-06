import { useEffect } from 'react';
import { api } from '@/lib/api';

export function useApi() {
  useEffect(() => {
    // Set API base URL from localStorage on mount
    const apiEndpoint = localStorage.getItem('api_endpoint');
    if (apiEndpoint) {
      api.setBaseUrl(apiEndpoint);
    }
  }, []);
}

