import path from 'node:path';

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';

import * as schema from '@/models/Schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in the environment variables.');
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // This allows self-signed certificates
  },
});

await client.connect();

export const db = drizzle(client, { schema });

if (process.env.NODE_ENV !== 'production') {
  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), 'migrations'),
  });
}
