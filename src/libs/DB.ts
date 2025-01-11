import { Buffer } from 'node:buffer';
import path from 'node:path';

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';

import * as schema from '@/models/Schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in the environment variables.');
}

// Decode the Base64-encoded certificate
const certBase64 = process.env.SUPABASE_CA_CERT;
const cert = certBase64 ? Buffer.from(certBase64, 'base64').toString('utf-8') : null;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: cert
    ? {
        rejectUnauthorized: true,
        ca: cert,
      }
    : undefined,
});

await client.connect();

export const db = drizzle(client, { schema });

if (process.env.NODE_ENV !== 'production') {
  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), 'migrations'),
  });
}
