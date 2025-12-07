import express from 'express';
import dotenv from 'dotenv';
import { getAnalyticsClient, getPropertyId } from '../lib/ga4Client.js';
import { sql, isDatabaseAvailable } from '../lib/db.js';

dotenv.config();

const router = express.Router();

router.get('/sources', async (req, res) => {
  try {
    const propertyId = getPropertyId();
    const { startDate = '30daysAgo', endDate = 'today' } = req.query;

    const analyticsDataClient = await getAnalyticsClient();
    
    if (!propertyId || !analyticsDataClient) {
      return res.status(503).json({
        error: 'GA4 not configured'
      });
    }

    // Get UTM sources from database
    let utmSources = [];
    if (isDatabaseAvailable()) {
      try {
        const savedUTMs = await sql`
          SELECT DISTINCT source, medium, campaign
          FROM saved_utms
          WHERE source IS NOT NULL AND source != ''
        `;
        utmSources = savedUTMs.map(u => ({
          source: u.source,
          medium: u.medium || 'unknown',
          campaign: u.campaign || 'unknown'
        }));
        console.log(`📊 Encontrados ${utmSources.length} fontes UTM no banco de dados`);
      } catch (dbError) {
        console.warn('⚠️ Erro ao buscar UTMs do banco:', dbError.message);
      }
    }

    // Fetch traffic sources from GA4 using utm_source dimension
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: startDate,
          endDate: endDate,
        },
      ],
      dimensions: [
        { name: 'sessionSource' }, // This includes utm_source
        { name: 'sessionMedium' }  // This includes utm_medium
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
      limit: 50, // Increased to capture more sources
    });

    // Process GA4 sources
    const ga4Sources = (response.rows || []).map(row => {
      const source = row.dimensionValues[0]?.value || 'unknown';
      const medium = row.dimensionValues[1]?.value || 'unknown';
      const sessions = parseInt(row.metricValues[0]?.value || '0');
      let conversions = parseInt(row.metricValues[1]?.value || '0');
      const revenue = parseFloat(row.metricValues[2]?.value || '0');
      
      // Add begin_checkout as conversion for this source
      // Note: We'll add begin_checkout to total conversions later
      
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

    // Merge UTM sources with GA4 sources
    // Prioritize UTM sources that exist in saved UTMs
    const sourceMap = new Map();
    
    // First, add all GA4 sources
    ga4Sources.forEach(s => {
      const key = `${s.source}_${s.medium}`;
      sourceMap.set(key, s);
    });

    // Then, ensure UTM sources are included (even if they have 0 sessions in GA4)
    utmSources.forEach(utm => {
      const key = `${utm.source}_${utm.medium}`;
      if (!sourceMap.has(key)) {
        // Add UTM source with 0 sessions if not in GA4
        sourceMap.set(key, {
          source: utm.source,
          medium: utm.medium,
          sessions: 0,
          conversions: 0,
          conversionRate: '0.00%',
          revenue: 0
        });
      }
    });

    // Convert map to array and sort by sessions
    const sources = Array.from(sourceMap.values())
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 20); // Limit to top 20

    // Add begin_checkout events to conversions for each source
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
          { name: 'sessionSource' },
          { name: 'sessionMedium' }
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
        limit: 50,
      });

      // Add begin_checkout counts to conversions
      beginCheckoutResponse.rows?.forEach(row => {
        // eventName is first dimension, then sessionSource, then sessionMedium
        const source = row.dimensionValues[1]?.value || 'unknown';
        const medium = row.dimensionValues[2]?.value || 'unknown';
        const beginCheckoutCount = parseInt(row.metricValues[0]?.value || '0');
        
        const key = `${source}_${medium}`;
        const sourceData = sourceMap.get(key);
        if (sourceData) {
          sourceData.conversions += beginCheckoutCount;
          sourceData.conversionRate = sourceData.sessions > 0
            ? ((sourceData.conversions / sourceData.sessions) * 100).toFixed(2)
            : '0.00';
          sourceData.conversionRate = `${sourceData.conversionRate}%`;
        }
      });

      console.log(`✅ Adicionados eventos begin_checkout às conversões por fonte`);
    } catch (error) {
      console.warn('⚠️ Erro ao buscar eventos begin_checkout por fonte:', error.message);
    }

    // Re-sort after adding begin_checkout
    const finalSources = Array.from(sourceMap.values())
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 20);

    res.json({
      sources: finalSources,
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

    const analyticsDataClient = await getAnalyticsClient();
    
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
      let conversions = parseInt(row.metricValues[1]?.value || '0');
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

    // Add begin_checkout events to conversions for campaigns
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
          { name: 'sessionCampaignName' }
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
        limit: 20,
      });

      // Create a map for quick lookup
      const campaignMap = new Map(campaigns.map(c => [c.name, c]));

      // Add begin_checkout counts to conversions
      beginCheckoutResponse.rows?.forEach(row => {
        // eventName is first dimension, then sessionCampaignName
        const campaignName = row.dimensionValues[1]?.value || 'unknown';
        const beginCheckoutCount = parseInt(row.metricValues[0]?.value || '0');
        
        const campaign = campaignMap.get(campaignName);
        if (campaign) {
          campaign.conversions += beginCheckoutCount;
          campaign.conversionRate = campaign.sessions > 0
            ? ((campaign.conversions / campaign.sessions) * 100).toFixed(2)
            : '0.00';
          campaign.conversionRate = `${campaign.conversionRate}%`;
        }
      });

      console.log(`✅ Adicionados eventos begin_checkout às conversões por campanha`);
    } catch (error) {
      console.warn('⚠️ Erro ao buscar eventos begin_checkout por campanha:', error.message);
    }

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

