import express from 'express';
import dotenv from 'dotenv';
import { getAnalyticsClient, getPropertyId } from '../lib/ga4Client.js';

dotenv.config();

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const propertyId = getPropertyId();
    const { 
      startDate = '30daysAgo', 
      endDate = 'today',
      steps = 'page_view,click_cta,view_checkout,purchase'
    } = req.query;

    const analyticsDataClient = getAnalyticsClient();
    
    if (!propertyId || !analyticsDataClient) {
      return res.status(503).json({
        error: 'GA4 not configured'
      });
    }

    // Parse funnel steps
    const funnelSteps = steps.split(',').map(s => s.trim());

    // Fetch funnel data
    // Note: GA4 doesn't have a direct funnel report, so we'll simulate it
    // by fetching each step's event count
    const funnelData = [];

    for (let i = 0; i < funnelSteps.length; i++) {
      const step = funnelSteps[i];
      
      try {
        const [response] = await analyticsDataClient.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [
            {
              startDate: startDate,
              endDate: endDate,
            },
          ],
          dimensions: [{ name: 'eventName' }],
          metrics: [{ name: 'totalUsers' }],
          dimensionFilter: {
            filter: {
              fieldName: 'eventName',
              stringFilter: {
                matchType: 'EXACT',
                value: step,
              },
            },
          },
        });

        const users = parseInt(response.rows?.[0]?.metricValues?.[0]?.value || '0');
        const previousUsers = i > 0 ? funnelData[i - 1].users : users;
        const dropoff = previousUsers > 0 
          ? (((previousUsers - users) / previousUsers) * 100).toFixed(1)
          : '0.0';
        const rate = i === 0 ? 100 : previousUsers > 0
          ? ((users / previousUsers) * 100).toFixed(1)
          : '0.0';

        funnelData.push({
          name: step,
          users: users,
          dropoff: parseFloat(dropoff),
          rate: parseFloat(rate)
        });
      } catch (error) {
        console.error(`Error fetching step ${step}:`, error);
        funnelData.push({
          name: step,
          users: 0,
          dropoff: 0,
          rate: 0
        });
      }
    }

    // Calculate totals
    const totalUsers = funnelData[0]?.users || 0;
    const finalUsers = funnelData[funnelData.length - 1]?.users || 0;
    const totalConversionRate = totalUsers > 0
      ? ((finalUsers / totalUsers) * 100).toFixed(2)
      : '0.00';
    const totalDropoffs = totalUsers - finalUsers;

    res.json({
      steps: funnelData,
      summary: {
        totalConversionRate: `${totalConversionRate}%`,
        totalDropoffs: totalDropoffs.toLocaleString('pt-BR'),
        totalUsers: totalUsers.toLocaleString('pt-BR'),
        finalUsers: finalUsers.toLocaleString('pt-BR')
      },
      period: {
        startDate,
        endDate
      }
    });

  } catch (error) {
    console.error('Funnel error:', error);
    res.status(500).json({
      error: 'Failed to fetch funnel data',
      message: error.message
    });
  }
});

export default router;

