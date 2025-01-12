import { createHash } from 'node:crypto'; // Node.js crypto module

import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { encarts } from '@/models/Schema';

// Common headers for CORS
const corsHeaders = new Headers({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Vary': 'Origin',
  'Access-Control-Allow-Credentials': 'true',
});

// Handle preflight CORS requests
export async function OPTIONS(req: Request) {
  // eslint-disable-next-line no-console
  console.log(`OPTIONS request received from: ${req.url}`); // Explicit use of req
  return new Response(null, {
    status: 204, // No content for preflight requests
    headers: corsHeaders,
  });
}

// GET route for /metadata
export async function GET(req: Request) {
  // eslint-disable-next-line no-console
  console.log(`GET /metadata request received from: ${req.url}`); // Explicit use of req

  try {
    // Step 1: Fetch all encarts from the database
    const allEncarts = await db.select().from(encarts);

    // Step 2: Serialize the data into a consistent format (e.g., JSON string)
    const serializedData = JSON.stringify(allEncarts);

    // Step 3: Generate a SHA256 hash of the serialized data
    const hash = createHash('sha256').update(serializedData).digest('hex');

    // Step 4: Return the hash in the response
    return NextResponse.json({ success: true, hash }, { headers: corsHeaders });
  } catch (error: any) {
    console.error(`GET /metadata request failed for: ${req.url}`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500, headers: corsHeaders },
    );
  }
}
