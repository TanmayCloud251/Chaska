import { db } from '../db/client';

/**
 * Recalculates claim vote totals and checks for auto-resolution.
 * Rules:
 * - Update agree_count, disagree_count, chator_agree_count.
 * - If agree_count >= 10 AND chator_agree_count >= 3:
 *     - Set claim status = 'resolved'
 *     - De-verify/hide the place (is_verified = FALSE)
 */
export async function updateClaimStatusAndResolve(claimId: string): Promise<boolean> {
  try {
    // 1. Get the claim details
    const claimRes = await db.query(`SELECT * FROM claims WHERE id = $1`, [claimId]);
    if (claimRes.rowCount === 0) return false;
    const claim = claimRes.rows[0];

    if (claim.status !== 'open') return false;

    // 2. Count votes
    const votesRes = await db.query(
      `SELECT cv.vote, u.is_chator FROM claim_votes cv
       LEFT JOIN users u ON cv.user_id = u.id
       WHERE cv.claim_id = $1`,
      [claimId]
    );

    let agreeCount = 0;
    let disagreeCount = 0;
    let chatorAgreeCount = 0;

    for (const row of votesRes.rows) {
      if (row.vote === 'agree') {
        agreeCount++;
        if (row.is_chator) {
          chatorAgreeCount++;
        }
      } else if (row.vote === 'disagree') {
        disagreeCount++;
      }
    }

    // 3. Update counts on the claim
    await db.query(
      `UPDATE claims 
       SET agree_count = $1, disagree_count = $2, chator_agree_count = $3
       WHERE id = $4`,
      [agreeCount, disagreeCount, chatorAgreeCount, claimId]
    );

    // 4. Check for auto-resolution
    if (agreeCount >= 10 && chatorAgreeCount >= 3) {
      // Resolve claim
      await db.query(
        `UPDATE claims SET status = 'resolved' WHERE id = $1`,
        [claimId]
      );

      // Perform action: hide/flag place
      // (If claim is duplicate or does_not_exist, we flag/de-verify the place)
      await db.query(
        `UPDATE places SET is_verified = FALSE WHERE id = $1`,
        [claim.place_id]
      );
      
      return true; // Resolved!
    }

    return false;
  } catch (error) {
    console.error(`Error in updateClaimStatusAndResolve for claim ${claimId}:`, error);
    return false;
  }
}

/**
 * Sweep and expire old open claims where expires_at < NOW()
 */
export async function expireOldClaims(): Promise<number> {
  try {
    const result = await db.query(
      `UPDATE claims 
       SET status = 'expired' 
       WHERE status = 'open' AND expires_at < NOW()`
    );
    return result.rowCount || 0;
  } catch (error) {
    console.error("Error running expireOldClaims job:", error);
    return 0;
  }
}
