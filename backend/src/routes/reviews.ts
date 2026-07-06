import { Router, Response } from 'express';
import { db } from '../db/client';
import { requireAuth } from '../middleware/auth';
import { reviewRateLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * POST /api/places/:id/reviews
 * Write a review (auth)
 */
router.post('/places/:id/reviews', requireAuth, reviewRateLimiter, async (req: any, res: Response) => {
  const placeId = req.params.id;
  const userId = req.user.id;
  const {
    item_name,
    overall_rating,
    food_rating,
    service_rating,
    cleanliness_rating,
    value_rating,
    review_text,
    photo_urls
  } = req.body;

  // Validations
  if (!item_name || !review_text) {
    return res.status(400).json({ error: 'Item name and review text are required' });
  }

  const overall = parseInt(overall_rating, 10);
  if (isNaN(overall) || overall < 1 || overall > 5) {
    return res.status(400).json({ error: 'Overall rating must be between 1 and 5' });
  }

  const food = parseInt(food_rating, 10);
  const service = parseInt(service_rating, 10);
  const cleanliness = parseInt(cleanliness_rating, 10);
  const value = parseInt(value_rating, 10);

  const isInvalidSubRating = (val: number) => isNaN(val) || val < 1 || val > 3;

  if (isInvalidSubRating(food) || isInvalidSubRating(service) || isInvalidSubRating(cleanliness) || isInvalidSubRating(value)) {
    return res.status(400).json({ error: 'Sub-ratings (Food, Service, Cleanliness, Value) must be between 1 and 3' });
  }

  try {
    // 1. Insert review
    const insertRes = await db.query(
      `INSERT INTO reviews (place_id, user_id, item_name, overall_rating, food_rating, service_rating, cleanliness_rating, value_rating, review_text)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [placeId, userId, item_name, overall, food, service, cleanliness, value, review_text]
    );

    const newReview = insertRes.rows[0];

    // 2. Insert photos if any
    if (photo_urls && Array.isArray(photo_urls)) {
      for (const url of photo_urls) {
        await db.query(
          `INSERT INTO review_photos (review_id, photo_url) VALUES ($1, $2)`,
          [newReview.id, url]
        );
      }
    }

    return res.status(201).json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({ error: 'Internal server error posting review' });
  }
});

/**
 * GET /api/reviews/:id
 * Get single review detail
 */
router.get('/reviews/:id', async (req: any, res: Response) => {
  const { id } = req.params;

  try {
    const reviewRes = await db.query(
      `SELECT r.*, u.name as user_name, u.avatar_url as user_avatar, u.is_chator,
         (SELECT COUNT(*) FROM votes WHERE review_id = r.id AND vote = 'agree') as agree_count,
         (SELECT COUNT(*) FROM votes WHERE review_id = r.id AND vote = 'disagree') as disagree_count
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (reviewRes.rowCount === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const review = reviewRes.rows[0];

    // Get photos linked to this review
    const photosRes = await db.query(`SELECT * FROM review_photos WHERE review_id = $1`, [id]);
    review.photos = photosRes.rows;

    return res.json(review);
  } catch (error) {
    console.error('Error getting review:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/reviews/:id
 * Delete own review
 */
router.delete('/reviews/:id', requireAuth, async (req: any, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const deleteRes = await db.query(
      `DELETE FROM reviews WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (deleteRes.rowCount === 0) {
      return res.status(404).json({ error: 'Review not found or you are not authorized to delete it' });
    }

    return res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
