import { eq } from 'drizzle-orm/expressions'; // Import eq
import type { NextApiRequest, NextApiResponse } from 'next';

import { db } from '@/libs/DB';
import { organizationSchema } from '@/models/Schema';

// Security: Validate Clerk webhook signature here in production

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const event = req.body;

  try {
    if (
      event.type === 'subscription.updated'
      || event.type === 'subscription.created'
      || event.type === 'subscription.deleted'
    ) {
      const { userId, status, currentPeriodEnd } = event.data; // Adjust based on Clerk's payload

      await db
        .update(organizationSchema)
        .set({
          stripeSubscriptionStatus: status,
          stripeSubscriptionCurrentPeriodEnd: currentPeriodEnd,
        })
        .where(eq(organizationSchema.id, userId)); // Use where with eq
    }
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).end();
  }
}
