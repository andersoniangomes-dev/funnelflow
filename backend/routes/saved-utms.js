import express from 'express';
import { sql, isDatabaseAvailable } from '../lib/db.js';

const router = express.Router();

// Get all saved UTMs
router.get('/', async (req, res) => {
  try {
    if (isDatabaseAvailable()) {
      const utms = await sql`
        SELECT * FROM saved_utms
        ORDER BY created_at DESC
      `;

      const formattedUTMs = utms.map(u => ({
        id: u.id.toString(),
        name: u.name,
        url: u.url,
        trackingUrl: u.tracking_url,
        shortUrl: u.short_url,
        source: u.source,
        medium: u.medium,
        campaign: u.campaign,
        content: u.content,
        term: u.term,
        createdAt: u.created_at.toISOString(),
        updatedAt: u.updated_at.toISOString()
      }));

      res.json({ utms: formattedUTMs });
    } else {
      res.json({ utms: [] });
    }
  } catch (error) {
    console.error('Error getting UTMs:', error);
    res.status(500).json({
      error: 'Failed to get UTMs',
      message: error.message
    });
  }
});

// Create or update a UTM
router.post('/', async (req, res) => {
  try {
    const { id, name, url, trackingUrl, shortUrl, source, medium, campaign, content, term } = req.body;

    if (!name || !url || !source || !medium || !campaign) {
      return res.status(400).json({
        error: 'Name, URL, source, medium, and campaign are required'
      });
    }

    if (isDatabaseAvailable()) {
      if (id) {
        // Update existing
        await sql`
          UPDATE saved_utms
          SET name = ${name},
              url = ${url},
              tracking_url = ${trackingUrl || null},
              short_url = ${shortUrl || null},
              source = ${source},
              medium = ${medium},
              campaign = ${campaign},
              content = ${content || null},
              term = ${term || null},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${parseInt(id)}
        `;
        res.json({ success: true, id: parseInt(id) });
      } else {
        // Create new
        const result = await sql`
          INSERT INTO saved_utms (name, url, tracking_url, short_url, source, medium, campaign, content, term)
          VALUES (${name}, ${url}, ${trackingUrl || null}, ${shortUrl || null}, ${source}, ${medium}, ${campaign}, ${content || null}, ${term || null})
          RETURNING id
        `;
        res.json({ success: true, id: result[0].id.toString() });
      }
    } else {
      res.status(503).json({
        error: 'Database not available'
      });
    }
  } catch (error) {
    console.error('Error saving UTM:', error);
    res.status(500).json({
      error: 'Failed to save UTM',
      message: error.message
    });
  }
});

// Delete a UTM
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isDatabaseAvailable()) {
      await sql`DELETE FROM saved_utms WHERE id = ${parseInt(id)}`;
      res.json({ success: true });
    } else {
      res.status(503).json({
        error: 'Database not available'
      });
    }
  } catch (error) {
    console.error('Error deleting UTM:', error);
    res.status(500).json({
      error: 'Failed to delete UTM',
      message: error.message
    });
  }
});

export default router;


