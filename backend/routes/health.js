import express from 'express';
import dotenv from 'dotenv';
import { getAnalyticsClient, getPropertyId } from '../lib/ga4Client.js';
import { getCredentialsPath } from '../lib/ga4Config.js';

dotenv.config();

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const propertyId = getPropertyId();
    
    // Check if GA4 is configured
    if (!propertyId) {
      return res.status(503).json({
        status: 'error',
        ga4: 'not_configured',
        message: 'GA4 Property ID not configured. Please set GA4_PROPERTY_ID in .env'
      });
    }

    const credentialsPath = getCredentialsPath() || process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    if (!credentialsPath) {
      return res.status(503).json({
        status: 'error',
        ga4: 'not_configured',
        message: 'Google credentials not configured. Please set GOOGLE_APPLICATION_CREDENTIALS in .env'
      });
    }

    // Test connection to GA4
    const analyticsDataClient = getAnalyticsClient();
    
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

        return res.json({
          status: 'ok',
          ga4: 'connected',
          propertyId: propertyId,
          message: 'Backend connected to Google Analytics 4 successfully'
        });
      } catch (ga4Error) {
        console.error('GA4 connection error:', ga4Error);
        return res.status(503).json({
          status: 'error',
          ga4: 'connection_failed',
          message: 'Failed to connect to GA4. Check your credentials and property ID.',
          error: ga4Error.message
        });
      }
    }

    return res.status(503).json({
      status: 'error',
      ga4: 'not_initialized',
      message: 'GA4 client not initialized'
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      ga4: 'unknown_error',
      message: error.message
    });
  }
});

export default router;

