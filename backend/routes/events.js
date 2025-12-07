import express from 'express';
import dotenv from 'dotenv';
import { getAnalyticsClient, getPropertyId } from '../lib/ga4Client.js';

dotenv.config();

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const propertyId = getPropertyId();
    const { startDate = '30daysAgo', endDate = 'today' } = req.query;

    const analyticsDataClient = await getAnalyticsClient();
    
    if (!propertyId || !analyticsDataClient) {
      return res.status(503).json({
        error: 'GA4 not configured'
      });
    }

    // Fetch events from GA4
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: startDate,
          endDate: endDate,
        },
      ],
      dimensions: [{ name: 'eventName' }],
      metrics: [
        { name: 'eventCount' },
        { name: 'totalUsers' },
      ],
      orderBys: [
        {
          metric: { metricName: 'eventCount' },
          desc: true,
        },
      ],
      limit: 50,
    });

    const events = (response.rows || []).map(row => {
      const eventName = row.dimensionValues[0]?.value || 'unknown';
      const count = parseInt(row.metricValues[0]?.value || '0');
      const users = parseInt(row.metricValues[1]?.value || '0');
      
      return {
        name: eventName,
        count: count,
        users: users,
        averagePerUser: users > 0 ? (count / users).toFixed(2) : '0.00',
        status: 'ativo' // You can add logic to determine status
      };
    });

    // Always return events array, even if empty
    res.json({
      events: events || [],
      period: {
        startDate,
        endDate
      },
      total: events.length
    });

  } catch (error) {
    console.error('Events error:', error);
    res.status(500).json({
      error: 'Failed to fetch events',
      message: error.message
    });
  }
});

export default router;

