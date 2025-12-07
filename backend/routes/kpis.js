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
    let conversions = parseInt(metrics[2]?.value || '0');
    const totalUsers = parseInt(metrics[3]?.value || '0');

    // Add begin_checkout events as conversions
    try {
      const [beginCheckoutResponse] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
          {
            startDate: startDate,
            endDate: endDate,
          },
        ],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            stringFilter: {
              matchType: 'EXACT',
              value: 'begin_checkout',
            },
          },
        },
      });

      const beginCheckoutCount = beginCheckoutResponse.rows?.reduce((sum, row) => {
        return sum + parseInt(row.metricValues?.[0]?.value || '0');
      }, 0) || 0;

      conversions += beginCheckoutCount;
      console.log(`✅ Adicionados ${beginCheckoutCount} eventos begin_checkout como conversões`);
    } catch (error) {
      console.warn('⚠️ Erro ao buscar eventos begin_checkout:', error.message);
      // Continue with original conversions count
    }

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
    let previousConversions = parseInt(previousMetrics[1]?.value || '0');
    const previousUsers = parseInt(previousMetrics[2]?.value || '0');

    // Add begin_checkout events as conversions for previous period
    try {
      const [previousBeginCheckoutResponse] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
          {
            startDate: previousStartDate.start,
            endDate: previousStartDate.end,
          },
        ],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            stringFilter: {
              matchType: 'EXACT',
              value: 'begin_checkout',
            },
          },
        },
      });

      const previousBeginCheckoutCount = previousBeginCheckoutResponse.rows?.reduce((sum, row) => {
        return sum + parseInt(row.metricValues?.[0]?.value || '0');
      }, 0) || 0;

      previousConversions += previousBeginCheckoutCount;
      console.log(`✅ Adicionados ${previousBeginCheckoutCount} eventos begin_checkout do período anterior como conversões`);
    } catch (error) {
      console.warn('⚠️ Erro ao buscar eventos begin_checkout do período anterior:', error.message);
      // Continue with original conversions count
    }

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

// Get sessions and conversions over time (for charts)
router.get('/sessions-over-time', async (req, res) => {
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

    // Fetch sessions and conversions by date
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: startDate,
          endDate: endDate,
        },
      ],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'sessions' },
        { name: 'conversions' },
      ],
      orderBys: [
        {
          dimension: { dimensionName: 'date' },
        },
      ],
    });

    const data = (response.rows || []).map(row => {
      const dateStr = row.dimensionValues[0]?.value || '';
      // Format date: YYYYMMDD -> DD/MM
      const formattedDate = dateStr.length === 8 
        ? `${dateStr.substring(6, 8)}/${dateStr.substring(4, 6)}`
        : dateStr;
      
      const sessions = parseInt(row.metricValues[0]?.value || '0');
      let conversions = parseInt(row.metricValues[1]?.value || '0');

      return {
        date: formattedDate,
        sessoes: sessions,
        conversoes: conversions
      };
    });

    // Add begin_checkout events to conversions by date
    try {
      const [beginCheckoutResponse] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
          {
            startDate: startDate,
            endDate: endDate,
          },
        ],
        dimensions: [
          { name: 'eventName' },
          { name: 'date' }
        ],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            stringFilter: {
              matchType: 'EXACT',
              value: 'begin_checkout',
            },
          },
        },
      });

      // Create a map for quick lookup
      const dataMap = new Map(data.map(d => [d.date, d]));

      // Add begin_checkout counts to conversions
      beginCheckoutResponse.rows?.forEach(row => {
        const dateStr = row.dimensionValues[1]?.value || '';
        const formattedDate = dateStr.length === 8 
          ? `${dateStr.substring(6, 8)}/${dateStr.substring(4, 6)}`
          : dateStr;
        const beginCheckoutCount = parseInt(row.metricValues[0]?.value || '0');
        
        const dayData = dataMap.get(formattedDate);
        if (dayData) {
          dayData.conversoes += beginCheckoutCount;
        }
      });

      console.log(`✅ Adicionados eventos begin_checkout às conversões por data`);
    } catch (error) {
      console.warn('⚠️ Erro ao buscar eventos begin_checkout por data:', error.message);
    }

    res.json({
      data: data,
      period: {
        startDate,
        endDate
      }
    });

  } catch (error) {
    console.error('Sessions over time error:', error);
    res.status(500).json({
      error: 'Failed to fetch sessions over time',
      message: error.message
    });
  }
});

export default router;

