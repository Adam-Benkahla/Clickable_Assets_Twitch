import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './migrations',
  schema: './src/models/Schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    // Must come from an env var or be hard-coded for local dev
    url: process.env.DATABASE_URL ?? '',
  },
  verbose: true,
  strict: true,
});
