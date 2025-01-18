import { eq } from 'drizzle-orm/expressions';

import { db } from '@/libs/DB';
import { organizationSchema } from '@/models/Schema';

/**
 * Assigns an API key to a user in the organization table.
 * @param {string} userId - The Clerk user ID.
 * @param {string} apiKey - The generated API key.
 */

export async function insertApiKeyForUser(userId, apiKey) {
  try {
    const result = await db
      .update(organizationSchema)
      .set({ api_key: apiKey })
      .where(eq(organizationSchema.id, userId))
      .returning({ api_key: organizationSchema.api_key });

    if (result.length === 0) {
      throw new Error(`No organization found for user ID: ${userId}`);
    }

    return result[0];
  } catch (error) {
    console.error('Failed to insert API key:', error);
    throw error;
  }
}
