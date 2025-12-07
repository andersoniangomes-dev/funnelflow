import express from 'express';
import dotenv from 'dotenv';
import { getAnalyticsClient, getPropertyId } from '../lib/ga4Client.js';
import { getCredentialsPath } from '../lib/ga4Config.js';

dotenv.config();

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const propertyId = getPropertyId();
    
    // Always return 200 OK if backend is running
    // GA4 status is informational, not a blocker for health check
    // This allows UptimeRobot to keep the service active even if GA4 is not configured
    
    // Check if GA4 is configured
    if (!propertyId) {
      return res.status(200).json({
        status: 'ok',
        ga4: 'not_configured',
        message: 'Backend is running. GA4 Property ID not configured. Please set GA4_PROPERTY_ID in .env',
        propertyId: null
      });
    }

    // Try to get credentials from database first (preferred)
    // Don't check GOOGLE_APPLICATION_CREDENTIALS directly as it might contain JSON object
    const credentialsPath = getCredentialsPath();
    
    // If no valid credentials path, try database
    if (!credentialsPath) {
      // Check if we have credentials in database
      const { getCredentialsFromDB } = await import('../lib/ga4Config.js');
      const credentialsFromDB = await getCredentialsFromDB();
      
      if (!credentialsFromDB) {
        return res.status(200).json({
          status: 'ok',
          ga4: 'not_configured',
          message: 'Backend is running. Google credentials not configured. Please configure GA4 in Settings.',
          propertyId: propertyId
        });
      }
      // If we have credentials in DB, continue to test connection
    }

    // Test connection to GA4 (but don't fail health check if it fails)
    const analyticsDataClient = await getAnalyticsClient();
    
    if (analyticsDataClient) {
      try {
        // Try to fetch a simple report to verify connection
        const [response] = await analyticsDataClient.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [
            {
              startDate: '7daysAgo',
              endDate: 'today',
            },
          ],
          dimensions: [{ name: 'date' }],
          metrics: [{ name: 'activeUsers' }],
          limit: 1,
        });

        return res.status(200).json({
          status: 'ok',
          ga4: 'connected',
          propertyId: propertyId,
          message: 'Backend connected to Google Analytics 4 successfully'
        });
      } catch (ga4Error) {
        console.error('GA4 connection error:', ga4Error);
        // Return 200 OK even if GA4 connection fails - backend is still healthy
        return res.status(200).json({
          status: 'ok',
          ga4: 'connection_failed',
          message: 'Backend is running. Failed to connect to GA4. Check your credentials and property ID.',
          error: ga4Error.message,
          propertyId: propertyId
        });
      }
    }

    return res.status(200).json({
      status: 'ok',
      ga4: 'not_initialized',
      message: 'Backend is running. GA4 client not initialized',
      propertyId: propertyId
    });

  } catch (error) {
    console.error('Health check error:', error);
    // Only return 500 for critical errors, not for GA4 issues
    res.status(500).json({
      status: 'error',
      ga4: 'unknown_error',
      message: error.message
    });
  }
});

export default router;

