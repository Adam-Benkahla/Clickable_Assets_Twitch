// src/app/api/webhooks/clerk/route.ts

import crypto from 'node:crypto';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

import { insertApiKeyForUser } from '../../../../libs/apiKeys'; // Adjust path as needed

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  console.log(`Received ${request.method} request at /api/webhooks/clerk`);

  try {
    const svixId = request.headers.get('svix-id');
    const svixSignature = request.headers.get('svix-signature');
    const svixTimestamp = request.headers.get('svix-timestamp');
    const secret = process.env.CLERK_WEBHOOK_SECRET;

    if (!svixId || !svixSignature || !svixTimestamp || !secret) {
      console.error('Missing required Svix headers or webhook secret.');
      return NextResponse.json({ error: 'Missing signature headers or secret.' }, { status: 400 });
    }

    // Read raw body as an ArrayBuffer
    const buffer = await request.arrayBuffer();
    const payload = Buffer.from(buffer);

    // Initialize Svix with your webhook secret
    const webhook = new Webhook(secret);

    let event: { type: string; data: any };
    try {
      // Verify and parse the event using Webhook, passing all required headers
      event = webhook.verify(payload, {
        'svix-id': svixId,
        'svix-signature': svixSignature,
        'svix-timestamp': svixTimestamp,
      }) as { type: string; data: any };
    } catch (verifyError) {
      console.error('Signature verification failed:', verifyError);
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
    }

    console.log('Received event:', event.type);

    // Handle the 'user.created' event
    if (event.type === 'user.created') {
      const user = event.data;
      const userId = user.id;
      console.log(`Processing API key assignment for user ID: ${userId}`);

      const apiKey = crypto.randomBytes(32).toString('hex');

      try {
        await insertApiKeyForUser(userId, apiKey);
        console.log(`Successfully assigned API key to user ${userId}`);
      } catch (dbError) {
        console.error('Error assigning API key:', dbError);
        return NextResponse.json({ error: 'Database error.' }, { status: 500 });
      }
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}
