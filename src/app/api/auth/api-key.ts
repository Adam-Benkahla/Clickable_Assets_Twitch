import { getAuth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm/expressions';
import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/libs/DB';
import { organizationSchema } from '@/models/Schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthenticated' });
  }

  try {
    // Fetch organization record linked to this user
    const orgArray = await db
      .select()
      .from(organizationSchema)
      .where(eq(organizationSchema.id, userId));

    const org = orgArray[0];
    if (!org) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    // Check subscription status
    if (org.stripeSubscriptionStatus !== 'active') {
      return res.status(403).json({ success: false, error: 'Subscription not active' });
    }

    // Retrieve or generate API key
    let apiKey = org.api_key;
    if (!apiKey) {
      apiKey = uuidv4();
      await db
        .update(organizationSchema)
        .set({ api_key: apiKey })
        .where(eq(organizationSchema.id, userId));
    }

    return res.status(200).json({ success: true, apiKey });
  } catch (error: any) {
    console.error('API Key generation error:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}
