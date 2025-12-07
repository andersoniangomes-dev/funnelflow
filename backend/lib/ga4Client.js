import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getGA4PropertyId, getCredentialsPath, getCredentialsFromDB } from './ga4Config.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Initialize GA4 client dynamically based on saved config
export async function getAnalyticsClient() {
  try {
    // Try to get credentials from database first (preferred for Render)
    const credentialsFromDB = await getCredentialsFromDB();
    
    if (credentialsFromDB) {
      // Create temporary file with credentials (GA4 client requires file path)
      // Use /tmp directory which is persistent in Render
      const tmpDir = os.tmpdir();
      const tmpCredentialsFile = path.join(tmpDir, 'ga4-credentials-tmp.json');
      
      try {
        // Write credentials to temp file
        await fs.writeFile(tmpCredentialsFile, JSON.stringify(credentialsFromDB, null, 2), 'utf8');
        
        // Set environment variable for the client
        const originalPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpCredentialsFile;
        
        const client = new BetaAnalyticsDataClient();
        
        // Only restore original if it's a valid file path (not JSON object)
        if (originalPath && typeof originalPath === 'string' && !originalPath.trim().startsWith('{')) {
          process.env.GOOGLE_APPLICATION_CREDENTIALS = originalPath;
        } else {
          // Clear invalid path (was JSON object or invalid)
          delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
        }
        
        return client;
      } catch (fileError) {
        console.error('Error creating temp credentials file:', fileError);
        // Fall through to file-based credentials
      }
    }
    
    // Fallback to file-based credentials
    const credentialsPath = getCredentialsPath() || process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    if (!credentialsPath) {
      return null;
    }
    
    // Verify credentialsPath is valid before using
    if (typeof credentialsPath !== 'string' || credentialsPath.trim().startsWith('{')) {
      console.error('Invalid credentials path (looks like JSON object):', credentialsPath?.substring(0, 50));
      return null;
    }
    
    // Temporarily set the env var for the client
    const originalPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
    
    const client = new BetaAnalyticsDataClient();
    
    // Only restore original if it's a valid file path (not JSON object)
    if (originalPath && typeof originalPath === 'string' && !originalPath.trim().startsWith('{')) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = originalPath;
    } else {
      // Clear invalid path (was JSON object or invalid)
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
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

