import { eq } from 'drizzle-orm/expressions';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { encarts } from '@/models/Schema';

// Common headers for CORS
const corsHeaders = new Headers({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Vary': 'Origin',
  'Access-Control-Allow-Credentials': 'true',
});

// Handle preflight CORS requests
export async function OPTIONS() {
  return new Response(null, {
    status: 204, // No content for preflight requests
    headers: corsHeaders,
  });
}

// PUT route
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const updateData = await req.json();

  try {
    await db.update(encarts).set(updateData).where(eq(encarts.id, id));
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500, headers: corsHeaders },
    );
  }
}

// DELETE route
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID is required' },
      { status: 400, headers: corsHeaders },
    );
  }

  try {
    const result = await db.delete(encarts).where(eq(encarts.id, id)).returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Encart not found' },
        { status: 404, headers: corsHeaders },
      );
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500, headers: corsHeaders },
    );
  }
}
