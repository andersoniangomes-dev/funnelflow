import express from 'express';
import { sql, isDatabaseAvailable } from '../lib/db.js';

const router = express.Router();

// Get all saved funnels
router.get('/', async (req, res) => {
  try {
    if (isDatabaseAvailable()) {
      const funnels = await sql`
        SELECT * FROM saved_funnels
        ORDER BY created_at DESC
      `;

      const formattedFunnels = funnels.map(f => ({
        id: f.id,
        name: f.name,
        steps: f.steps,
        isDefault: f.is_default,
        createdAt: f.created_at.toISOString(),
        updatedAt: f.updated_at.toISOString()
      }));

      res.json({ funnels: formattedFunnels });
    } else {
      res.json({ funnels: [] });
    }
  } catch (error) {
    console.error('Error getting funnels:', error);
    res.status(500).json({
      error: 'Failed to get funnels',
      message: error.message
    });
  }
});

// Create or update a funnel
router.post('/', async (req, res) => {
  try {
    const { id, name, steps, isDefault } = req.body;

    if (!name || !steps || !Array.isArray(steps)) {
      return res.status(400).json({
        error: 'Name and steps array are required'
      });
    }

    if (isDatabaseAvailable()) {
      if (id) {
        // Update existing
        await sql`
          UPDATE saved_funnels
          SET name = ${name},
              steps = ${JSON.stringify(steps)}::jsonb,
              is_default = ${isDefault || false},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
        `;
        res.json({ success: true, id });
      } else {
        // Create new
        // If this is default, unset other defaults
        if (isDefault) {
          await sql`UPDATE saved_funnels SET is_default = FALSE`;
        }

        const result = await sql`
          INSERT INTO saved_funnels (name, steps, is_default)
          VALUES (${name}, ${JSON.stringify(steps)}::jsonb, ${isDefault || false})
          RETURNING id
        `;
        res.json({ success: true, id: result[0].id });
      }
    } else {
      res.status(503).json({
        error: 'Database not available'
      });
    }
  } catch (error) {
    console.error('Error saving funnel:', error);
    res.status(500).json({
      error: 'Failed to save funnel',
      message: error.message
    });
  }
});

// Delete a funnel
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isDatabaseAvailable()) {
      await sql`DELETE FROM saved_funnels WHERE id = ${id}`;
      res.json({ success: true });
    } else {
      res.status(503).json({
        error: 'Database not available'
      });
    }
  } catch (error) {
    console.error('Error deleting funnel:', error);
    res.status(500).json({
      error: 'Failed to delete funnel',
      message: error.message
    });
  }
});

export default router;


