import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/libs/DB';
import { encarts } from '@/models/Schema';

// Common headers for CORS
const corsHeaders = new Headers({
  'Access-Control-Allow-Origin': '*', // Replace '*' with specific origin if needed
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
});

// Handle preflight CORS requests
export async function OPTIONS(req: Request) {
  // Use req to satisfy Vercel's requirement
  // eslint-disable-next-line no-console
  console.log(`OPTIONS request received from: ${req.url}`);

  return NextResponse.json(null, { headers: corsHeaders });
}

// GET route
export async function GET(req: Request) {
  try {
    const allEncarts = await db.select().from(encarts);
    return NextResponse.json({ success: true, data: allEncarts }, { headers: corsHeaders });
  } catch (error: any) {
    console.error(`GET request failed for: ${req.url}`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500, headers: corsHeaders },
    );
  }
}

// POST route
export async function POST(req: Request) {
  try {
    const {
      label,
      background,
      fileUrl,
      text,
      linkUrl,
      x,
      y,
      width,
      height,
      userId,
      entryAnimation,
      exitAnimation,
      entryAnimationDuration,
      exitAnimationDuration,
      delayBetweenAppearances,
      displayDuration,
    } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required.' },
        { status: 400, headers: corsHeaders },
      );
    }

    const id = uuidv4();

    const [insertedEncart] = await db
      .insert(encarts)
      .values({
        id,
        userId,
        label,
        background,
        fileUrl,
        text,
        linkUrl,
        x,
        y,
        width,
        height,
        entryAnimation,
        exitAnimation,
        entryAnimationDuration,
        exitAnimationDuration,
        delayBetweenAppearances,
        displayDuration,
      })
      .returning();

    return NextResponse.json({ success: true, data: insertedEncart }, { headers: corsHeaders });
  } catch (error: any) {
    console.error(`POST request failed for: ${req.url}`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500, headers: corsHeaders },
    );
  }
}
