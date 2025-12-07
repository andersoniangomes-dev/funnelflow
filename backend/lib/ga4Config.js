import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { sql, isDatabaseAvailable } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_DIR = path.join(__dirname, '../config');
const CONFIG_FILE = path.join(CONFIG_DIR, 'ga4-config.json');
const CREDENTIALS_FILE = path.join(CONFIG_DIR, 'service-account-key.json');

// Get credentials from database (preferred for cloud environments like Render)
export async function getCredentialsFromDB() {
  if (!isDatabaseAvailable()) {
    return null;
  }
  
  try {
    const result = await sql`
      SELECT credentials, property_id
      FROM ga4_config
      ORDER BY updated_at DESC
      LIMIT 1
    `;
    
    if (result.length > 0 && result[0].credentials) {
      // Set property ID in environment
      if (result[0].property_id) {
        process.env.GA4_PROPERTY_ID = result[0].property_id;
      }
      
      // Return credentials as object (not file path)
      return result[0].credentials;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading credentials from database:', error);
    return null;
  }
}

// Load GA4 configuration from saved config
export async function loadGA4Config() {
  // Try database first
  const credentialsFromDB = await getCredentialsFromDB();
  if (credentialsFromDB) {
    return {
      propertyId: process.env.GA4_PROPERTY_ID,
      credentials: credentialsFromDB,
      credentialsPath: null
    };
  }
  
  // Fallback to file-based storage
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

