import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getGA4PropertyId, getCredentialsPath, getCredentialsFromDB } from './ga4Config.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Initialize GA4 client dynamically based on saved config
export async function getAnalyticsClient() {
  try {
    // Clean up any invalid GOOGLE_APPLICATION_CREDENTIALS first
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (typeof credsPath === 'string' && credsPath.trim().startsWith('{')) {
        console.warn('⚠️ GOOGLE_APPLICATION_CREDENTIALS contains JSON object, clearing it');
        delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
      }
    }
    
    // Try to get credentials from database first (preferred for Render)
    const credentialsFromDB = await getCredentialsFromDB();
    
    if (credentialsFromDB) {
      console.log('📥 Using credentials from database');
      // Create temporary file with credentials (GA4 client requires file path)
      // Use /tmp directory which is persistent in Render
      const tmpDir = os.tmpdir();
      const tmpCredentialsFile = path.join(tmpDir, 'ga4-credentials-tmp.json');
      
      try {
        // Write credentials to temp file
        await fs.writeFile(tmpCredentialsFile, JSON.stringify(credentialsFromDB, null, 2), 'utf8');
        console.log('✅ Temp credentials file created:', tmpCredentialsFile);
        
        // Clear any existing invalid env var FIRST
        delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
        
        // Verify file was created
        try {
          await fs.access(tmpCredentialsFile);
          console.log('✅ Temp credentials file verified');
        } catch (accessError) {
          console.error('❌ Temp credentials file not accessible:', accessError);
          throw new Error('Failed to create accessible temp credentials file');
        }
        
        // Set environment variable for the client
        process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpCredentialsFile;
        console.log('✅ GOOGLE_APPLICATION_CREDENTIALS set to:', tmpCredentialsFile);
        console.log('✅ GOOGLE_APPLICATION_CREDENTIALS value type:', typeof process.env.GOOGLE_APPLICATION_CREDENTIALS);
        console.log('✅ GOOGLE_APPLICATION_CREDENTIALS starts with {?', process.env.GOOGLE_APPLICATION_CREDENTIALS?.startsWith('{'));
        
        // Create client with explicit options to avoid reading from env var incorrectly
        const client = new BetaAnalyticsDataClient({
          keyFilename: tmpCredentialsFile
        });
        console.log('✅ GA4 client initialized successfully');
        
        // Don't restore - keep the temp file path
        // The temp file will be reused on subsequent calls
        
        return client;
      } catch (fileError) {
        console.error('❌ Error creating temp credentials file:', fileError);
        // Fall through to file-based credentials
      }
    }
    
    // Fallback to file-based credentials
    const credentialsPath = getCredentialsPath();
    
    if (!credentialsPath) {
      console.log('⚠️ No credentials path available');
      return null;
    }
    
    // Verify credentialsPath is valid before using
    if (typeof credentialsPath !== 'string' || credentialsPath.trim().startsWith('{')) {
      console.error('❌ Invalid credentials path (looks like JSON object):', credentialsPath?.substring(0, 50));
      return null;
    }
    
    console.log('📥 Using credentials from file:', credentialsPath);
    
    // Clear any existing invalid env var
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    // Set environment variable for the client
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
    
    const client = new BetaAnalyticsDataClient();
    console.log('✅ GA4 client initialized successfully');
    
    return client;
  } catch (error) {
    console.error('❌ Error initializing GA4 client:', error);
    return null;
  }
}

export function getPropertyId() {
  return getGA4PropertyId() || process.env.GA4_PROPERTY_ID;
}

