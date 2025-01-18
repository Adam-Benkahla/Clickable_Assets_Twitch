/* eslint-disable no-console */
import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { insertApiKeyForUser } from '../../../../libs/apiKeys'; // Adjust path as needed
import { verifyClerkWebhookSignature } from '../../../../libs/clerkWebhook'; // Adjust path as needed

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  console.log(`Received ${request.method} request at /api/webhooks/clerk`);

  try {
    const signature = request.headers.get('svix-signature');
    const secret = process.env.CLERK_WEBHOOK_SECRET;

    if (!signature || !secret) {
      console.error('Missing Clerk signature or webhook secret.');
      return NextResponse.json({ error: 'Missing signature or secret.' }, { status: 400 });
    }

    // Read the raw body as a buffer
    const buffer = await request.arrayBuffer();
    const buf = Buffer.from(buffer);

    console.log(`Received body length: ${buf.length}`);

    // Verify the webhook signature
    const isValid = verifyClerkWebhookSignature(buf, signature, secret);

    if (!isValid) {
      console.error('Invalid webhook signature.');
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
    }

    // Parse the JSON payload
    const event = JSON.parse(buf.toString());
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
