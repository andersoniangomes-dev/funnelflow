import express from 'express';
import dotenv from 'dotenv';
import { getAnalyticsClient, getPropertyId } from '../lib/ga4Client.js';

dotenv.config();

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const propertyId = getPropertyId();
    const { startDate = '30daysAgo', endDate = 'today' } = req.query;

    if (!propertyId) {
      return res.status(400).json({
        error: 'GA4 Property ID not configured'
      });
    }

    const analyticsDataClient = await getAnalyticsClient();
    
    if (!analyticsDataClient) {
      return res.status(503).json({
        error: 'GA4 client not initialized. Check your credentials.'
      });
    }

    // Fetch KPIs from GA4
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: startDate,
          endDate: endDate,
        },
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'conversions' },
        { name: 'totalUsers' },
      ],
    });

    const rows = response.rows || [];
    const metrics = rows[0]?.metricValues || [];

    // Extract metrics
    const users = parseInt(metrics[0]?.value || '0');
    const sessions = parseInt(metrics[1]?.value || '0');
    const conversions = parseInt(metrics[2]?.value || '0');
    const totalUsers = parseInt(metrics[3]?.value || '0');

    // Calculate conversion rate
    const conversionRate = sessions > 0 
      ? ((conversions / sessions) * 100).toFixed(2)
      : '0.00';

    // Get previous period for comparison
    const previousStartDate = calculatePreviousPeriod(startDate, endDate);
    
    const [previousResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: previousStartDate.start,
          endDate: previousStartDate.end,
        },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'conversions' },
        { name: 'totalUsers' },
      ],
    });

    const previousRows = previousResponse.rows || [];
    const previousMetrics = previousRows[0]?.metricValues || [];
    const previousSessions = parseInt(previousMetrics[0]?.value || '0');
    const previousConversions = parseInt(previousMetrics[1]?.value || '0');
    const previousUsers = parseInt(previousMetrics[2]?.value || '0');

    // Calculate changes
    const sessionsChange = previousSessions > 0
      ? (((sessions - previousSessions) / previousSessions) * 100).toFixed(1)
      : '0.0';
    
    const usersChange = previousUsers > 0
      ? (((totalUsers - previousUsers) / previousUsers) * 100).toFixed(1)
      : '0.0';
    
    const conversionsChange = previousConversions > 0
      ? (((conversions - previousConversions) / previousConversions) * 100).toFixed(1)
      : '0.0';

    const previousConversionRate = previousSessions > 0
      ? ((previousConversions / previousSessions) * 100).toFixed(2)
      : '0.00';
    
    const conversionRateChange = parseFloat(previousConversionRate) > 0
      ? (((parseFloat(conversionRate) - parseFloat(previousConversionRate)) / parseFloat(previousConversionRate)) * 100).toFixed(1)
      : '0.0';

    res.json({
      sessions: {
        value: sessions.toLocaleString('pt-BR'),
        change: parseFloat(sessionsChange),
        changeLabel: 'vs período anterior'
      },
      users: {
        value: totalUsers.toLocaleString('pt-BR'),
        change: parseFloat(usersChange),
        changeLabel: 'vs período anterior'
      },
      conversions: {
        value: conversions.toLocaleString('pt-BR'),
        change: parseFloat(conversionsChange),
        changeLabel: 'vs período anterior'
      },
      conversionRate: {
        value: `${conversionRate}%`,
        change: parseFloat(conversionRateChange),
        changeLabel: 'vs período anterior'
      },
      period: {
        startDate,
        endDate
      }
    });

  } catch (error) {
    console.error('KPIs error:', error);
    res.status(500).json({
      error: 'Failed to fetch KPIs',
      message: error.message
    });
  }
});

// Helper function to calculate previous period
function calculatePreviousPeriod(startDate, endDate) {
  // Simple implementation - assumes 30 days
  // You can enhance this to handle different date ranges
  const daysDiff = 30; // Default to 30 days
  
  return {
    start: `${daysDiff * 2}daysAgo`,
    end: `${daysDiff}daysAgo`
  };
}

export default router;

