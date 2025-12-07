import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { sql, isDatabaseAvailable } from '../lib/db.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to store config (fallback)
const CONFIG_DIR = path.join(__dirname, '../config');
const CONFIG_FILE = path.join(CONFIG_DIR, 'ga4-config.json');
const CREDENTIALS_FILE = path.join(CONFIG_DIR, 'service-account-key.json');

// Ensure config directory exists
async function ensureConfigDir() {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating config directory:', error);
  }
}

// Get current configuration
router.get('/', async (req, res) => {
  try {
    // Try database first
    if (isDatabaseAvailable()) {
      try {
        const result = await sql`
          SELECT * FROM ga4_config
          ORDER BY updated_at DESC
          LIMIT 1
        `;

        if (result.length > 0) {
          const config = result[0];
          return res.json({
            propertyId: config.property_id || '',
            hasCredentials: !!config.credentials,
            credentialsPath: null, // Not needed when using DB
            configured: !!(config.property_id && config.credentials)
          });
        }
      } catch (dbError) {
        console.error('Error reading from database, using fallback:', dbError);
        // Fall through to file-based fallback
      }
    }

    // Fallback to file-based storage
    await ensureConfigDir();
    
    try {
      const configData = await fs.readFile(CONFIG_FILE, 'utf8');
      const config = JSON.parse(configData);
      
      res.json({
        propertyId: config.propertyId || '',
        hasCredentials: !!config.credentials,
        credentialsPath: config.credentialsPath || null,
        configured: !!(config.propertyId && config.credentials)
      });
    } catch (error) {
      // Config file doesn't exist
      res.json({
        propertyId: '',
        hasCredentials: false,
        credentialsPath: null,
        configured: false
      });
    }
  } catch (error) {
    console.error('Error reading config:', error);
    res.status(500).json({
      error: 'Failed to read configuration',
      message: error.message
    });
  }
});

// Save configuration
router.post('/', async (req, res) => {
  try {
    const { propertyId, credentials } = req.body;
    
    if (!propertyId) {
      return res.status(400).json({
        error: 'Property ID is required'
      });
    }
    
    if (!credentials) {
      return res.status(400).json({
        error: 'Service Account credentials are required'
      });
    }
    
    // Validate credentials JSON
    let credentialsObj;
    try {
      credentialsObj = typeof credentials === 'string' ? JSON.parse(credentials) : credentials;
      
      // Validate required fields
      if (!credentialsObj.type || !credentialsObj.project_id || !credentialsObj.private_key || !credentialsObj.client_email) {
        return res.status(400).json({
          error: 'Invalid credentials format. Missing required fields.'
        });
      }
    } catch (parseError) {
      return res.status(400).json({
        error: 'Invalid JSON format for credentials',
        message: parseError.message
      });
    }

    // Try database first
    if (isDatabaseAvailable()) {
      try {
        // Use UPSERT (INSERT ... ON CONFLICT)
        await sql`
          INSERT INTO ga4_config (property_id, credentials, updated_at)
          VALUES (${propertyId.trim()}, ${JSON.stringify(credentialsObj)}::jsonb, CURRENT_TIMESTAMP)
          ON CONFLICT (property_id) 
          DO UPDATE SET 
            credentials = EXCLUDED.credentials,
            updated_at = CURRENT_TIMESTAMP
        `;

        // Set environment variable for current process
        process.env.GA4_PROPERTY_ID = propertyId.trim();
        // For database mode, don't set GOOGLE_APPLICATION_CREDENTIALS here
        // It will be set dynamically by ga4Client when needed using temp file
        // This prevents issues where the env var might contain JSON object instead of file path

        return res.json({
          success: true,
          message: 'Configuration saved successfully to database',
          propertyId: propertyId.trim(),
          hasCredentials: true
        });
      } catch (dbError) {
        console.error('Error saving to database, using fallback:', dbError);
        // Fall through to file-based fallback
      }
    }

    // Fallback to file-based storage
    await ensureConfigDir();
    
    // Save credentials file
    await fs.writeFile(
      CREDENTIALS_FILE,
      JSON.stringify(credentialsObj, null, 2),
      'utf8'
    );
    
    // Save configuration
    const config = {
      propertyId: propertyId.trim(),
      credentialsPath: CREDENTIALS_FILE,
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeFile(
      CONFIG_FILE,
      JSON.stringify(config, null, 2),
      'utf8'
    );
    
    // Set environment variable for current process
    process.env.GA4_PROPERTY_ID = config.propertyId;
    process.env.GOOGLE_APPLICATION_CREDENTIALS = CREDENTIALS_FILE;
    
    res.json({
      success: true,
      message: 'Configuration saved successfully',
      propertyId: config.propertyId,
      hasCredentials: true
    });
    
  } catch (error) {
    console.error('Error saving config:', error);
    res.status(500).json({
      error: 'Failed to save configuration',
      message: error.message
    });
  }
});

// Delete configuration
router.delete('/', async (req, res) => {
  try {
    // Try database first
    if (isDatabaseAvailable()) {
      try {
        await sql`DELETE FROM ga4_config`;
        // Also delete files for consistency
        try {
          await fs.unlink(CONFIG_FILE);
        } catch (error) {
          // File doesn't exist, that's ok
        }
        try {
          await fs.unlink(CREDENTIALS_FILE);
        } catch (error) {
          // File doesn't exist, that's ok
        }
        
        delete process.env.GA4_PROPERTY_ID;
        delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
        
        return res.json({
          success: true,
          message: 'Configuration deleted successfully'
        });
      } catch (dbError) {
        console.error('Error deleting from database, using fallback:', dbError);
        // Fall through to file-based deletion
      }
    }

    // Fallback to file-based deletion
    await ensureConfigDir();
    
    try {
      await fs.unlink(CONFIG_FILE);
    } catch (error) {
      // File doesn't exist, that's ok
    }
    
    try {
      await fs.unlink(CREDENTIALS_FILE);
    } catch (error) {
      // File doesn't exist, that's ok
    }
    
    delete process.env.GA4_PROPERTY_ID;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    res.json({
      success: true,
      message: 'Configuration deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting config:', error);
    res.status(500).json({
      error: 'Failed to delete configuration',
      message: error.message
    });
  }
});

export default router;

