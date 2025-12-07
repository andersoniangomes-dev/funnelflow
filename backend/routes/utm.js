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
        // Normalize utmId to string for consistency
        const normalizedUtmId = String(utmId);
        
        console.log(`📊 Registrando clique para UTM ID: ${normalizedUtmId} (tipo: ${typeof normalizedUtmId})`);
        console.log(`📊 URL de destino: ${decodedUrl.substring(0, 100)}...`);
        
        await sql`
          INSERT INTO utm_clicks (utm_id, url, ip, user_agent, referer, timestamp)
          VALUES (${normalizedUtmId}, ${decodedUrl}, ${ip}, ${userAgent}, ${referer}, CURRENT_TIMESTAMP)
        `;
        console.log(`✅ Clique registrado no banco de dados para UTM ${normalizedUtmId}`);
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

      console.log(`📊 Total de cliques no banco: ${allClicks.length}`);
      console.log(`📊 UTM IDs únicos encontrados:`, [...new Set(allClicks.map(c => c.utm_id))]);

      // Group by utm_id (normalize to string)
      const statsMap = {};
      allClicks.forEach(click => {
        const normalizedId = String(click.utm_id);
        if (!statsMap[normalizedId]) {
          statsMap[normalizedId] = {
            totalClicks: 0,
            recentClicks: [],
            clicks: []
          };
        }
        statsMap[normalizedId].totalClicks++;
        statsMap[normalizedId].clicks.push(click);
        
        const clickDate = new Date(click.timestamp);
        if (clickDate >= thirtyDaysAgo) {
          statsMap[normalizedId].recentClicks.push(click);
        }
      });

      console.log(`📊 Stats agrupados por UTM ID:`, Object.keys(statsMap).map(id => ({
        utmId: id,
        totalClicks: statsMap[id].totalClicks
      })));

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

// Delete clicks for orphan UTMs (UTMs not saved)
router.delete('/clicks/orphans', async (req, res) => {
  try {
    if (isDatabaseAvailable()) {
      // Get all saved UTM IDs
      const savedUTMs = await sql`
        SELECT id::text as id FROM saved_utms
      `;
      const savedUtmIds = savedUTMs.map(u => String(u.id));
      
      console.log(`🗑️ Deletando cliques de UTMs órfãos. UTMs salvos: ${savedUtmIds.length}`);
      
      if (savedUtmIds.length === 0) {
        // No saved UTMs, delete all clicks
        await sql`DELETE FROM utm_clicks`;
        return res.json({ 
          success: true, 
          deleted: 'all',
          message: 'Todos os cliques foram deletados (nenhum UTM salvo)' 
        });
      }
      
      // Delete clicks for UTMs that are not saved
      // Use iterative approach for better compatibility with Neon serverless
      
      // Get count of clicks before deletion
      const beforeCountResult = await sql`
        SELECT COUNT(*) as count FROM utm_clicks
      `;
      const beforeCount = parseInt(beforeCountResult[0]?.count || 0);
      
      // Get all distinct UTM IDs from clicks
      const allClicks = await sql`
        SELECT DISTINCT utm_id FROM utm_clicks
      `;
      
      // Find orphan UTM IDs (those not in saved UTMs)
      const orphanIds = allClicks
        .map(c => String(c.utm_id))
        .filter(id => !savedUtmIds.includes(id));
      
      console.log(`🔍 Encontrados ${orphanIds.length} UTMs órfãos para deletar`);
      
      // Delete clicks for each orphan UTM ID (one at a time for Neon compatibility)
      if (orphanIds.length > 0) {
        for (const orphanId of orphanIds) {
          await sql`
            DELETE FROM utm_clicks
            WHERE utm_id = ${orphanId}
          `;
        }
      }
      
      // Get count of clicks after deletion
      const afterCountResult = await sql`
        SELECT COUNT(*) as count FROM utm_clicks
      `;
      const afterCount = parseInt(afterCountResult[0]?.count || 0);
      const deletedCount = beforeCount - afterCount;
      
      console.log(`✅ Cliques órfãos deletados: ${deletedCount} (${beforeCount} → ${afterCount})`);
      
      res.json({ 
        success: true, 
        deleted: deletedCount,
        message: `${deletedCount} cliques de UTMs não salvos foram deletados` 
      });
    } else {
      res.status(503).json({
        error: 'Database not available'
      });
    }
  } catch (error) {
    console.error('Error deleting orphan clicks:', error);
    res.status(500).json({
      error: 'Failed to delete orphan clicks',
      message: error.message
    });
  }
});

// Delete clicks for a specific UTM
router.delete('/clicks/:utmId', async (req, res) => {
  try {
    const { utmId } = req.params;

    if (isDatabaseAvailable()) {
      const normalizedUtmId = String(utmId);
      
      // Get count before deletion
      const beforeCountResult = await sql`
        SELECT COUNT(*) as count FROM utm_clicks
        WHERE utm_id = ${normalizedUtmId}
      `;
      const beforeCount = parseInt(beforeCountResult[0]?.count || 0);
      
      // Delete all clicks for this UTM
      await sql`
        DELETE FROM utm_clicks
        WHERE utm_id = ${normalizedUtmId}
      `;
      
      console.log(`✅ ${beforeCount} cliques deletados para UTM ${normalizedUtmId}`);
      
      res.json({ 
        success: true, 
        deleted: beforeCount,
        message: `${beforeCount} cliques deletados para esta UTM` 
      });
    } else {
      // Fallback to JSON
      const clicks = await loadClicks();
      const deletedCount = clicks[utmId]?.totalClicks || 0;
      delete clicks[utmId];
      await saveClicks(clicks);
      
      res.json({ 
        success: true, 
        deleted: deletedCount,
        message: `${deletedCount} cliques deletados para esta UTM` 
      });
    }
  } catch (error) {
    console.error('Error deleting UTM clicks:', error);
    res.status(500).json({
      error: 'Failed to delete UTM clicks',
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
          url: c.url, // Include URL so frontend can extract UTM parameters
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
