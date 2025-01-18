import { eq } from 'drizzle-orm/expressions';

import { db } from '@/libs/DB';
import { organizationSchema } from '@/models/Schema';

export async function insertApiKeyForUser(userId: string, apiKey: string) {
  try {
    // Try updating an existing organization record
    const updateResult = await db
      .update(organizationSchema)
      .set({ api_key: apiKey })
      .where(eq(organizationSchema.id, userId))
      .returning({ api_key: organizationSchema.api_key });

    if (updateResult.length > 0) {
      // If record exists and was updated
      return updateResult[0];
    } else {
      // No existing record: insert a new organization row
      const insertResult = await db
        .insert(organizationSchema)
        .values({
          id: userId,
          stripeCustomerId: '', // Provide default or null values as appropriate
          stripeSubscriptionId: '',
          stripeSubscriptionPriceId: '',
          stripeSubscriptionStatus: '',
          stripeSubscriptionCurrentPeriodEnd: 0,
          api_key: apiKey,
          updatedAt: new Date(),
          createdAt: new Date(),
        })
        .returning({ api_key: organizationSchema.api_key });

      if (insertResult.length === 0) {
        throw new Error(`Failed to insert new organization for user ID: ${userId}`);
      }

      return insertResult[0];
    }
  } catch (error) {
    console.error(`Failed to insert or update API key for user ${userId}:`, error);
    throw error;
  }
}
