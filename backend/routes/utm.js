import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { sql, isDatabaseAvailable } from '../lib/db.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to store UTM click data (fallback)
const DATA_DIR = path.join(__dirname, '../data');
const CLICKS_FILE = path.join(DATA_DIR, 'utm-clicks.json');

// Ensure data directory exists (for fallback)
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

// Load clicks data (fallback - JSON file)
async function loadClicks() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(CLICKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// Save clicks data (fallback - JSON file)
async function saveClicks(clicks) {
  try {
    await ensureDataDir();
    await fs.writeFile(CLICKS_FILE, JSON.stringify(clicks, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving clicks:', error);
  }
}

// Track a click
router.get('/track/:utmId', async (req, res) => {
  try {
    const { utmId } = req.params;
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        error: 'URL parameter is required'
      });
    }

    const decodedUrl = decodeURIComponent(url);
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const referer = req.headers['referer'] || 'unknown';

    // Use database if available, otherwise fallback to JSON
    if (isDatabaseAvailable()) {
      try {
        await sql`
          INSERT INTO utm_clicks (utm_id, url, ip, user_agent, referer, timestamp)
          VALUES (${utmId}, ${decodedUrl}, ${ip}, ${userAgent}, ${referer}, CURRENT_TIMESTAMP)
        `;
        console.log(`✅ Clique registrado no banco de dados para UTM ${utmId}`);
      } catch (dbError) {
        console.error('Erro ao salvar no banco de dados, usando fallback JSON:', dbError);
        // Fallback to JSON
        const clicks = await loadClicks();
        if (!clicks[utmId]) {
          clicks[utmId] = { totalClicks: 0, clicks: [], lastClick: null };
        }
        clicks[utmId].clicks.push({
          timestamp: new Date().toISOString(),
          url: decodedUrl,
          ip,
          userAgent,
          referer
        });
        clicks[utmId].totalClicks = clicks[utmId].clicks.length;
        clicks[utmId].lastClick = new Date().toISOString();
        await saveClicks(clicks);
      }
    } else {
      // Use JSON fallback
      const clicks = await loadClicks();
      if (!clicks[utmId]) {
        clicks[utmId] = { totalClicks: 0, clicks: [], lastClick: null };
      }
      clicks[utmId].clicks.push({
        timestamp: new Date().toISOString(),
        url: decodedUrl,
        ip,
        userAgent,
        referer
      });
      clicks[utmId].totalClicks = clicks[utmId].clicks.length;
      clicks[utmId].lastClick = new Date().toISOString();
      
      // Keep only last 1000 clicks per UTM
      if (clicks[utmId].clicks.length > 1000) {
        clicks[utmId].clicks = clicks[utmId].clicks.slice(-1000);
      }
      
      await saveClicks(clicks);
    }

    // Redirect to the actual URL
    res.redirect(decodedUrl);

  } catch (error) {
    console.error('Error tracking click:', error);
    const decodedUrl = decodeURIComponent(req.query.url || '');
    if (decodedUrl) {
      res.redirect(decodedUrl);
    } else {
      res.status(500).json({
        error: 'Failed to track click',
        message: error.message
      });
    }
  }
});

