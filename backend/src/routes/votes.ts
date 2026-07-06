import { Router, Response } from 'express';
import { db } from '../db/client';
import { requireAuth } from '../middleware/auth';
import { checkAndPromoteChator } from '../services/chatorService';

const router = Router();

/**
 * POST /api/reviews/:id/vote
 * Cast or change vote on a review
 * Body: { vote: 'agree' | 'disagree' }
 */
router.post('/reviews/:id/vote', requireAuth, async (req: any, res: Response) => {
  const reviewId = req.params.id;
  const userId = req.user.id;
  const { vote } = req.body;

  if (vote !== 'agree' && vote !== 'disagree') {
    return res.status(400).json({ error: "Vote must be either 'agree' or 'disagree'" });
  }

  try {
    // 1. Get review author ID first
    const reviewRes = await db.query(`SELECT user_id FROM reviews WHERE id = $1`, [reviewId]);
    if (reviewRes.rowCount === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    const authorId = reviewRes.rows[0].user_id;

    if (authorId === userId) {
      return res.status(400).json({ error: 'You cannot vote on your own review' });
    }

    // 2. Insert or update vote (UNIQUE constraint triggers ON CONFLICT)
    await db.query(
      `INSERT INTO votes (review_id, user_id, vote)
       VALUES ($1, $2, $3)
       ON CONFLICT (review_id, user_id)
       DO UPDATE SET vote = EXCLUDED.vote`,
      [reviewId, userId, vote]
    );

    // 3. Trigger Certified चटोर check on the review author
    const promoted = await checkAndPromoteChator(authorId);
    if (promoted) {
      console.log(`[Promotion Logger] User ${authorId} promoted to Certified चटोर!`);
    }

    return res.json({ success: true, message: 'Vote casted successfully', chator_promoted: promoted });
  } catch (error) {
    console.error('Error casting vote:', error);
    return res.status(500).json({ error: 'Internal server error voting on review' });
  }
});

/**
 * DELETE /api/reviews/:id/vote
 * Remove a vote
 */
router.delete('/reviews/:id/vote', requireAuth, async (req: any, res: Response) => {
  const reviewId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await db.query(
      `DELETE FROM votes WHERE review_id = $1 AND user_id = $2`,
      [reviewId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Vote not found' });
    }

    return res.json({ success: true, message: 'Vote removed successfully' });
  } catch (error) {
    console.error('Error removing vote:', error);
    return res.status(500).json({ error: 'Internal server error removing vote' });
  }
});

export default router;
