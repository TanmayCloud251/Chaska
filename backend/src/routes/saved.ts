import { Router, Response } from 'express';
import { db } from '../db/client';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * POST /api/saved/:place_id
 * Save a place for later (auth)
 */
router.post('/saved/:place_id', requireAuth, async (req: any, res: Response) => {
  const placeId = req.params.place_id;
  const userId = req.user.id;

  try {
    // Check if place exists
    const placeRes = await db.query(`SELECT id FROM places WHERE id = $1`, [placeId]);
    if (placeRes.rowCount === 0) {
      return res.status(404).json({ error: 'Place not found' });
    }

    // Insert saved place
    await db.query(
      `INSERT INTO saved_places (user_id, place_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, place_id) DO NOTHING`,
      [userId, placeId]
    );

    return res.json({ success: true, message: 'Place saved successfully' });
  } catch (error) {
    console.error('Error saving place:', error);
    return res.status(500).json({ error: 'Internal server error saving place' });
  }
});

/**
 * DELETE /api/saved/:place_id
 * Unsave a place (auth)
 */
router.delete('/saved/:place_id', requireAuth, async (req: any, res: Response) => {
  const placeId = req.params.place_id;
  const userId = req.user.id;

  try {
    const result = await db.query(
      `DELETE FROM saved_places WHERE user_id = $1 AND place_id = $2`,
      [userId, placeId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Saved place entry not found' });
    }

    return res.json({ success: true, message: 'Place unsaved successfully' });
  } catch (error) {
    console.error('Error unsaving place:', error);
    return res.status(500).json({ error: 'Internal server error unsaving place' });
  }
});

export default router;