// Get click statistics
router.get('/stats', async (req, res) => {
  try {
    if (isDatabaseAvailable()) {
      // Get stats from database
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const allClicks = await sql`
        SELECT utm_id, timestamp, url, ip, user_agent, referer
        FROM utm_clicks
        ORDER BY timestamp DESC
      `;

      // Group by utm_id
      const statsMap = {};
      allClicks.forEach(click => {
        if (!statsMap[click.utm_id]) {
          statsMap[click.utm_id] = {
            totalClicks: 0,
            recentClicks: [],
            clicks: []
          };
        }
        statsMap[click.utm_id].totalClicks++;
        statsMap[click.utm_id].clicks.push(click);
        
        const clickDate = new Date(click.timestamp);
        if (clickDate >= thirtyDaysAgo) {
          statsMap[click.utm_id].recentClicks.push(click);
        }
      });

      const stats = Object.keys(statsMap).map(utmId => {
        const data = statsMap[utmId];
        const clicksByDate = {};
        
        data.recentClicks.forEach(click => {
          const date = new Date(click.timestamp).toISOString().split('T')[0];
          clicksByDate[date] = (clicksByDate[date] || 0) + 1;
        });

        const lastClick = data.clicks.length > 0 
          ? data.clicks[0].timestamp.toISOString()
          : null;

        return {
          utmId,
          totalClicks: data.totalClicks,
          recentClicks: data.recentClicks.length,
          lastClick,
          clicksByDate
        };
      });

      res.json({
        stats,
        totalUTMs: stats.length,
        totalClicks: stats.reduce((sum, stat) => sum + stat.totalClicks, 0)
      });
    } else {
      // Fallback to JSON
      const clicks = await loadClicks();
      const stats = Object.keys(clicks).map(utmId => {
        const utmData = clicks[utmId];
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentClicks = utmData.clicks.filter(click => {
          const clickDate = new Date(click.timestamp);
          return clickDate >= thirtyDaysAgo;
        });

        const clicksByDate = {};
        recentClicks.forEach(click => {
          const date = new Date(click.timestamp).toISOString().split('T')[0];
          clicksByDate[date] = (clicksByDate[date] || 0) + 1;
        });

        return {
          utmId,
          totalClicks: utmData.totalClicks,
          recentClicks: recentClicks.length,
          lastClick: utmData.lastClick,
          clicksByDate
        };
      });

      res.json({
        stats,
        totalUTMs: Object.keys(clicks).length,
        totalClicks: Object.values(clicks).reduce((sum, utm) => sum + utm.totalClicks, 0)
      });
    }
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      error: 'Failed to get statistics',
      message: error.message
    });
  }
});

// Get stats for specific UTM
router.get('/stats/:utmId', async (req, res) => {
  try {
    const { utmId } = req.params;

    if (isDatabaseAvailable()) {
      const clicks = await sql`
        SELECT * FROM utm_clicks
        WHERE utm_id = ${utmId}
        ORDER BY timestamp DESC
        LIMIT 100
      `;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentClicks = clicks.filter(click => {
        return new Date(click.timestamp) >= thirtyDaysAgo;
      });

      const clicksByDate = {};
      recentClicks.forEach(click => {
        const date = new Date(click.timestamp).toISOString().split('T')[0];
        clicksByDate[date] = (clicksByDate[date] || 0) + 1;
      });

      res.json({
        utmId,
        totalClicks: clicks.length,
        recentClicks: recentClicks.length,
        lastClick: clicks.length > 0 ? clicks[0].timestamp.toISOString() : null,
        clicksByDate,
        clicks: clicks.map(c => ({
          timestamp: c.timestamp.toISOString(),
          ip: c.ip,
          userAgent: c.user_agent,
          referer: c.referer
        }))
      });
    } else {
      // Fallback to JSON
      const clicks = await loadClicks();
      if (!clicks[utmId]) {
        return res.json({
          utmId,
          totalClicks: 0,
          recentClicks: 0,
          lastClick: null,
          clicksByDate: {},
          clicks: []
        });
      }

      const utmData = clicks[utmId];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentClicks = utmData.clicks.filter(click => {
        const clickDate = new Date(click.timestamp);
        return clickDate >= thirtyDaysAgo;
      });

      const clicksByDate = {};
      recentClicks.forEach(click => {
        const date = new Date(click.timestamp).toISOString().split('T')[0];
        clicksByDate[date] = (clicksByDate[date] || 0) + 1;
      });

      res.json({
        utmId,
        totalClicks: utmData.totalClicks,
        recentClicks: recentClicks.length,
        lastClick: utmData.lastClick,
        clicksByDate,
        clicks: utmData.clicks.slice(-100)
      });
    }
  } catch (error) {
    console.error('Error getting UTM stats:', error);
    res.status(500).json({
      error: 'Failed to get UTM statistics',
      message: error.message
    });
  }
});

export default router;
