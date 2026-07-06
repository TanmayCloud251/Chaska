import { Router, Response } from 'express';
import { db } from '../db/client';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * GET /api/users/me/chator
 * Returns the "Certified चटोर" milestone progress for the logged-in user.
 */
router.get('/me/chator', requireAuth, async (req: any, res: Response) => {
  const userId = req.user.id;

  try {
    // 1. Get overall counts
    const totalReviewsRes = await db.query(
      `SELECT COUNT(*) as count FROM reviews WHERE user_id = $1`,
      [userId]
    );
    const totalReviews = parseInt(totalReviewsRes.rows[0]?.count || '0', 10);

    const totalAgreesRes = await db.query(
      `SELECT COUNT(*) as count FROM votes v
       LEFT JOIN reviews r ON v.review_id = r.id
       WHERE r.user_id = $1 AND v.vote = 'agree'`,
      [userId]
    );
    const totalAgrees = parseInt(totalAgreesRes.rows[0]?.count || '0', 10);

    // 2. Count reviews with >= 10 agrees
    const checkQuery = `
      SELECT COUNT(*) as count FROM reviews r
      WHERE r.user_id = $1
      AND (
        SELECT COUNT(*) FROM votes v 
        WHERE v.review_id = r.id 
        AND v.vote = 'agree'
      ) >= 10
    `;
    const progressRes = await db.query(checkQuery, [userId]);
    const reviewsWithTenAgrees = parseInt(progressRes.rows[0]?.count || '0', 10);

    const percentage = Math.min(Math.round((reviewsWithTenAgrees / 3) * 100), 100);

    return res.json({
      reviews_with_ten_agrees: reviewsWithTenAgrees,
      target: 3,
      percentage,
      total_reviews: totalReviews,
      total_agrees: totalAgrees
    });
  } catch (error) {
    console.error('Error fetching chator progress:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/users/me/reviews
 * Returns reviews written by the logged-in user.
 */
router.get('/me/reviews', requireAuth, async (req: any, res: Response) => {
  const userId = req.user.id;

  try {
    const reviewsRes = await db.query(
      `SELECT r.*, p.name as place_name, p.area as place_area,
       (SELECT COUNT(*) FROM votes v WHERE v.review_id = r.id AND v.vote = 'agree') as agree_count,
       (SELECT COUNT(*) FROM votes v WHERE v.review_id = r.id AND v.vote = 'disagree') as disagree_count
       FROM reviews r
       LEFT JOIN places p ON r.place_id = p.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return res.json(reviewsRes.rows);
  } catch (error) {
    console.error('Error fetching own reviews:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/users/me/saved
 * Returns saved places for the logged-in user.
 */
router.get('/me/saved', requireAuth, async (req: any, res: Response) => {
  const userId = req.user.id;

  try {
    // Get places saved by user
    const savedRes = await db.query(
      `SELECT p.*,
       (SELECT photo_url FROM place_photos WHERE place_id = p.id AND is_cover = TRUE LIMIT 1) as cover_photo,
       (SELECT AVG(overall_rating) FROM reviews WHERE place_id = p.id) as avg_rating,
       (SELECT COUNT(*) FROM reviews WHERE place_id = p.id) as review_count
       FROM saved_places s
       LEFT JOIN places p ON s.place_id = p.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
      [userId]
    );
    return res.json(savedRes.rows);
  } catch (error) {
    console.error('Error fetching saved places:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/users/:id
 * Returns public profile details + stats.
 */
router.get('/:id', async (req: any, res: Response) => {
  const userId = req.params.id;

  try {
    const userRes = await db.query(`SELECT id, name, avatar_url, is_chator, chator_since, created_at FROM users WHERE id = $1`, [userId]);
    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRes.rows[0];

    // Stats calculations
    const totalReviewsRes = await db.query(`SELECT COUNT(*) as count FROM reviews WHERE user_id = $1`, [userId]);
    const totalReviews = parseInt(totalReviewsRes.rows[0]?.count || '0', 10);

    const totalAgreesRes = await db.query(
      `SELECT COUNT(*) as count FROM votes v
       LEFT JOIN reviews r ON v.review_id = r.id
       WHERE r.user_id = $1 AND v.vote = 'agree'`,
      [userId]
    );
    const totalAgrees = parseInt(totalAgreesRes.rows[0]?.count || '0', 10);

    // Fetch user reviews
    const reviewsRes = await db.query(
      `SELECT r.*, p.name as place_name, p.area as place_area,
       (SELECT COUNT(*) FROM votes v WHERE v.review_id = r.id AND v.vote = 'agree') as agree_count
       FROM reviews r
       LEFT JOIN places p ON r.place_id = p.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC LIMIT 5`,
      [userId]
    );

    return res.json({
      user,
      stats: {
        total_reviews: totalReviews,
        total_agrees: totalAgrees
      },
      recent_reviews: reviewsRes.rows
    });
  } catch (error) {
    console.error('Error fetching public user profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/users/me
 * Body: { name, avatar_url }
 */
router.patch('/me', requireAuth, async (req: any, res: Response) => {
  const userId = req.user.id;
  const { name, avatar_url } = req.body;

  if (!name && !avatar_url) {
    return res.status(400).json({ error: 'Name or avatar URL is required to update' });
  }

  try {
    // Get existing user details to merge
    const userRes = await db.query(`SELECT name, avatar_url FROM users WHERE id = $1`, [userId]);
    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentName = name || userRes.rows[0].name;
    const currentAvatar = avatar_url || userRes.rows[0].avatar_url;

    const updateRes = await db.query(
      `UPDATE users SET name = $1, avatar_url = $2 WHERE id = $3 RETURNING *`,
      [currentName, currentAvatar, userId]
    );

    return res.json({
      success: true,
      user: updateRes.rows[0]
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
