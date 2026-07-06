import * as cron from 'node-cron';
import { expireOldClaims } from '../services/claimService';

// Run every night at midnight: 0 0 * * *
export function initCronJobs() {
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron Job] Checking for expired claims...');
    const expiredCount = await expireOldClaims();
    console.log(`[Cron Job] Expired ${expiredCount} claim(s).`);
  });
  console.log('[Cron Job] Claim expiry checker scheduled (Daily at Midnight).');
}
