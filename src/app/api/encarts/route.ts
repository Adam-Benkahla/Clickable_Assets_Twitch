import { eq } from 'drizzle-orm/expressions';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { obsAssets } from '@/models/Schema'; // <-- define your table as "obsAssets"

// CORS headers
const corsHeaders = new Headers({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Vary': 'Origin',
  'Access-Control-Allow-Credentials': 'true',
});

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET route: for your Twitch extension or other clients to read the stored data
export async function GET() {
  try {
    // For example, fetch all rows
    const allData = await db.select().from(obsAssets);
    // Return it
    return NextResponse.json(
      {
        success: true,
        data: allData,
      },
      { headers: corsHeaders },
    );
  } catch (error: any) {
    console.error('GET request failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500, headers: corsHeaders },
    );
  }
}

// POST route: for your OBS plugin to send bounding-box data
export async function POST(req: Request) {
  try {
    const {
      asset_id,
      source_name,
      scene_name,
      native_width,
      native_height,
      pos_x,
      pos_y,
      scale_x,
      scale_y,
      rotation_deg,
      final_width,
      final_height,
      canvas_width,
      canvas_height,
      clickable_link,
    } = await req.json();

    if (!source_name) {
      return NextResponse.json(
        { success: false, error: 'Missing required "source_name" field' },
        { status: 400, headers: corsHeaders },
      );
    }

    // Check if a row with the same asset_id already exists
    const existing = await db
      .select()
      .from(obsAssets)
      .where(eq(obsAssets.id, asset_id));

    if (existing.length > 0) {
      // Row exists: update it
      await db
        .update(obsAssets)
        .set({
          scene_name,
          native_width,
          native_height,
          pos_x,
          pos_y,
          scale_x,
          scale_y,
          rotation_deg,
          final_width,
          final_height,
          canvas_width,
          canvas_height,
          clickable_link,
          updated_at: new Date(),
        })
        .where(eq(obsAssets.id, asset_id));
      return NextResponse.json(
        { success: true, message: 'Updated existing row', source_name },
        { headers: corsHeaders },
      );
    } else {
      // Row doesn't exist: insert new
      // Use the provided asset_id from OBS
      await db.insert(obsAssets).values({
        id: asset_id,
        source_name,
        scene_name,
        native_width,
        native_height,
        pos_x,
        pos_y,
        scale_x,
        scale_y,
        rotation_deg,
        final_width,
        final_height,
        canvas_width,
        canvas_height,
        clickable_link,
        created_at: new Date(),
        updated_at: new Date(),
      });
      return NextResponse.json(
        { success: true, message: 'Inserted new row', source_name },
        { headers: corsHeaders },
      );
    }
  } catch (error: any) {
    console.error('POST request failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500, headers: corsHeaders },
    );
  }
}
