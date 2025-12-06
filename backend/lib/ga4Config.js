import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_DIR = path.join(__dirname, '../config');
const CONFIG_FILE = path.join(CONFIG_DIR, 'ga4-config.json');
const CREDENTIALS_FILE = path.join(CONFIG_DIR, 'service-account-key.json');

// Load GA4 configuration from saved config
export async function loadGA4Config() {
  try {
    const configData = await fs.readFile(CONFIG_FILE, 'utf8');
    const config = JSON.parse(configData);
    
    // Set environment variables
    if (config.propertyId) {
      process.env.GA4_PROPERTY_ID = config.propertyId;
    }
    
    if (config.credentialsPath) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = config.credentialsPath;
    }
    
    return {
      propertyId: config.propertyId,
      credentialsPath: config.credentialsPath
    };
  } catch (error) {
    // Config doesn't exist, use environment variables as fallback
    return {
      propertyId: process.env.GA4_PROPERTY_ID,
      credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS
    };
  }
}

// Get GA4 Property ID
export function getGA4PropertyId() {
  return process.env.GA4_PROPERTY_ID;
}

// Get credentials path
export function getCredentialsPath() {
  return process.env.GOOGLE_APPLICATION_CREDENTIALS;
}

