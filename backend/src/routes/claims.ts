import { Router, Response } from 'express';
import { db } from '../db/client';
import { requireAuth } from '../middleware/auth';
import { updateClaimStatusAndResolve } from '../services/claimService';

const router = Router();

/**
 * POST /api/places/:id/claims
 * Raise a claim for a place (auth)
 * Body: { claim_type: 'does_not_exist' | 'relocated' | 'duplicate' | 'incorrect_info', description: string }
 */
router.post('/places/:id/claims', requireAuth, async (req: any, res: Response) => {
  const placeId = req.params.id;
  const userId = req.user.id;
  const { claim_type, description } = req.body;

  const validTypes = ['does_not_exist', 'relocated', 'duplicate', 'incorrect_info'];
  if (!claim_type || !validTypes.includes(claim_type)) {
    return res.status(400).json({ error: `Invalid claim type. Must be one of: ${validTypes.join(', ')}` });
  }

  try {
    // Check if place exists
    const placeRes = await db.query(`SELECT id FROM places WHERE id = $1`, [placeId]);
    if (placeRes.rowCount === 0) {
      return res.status(404).json({ error: 'Place not found' });
    }

    // Insert claim
    const insertRes = await db.query(
      `INSERT INTO claims (place_id, raised_by, claim_type, description)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [placeId, userId, claim_type, description]
    );

    return res.status(201).json(insertRes.rows[0]);
  } catch (error) {
    console.error('Error raising claim:', error);
    return res.status(500).json({ error: 'Internal server error raising claim' });
  }
});

/**
 * POST /api/claims/:id/vote
 * Vote on a claim (auth)
 * Body: { vote: 'agree' | 'disagree' }
 */
router.post('/claims/:id/vote', requireAuth, async (req: any, res: Response) => {
  const claimId = req.params.id;
  const userId = req.user.id;
  const { vote } = req.body;

  if (vote !== 'agree' && vote !== 'disagree') {
    return res.status(400).json({ error: "Vote must be either 'agree' or 'disagree'" });
  }

  try {
    // Check if claim exists and is open
    const claimRes = await db.query(`SELECT status, raised_by FROM claims WHERE id = $1`, [claimId]);
    if (claimRes.rowCount === 0) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    const claim = claimRes.rows[0];
    if (claim.status !== 'open') {
      return res.status(400).json({ error: `Cannot vote on a ${claim.status} claim` });
    }

    if (claim.raised_by === userId) {
      return res.status(400).json({ error: 'You cannot vote on a claim you raised' });
    }

    // Insert or update vote
    await db.query(
      `INSERT INTO claim_votes (claim_id, user_id, vote)
       VALUES ($1, $2, $3)
       ON CONFLICT (claim_id, user_id)
       DO UPDATE SET vote = EXCLUDED.vote`,
      [claimId, userId, vote]
    );

    // Recalculate and trigger auto-resolution
    const resolved = await updateClaimStatusAndResolve(claimId);

    return res.json({
      success: true,
      message: 'Claim vote registered successfully',
      resolved
    });
  } catch (error) {
    console.error('Error voting on claim:', error);
    return res.status(500).json({ error: 'Internal server error casting claim vote' });
  }
});

/**
 * DELETE /api/claims/:id/vote
 * Remove a claim vote (auth)
 */
router.delete('/claims/:id/vote', requireAuth, async (req: any, res: Response) => {
  const claimId = req.params.id;
  const userId = req.user.id;

  try {
    // Check if claim is open
    const claimRes = await db.query(`SELECT status FROM claims WHERE id = $1`, [claimId]);
    if (claimRes.rowCount === 0) {
      return res.status(404).json({ error: 'Claim not found' });
    }
    if (claimRes.rows[0].status !== 'open') {
      return res.status(400).json({ error: 'Cannot remove vote from closed claim' });
    }

    const deleteRes = await db.query(
      `DELETE FROM claim_votes WHERE claim_id = $1 AND user_id = $2`,
      [claimId, userId]
    );

    if (deleteRes.rowCount === 0) {
      return res.status(404).json({ error: 'Vote not found' });
    }

    // Recalculate totals
    await updateClaimStatusAndResolve(claimId);

    return res.json({ success: true, message: 'Claim vote removed successfully' });
  } catch (error) {
    console.error('Error removing claim vote:', error);
    return res.status(500).json({ error: 'Internal server error removing claim vote' });
  }
});

export default router;
