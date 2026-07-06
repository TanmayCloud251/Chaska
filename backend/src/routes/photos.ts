import { Router, Response } from 'express';
import { db } from '../db/client';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * POST /api/places/:id/photos
 * Upload a photo for a place (auth)
 * Body: { photo_url: string, is_cover?: boolean }
 */
router.post('/places/:id/photos', requireAuth, async (req: any, res: Response) => {
  const placeId = req.params.id;
  const userId = req.user.id;
  const { photo_url, is_cover } = req.body;

  if (!photo_url) {
    return res.status(400).json({ error: 'Photo URL is required' });
  }

  try {
    // If setting as cover photo, un-cover previous cover photos first
    if (is_cover) {
      await db.query(
        `UPDATE place_photos SET is_cover = FALSE WHERE place_id = $1`,
        [placeId]
      );
    }

    const insertRes = await db.query(
      `INSERT INTO place_photos (place_id, uploaded_by, photo_url, is_cover)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [placeId, userId, photo_url, is_cover || false]
    );

    return res.status(201).json(insertRes.rows[0]);
  } catch (error) {
    console.error('Error adding place photo:', error);
    return res.status(500).json({ error: 'Internal server error uploading place photo' });
  }
});

/**
 * POST /api/reviews/:id/photos
 * Upload a photo for a review (auth)
 * Body: { photo_url: string }
 */
router.post('/reviews/:id/photos', requireAuth, async (req: any, res: Response) => {
  const reviewId = req.params.id;
  const userId = req.user.id;
  const { photo_url } = req.body;

  if (!photo_url) {
    return res.status(400).json({ error: 'Photo URL is required' });
  }

  try {
    // Check if the review belongs to the user
    const checkRes = await db.query(`SELECT user_id FROM reviews WHERE id = $1`, [reviewId]);
    if (checkRes.rowCount === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    if (checkRes.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'You are not authorized to upload photos to this review' });
    }

    const insertRes = await db.query(
      `INSERT INTO review_photos (review_id, photo_url)
       VALUES ($1, $2) RETURNING *`,
      [reviewId, photo_url]
    );

    return res.status(201).json(insertRes.rows[0]);
  } catch (error) {
    console.error('Error adding review photo:', error);
    return res.status(500).json({ error: 'Internal server error uploading review photo' });
  }
});

/**
 * DELETE /api/photos/:id
 * Delete own place photo (auth)
 */
router.delete('/photos/:id', requireAuth, async (req: any, res: Response) => {
  const photoId = req.params.id;
  const userId = req.user.id;

  try {
    // Verify ownership
    const photoRes = await db.query(`SELECT uploaded_by FROM place_photos WHERE id = $1`, [photoId]);
    if (photoRes.rowCount === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    if (photoRes.rows[0].uploaded_by !== userId) {
      return res.status(403).json({ error: 'You can only delete photos uploaded by yourself' });
    }

    await db.query(`DELETE FROM place_photos WHERE id = $1`, [photoId]);

    return res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return res.status(500).json({ error: 'Internal server error deleting photo' });
  }
});

export default router;
