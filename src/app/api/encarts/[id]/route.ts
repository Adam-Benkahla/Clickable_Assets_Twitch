import { eq } from 'drizzle-orm/expressions';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { encarts } from '@/models/Schema';

// PUT route
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = params.id; // No need to parse as integer
  const updateData = await req.json();

  try {
    await db.update(encarts).set(updateData).where(eq(encarts.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}

// DELETE route
export async function DELETE({ params }: { params: { id: string } }) {
  const id = params.id;

  try {
    // Perform the delete operation and get the result
    const result = await db
      .delete(encarts)
      .where(eq(encarts.id, id))
      .returning();

    // Check if any rows were deleted by checking the length of the returned array
    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Encart not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
