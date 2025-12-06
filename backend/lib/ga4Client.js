import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getGA4PropertyId, getCredentialsPath } from './ga4Config.js';

// Initialize GA4 client dynamically based on saved config
export function getAnalyticsClient() {
  const credentialsPath = getCredentialsPath() || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (!credentialsPath) {
    return null;
  }
  
  try {
    // Temporarily set the env var for the client
    const originalPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
    
    const client = new BetaAnalyticsDataClient();
    
    // Restore original if it existed
    if (originalPath) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = originalPath;
    }
    
    return client;
  } catch (error) {
    console.error('Error initializing GA4 client:', error);
    return null;
  }
}

export function getPropertyId() {
  return getGA4PropertyId() || process.env.GA4_PROPERTY_ID;
}

