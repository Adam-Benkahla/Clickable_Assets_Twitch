import { eq } from 'drizzle-orm/expressions';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { obsAssets } from '@/models/Schema';

// Common CORS
const corsHeaders = new Headers({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Vary': 'Origin',
  'Access-Control-Allow-Credentials': 'true',
});

// Preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// PUT => update by ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const updateData = await req.json();

  try {
    // update the row
    await db.update(obsAssets).set({
      ...updateData,
      updated_at: new Date(),
    }).where(eq(obsAssets.id, id));

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500, headers: corsHeaders },
    );
  }
}

// DELETE => by obs_asset_id
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const obsAssetId = url.pathname.split('/').pop(); // Extract the obs_asset_id from the URL

  if (!obsAssetId) {
    return NextResponse.json(
      { success: false, error: 'obs_asset_id is required' },
      { status: 400, headers: corsHeaders },
    );
  }

  try {
    const result = await db.delete(obsAssets)
      .where(eq(obsAssets.obs_asset_id, obsAssetId)) // Match by obs_asset_id
      .returning();

    if (result.length === 0) {
      const result = await db.delete(obsAssets)
        .where(eq(obsAssets.id, obsAssetId)) // Match by obs_asset_id
        .returning();
      if (result.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Asset not found' },
          { status: 404, headers: corsHeaders },
        );
      }
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
