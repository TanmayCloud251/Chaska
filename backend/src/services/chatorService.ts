import { db } from '../db/client';

/**
 * Checks and updates the user's "Certified चटोर" status.
 * Run this check after every vote insertion or update.
 * Rule: If the user has 3 or more reviews that have at least 10 'agree' votes,
 * they are promoted to Certified चटोर.
 */
export async function checkAndPromoteChator(userId: string): Promise<boolean> {
  try {
    // Run the specified check query
    const checkQuery = `
      SELECT COUNT(*) as count FROM reviews r
      WHERE r.user_id = $1
      AND (
        SELECT COUNT(*) FROM votes v 
        WHERE v.review_id = r.id 
        AND v.vote = 'agree'
      ) >= 10
    `;
    
    const result = await db.query(checkQuery, [userId]);
    const eligibleCount = parseInt(result.rows[0]?.count || '0', 10);

    if (eligibleCount >= 3) {
      // Get current status to check if it's a new promotion
      const userResult = await db.query(`SELECT is_chator FROM users WHERE id = $1`, [userId]);
      const isAlreadyChator = userResult.rows[0]?.is_chator || false;

      if (!isAlreadyChator) {
        await db.query(
          `UPDATE users SET is_chator = TRUE, chator_since = NOW() WHERE id = $1`,
          [userId]
        );
        return true; // Promoted!
      }
    }
    return false;
  } catch (error) {
    console.error(`Error in checkAndPromoteChator for user ${userId}:`, error);
    return false;
  }
}
