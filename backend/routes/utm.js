import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to store UTM click data
const DATA_DIR = path.join(__dirname, '../data');
const CLICKS_FILE = path.join(DATA_DIR, 'utm-clicks.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

// Load clicks data
async function loadClicks() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(CLICKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist, return empty structure
    return {};
  }
}

// Save clicks data
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

    console.log(`🔔 Clique registrado para UTM ID: ${utmId}`);
    console.log(`🔗 URL de destino: ${url}`);

    if (!url) {
      console.error('❌ URL parameter is missing');
      return res.status(400).json({
        error: 'URL parameter is required'
      });
    }

    // Decode the URL
    const decodedUrl = decodeURIComponent(url);
    console.log(`✅ URL decodificada: ${decodedUrl}`);

    // Load clicks data
    const clicks = await loadClicks();

    // Initialize UTM if doesn't exist
    if (!clicks[utmId]) {
      console.log(`📝 Criando novo registro para UTM ${utmId}`);
      clicks[utmId] = {
        totalClicks: 0,
        clicks: [],
        lastClick: null
      };
    }

    // Add click record
    const clickRecord = {
      timestamp: new Date().toISOString(),
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      referer: req.headers['referer'] || 'unknown'
    };

    clicks[utmId].clicks.push(clickRecord);
    clicks[utmId].totalClicks = clicks[utmId].clicks.length;
    clicks[utmId].lastClick = clickRecord.timestamp;

    console.log(`✅ Clique registrado! Total para UTM ${utmId}: ${clicks[utmId].totalClicks}`);

    // Keep only last 1000 clicks per UTM to avoid file size issues
    if (clicks[utmId].clicks.length > 1000) {
      clicks[utmId].clicks = clicks[utmId].clicks.slice(-1000);
    }

    // Save clicks data
    await saveClicks(clicks);

    // Redirect to the actual URL
    res.redirect(decodedUrl);

  } catch (error) {
    console.error('Error tracking click:', error);
    // Even if tracking fails, try to redirect
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
    const clicks = await loadClicks();

    // Transform data for frontend
    const stats = Object.keys(clicks).map(utmId => {
      const utmData = clicks[utmId];
      
      // Calculate clicks by date (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentClicks = utmData.clicks.filter(click => {
        const clickDate = new Date(click.timestamp);
        return clickDate >= thirtyDaysAgo;
      });

      // Group by date
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
    
    // Calculate clicks by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentClicks = utmData.clicks.filter(click => {
      const clickDate = new Date(click.timestamp);
      return clickDate >= thirtyDaysAgo;
    });

    // Group by date
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
      clicks: utmData.clicks.slice(-100) // Return last 100 clicks
    });

  } catch (error) {
    console.error('Error getting UTM stats:', error);
    res.status(500).json({
      error: 'Failed to get UTM statistics',
      message: error.message
    });
  }
});

export default router;

