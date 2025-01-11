import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/libs/DB';
import { encarts } from '@/models/Schema';

// Handling GET requests for all encarts
export async function GET() {
  try {
    const allEncarts = await db.select().from(encarts);
    return NextResponse.json({ success: true, data: allEncarts });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
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
    entryAnimation, // New field
    exitAnimation,
    entryAnimationDuration,
    exitAnimationDuration, // New field
    delayBetweenAppearances, // New field
    displayDuration, // New field
  } = await req.json();

  try {
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required.' },
        { status: 400 },
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
        entryAnimationDuration, // New field
        exitAnimationDuration, // New field
        delayBetweenAppearances,
        displayDuration,
      })
      .returning();

    return NextResponse.json({ success: true, data: insertedEncart });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
