import cron from 'node-cron';
import { prisma } from '../config/db';
import { ListingStatus } from '@prisma/client';

export function startExpireListingsJob() {
  // Run every 5 minutes: '*/5 * * * *'
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      
      const result = await prisma.listing.updateMany({
        where: {
          status: ListingStatus.ACTIVE,
          expiresAt: {
            lt: now,
          },
        },
        data: {
          status: ListingStatus.EXPIRED,
        },
      });

      if (result.count > 0) {
        console.log(`[Cron Job]: Expired ${result.count} listings successfully at ${now.toISOString()}`);
      }
    } catch (error) {
      console.error('[Cron Job Error] Failed to process listing expirations:', error);
    }
  });
  
  console.log('[Cron Job]: Expire listings cron scheduler registered.');
}
