import express from 'express';
import dotenv from 'dotenv';
import { getAnalyticsClient, getPropertyId } from '../lib/ga4Client.js';

dotenv.config();

const router = express.Router();

router.get('/sources', async (req, res) => {
  try {
    const propertyId = getPropertyId();
    const { startDate = '30daysAgo', endDate = 'today' } = req.query;

    if (!propertyId || !analyticsDataClient) {
      return res.status(503).json({
        error: 'GA4 not configured'
      });
    }

    // Fetch traffic sources
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: startDate,
          endDate: endDate,
        },
      ],
      dimensions: [
        { name: 'sessionSource' },
        { name: 'sessionMedium' }
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'conversions' },
        { name: 'totalRevenue' },
      ],
      orderBys: [
        {
          metric: { metricName: 'sessions' },
          desc: true,
        },
      ],
      limit: 20,
    });

    const sources = (response.rows || []).map(row => {
      const source = row.dimensionValues[0]?.value || 'unknown';
      const medium = row.dimensionValues[1]?.value || 'unknown';
      const sessions = parseInt(row.metricValues[0]?.value || '0');
      const conversions = parseInt(row.metricValues[1]?.value || '0');
      const revenue = parseFloat(row.metricValues[2]?.value || '0');
      const conversionRate = sessions > 0
        ? ((conversions / sessions) * 100).toFixed(2)
        : '0.00';

      return {
        source: source,
        medium: medium,
        sessions: sessions,
        conversions: conversions,
        conversionRate: `${conversionRate}%`,
        revenue: revenue
      };
    });

    res.json({
      sources,
      period: {
        startDate,
        endDate
      }
    });

  } catch (error) {
    console.error('Traffic sources error:', error);
    res.status(500).json({
      error: 'Failed to fetch traffic sources',
      message: error.message
    });
  }
});

router.get('/campaigns', async (req, res) => {
  try {
    const propertyId = getPropertyId();
    const { startDate = '30daysAgo', endDate = 'today' } = req.query;

    const analyticsDataClient = getAnalyticsClient();
    
    if (!propertyId || !analyticsDataClient) {
      return res.status(503).json({
        error: 'GA4 not configured'
      });
    }

    // Fetch campaigns
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: startDate,
          endDate: endDate,
        },
      ],
      dimensions: [{ name: 'sessionCampaignName' }],
      metrics: [
        { name: 'sessions' },
        { name: 'conversions' },
        { name: 'totalRevenue' },
      ],
      orderBys: [
        {
          metric: { metricName: 'sessions' },
          desc: true,
        },
      ],
      limit: 20,
    });

    const campaigns = (response.rows || []).map(row => {
      const name = row.dimensionValues[0]?.value || 'unknown';
      const sessions = parseInt(row.metricValues[0]?.value || '0');
      const conversions = parseInt(row.metricValues[1]?.value || '0');
      const revenue = parseFloat(row.metricValues[2]?.value || '0');
      const conversionRate = sessions > 0
        ? ((conversions / sessions) * 100).toFixed(2)
        : '0.00';

      return {
        name: name,
        sessions: sessions,
        conversions: conversions,
        conversionRate: `${conversionRate}%`,
        revenue: revenue
      };
    });

    res.json({
      campaigns,
      period: {
        startDate,
        endDate
      }
    });

  } catch (error) {
    console.error('Campaigns error:', error);
    res.status(500).json({
      error: 'Failed to fetch campaigns',
      message: error.message
    });
  }
});

export default router;

