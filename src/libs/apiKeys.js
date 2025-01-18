import { eq } from 'drizzle-orm/expressions';

import { db } from '@/libs/DB';
import { organizationSchema } from '@/models/Schema';

export async function insertApiKeyForUser(userId, apiKey) {
  try {
    // Update the organization row corresponding to the userId with the new API key
    const result = await db
      .update(organizationSchema)
      .set({ api_key: apiKey })
      .where(eq(organizationSchema.id, userId))
      .returning({ api_key: organizationSchema.api_key });

    return result;
  } catch (error) {
    console.error('Database update failed:', error);
    throw error;
  }
}
