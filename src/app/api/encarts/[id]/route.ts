import { eq } from 'drizzle-orm/expressions';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { encarts } from '@/models/Schema';

// PUT route
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
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
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;

  try {
    const result = await db
      .delete(encarts)
      .where(eq(encarts.id, id))
      .returning();

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
