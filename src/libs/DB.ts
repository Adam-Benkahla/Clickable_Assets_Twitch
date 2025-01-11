import path from 'node:path';

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';

import * as schema from '@/models/Schema';

// Create PostgreSQL client using connection string from environment variable
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

await client.connect();

export const db = drizzle(client, { schema });

// Run migrations (only in non-production environments)
if (process.env.NODE_ENV !== 'production') {
  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), 'migrations'),
  });
}
