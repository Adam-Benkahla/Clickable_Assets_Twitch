// src/app/api/webhooks/clerk/clerk/route.js

import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';

import { NextResponse } from 'next/server';

import { insertApiKeyForUser } from '../../../../libs/apiKeys'; // Adjust the relative path as needed
import { verifyClerkWebhookSignature } from '../../../../libs/clerkWebhook'; // Adjust the relative path as needed

// Disable Next.js's default body parser to handle raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  // Log the method and URL for debugging
  // eslint-disable-next-line no-console
  console.log(`Received ${request.method} request at /api/webhooks/clerk`);

  try {
    const signature = request.headers.get('clerk-signature'); // Adjust based on Clerk's docs
    const secret = process.env.CLERK_WEBHOOK_SECRET;

    if (!signature || !secret) {
      console.error('Missing Clerk signature or webhook secret.');
      return NextResponse.json({ error: 'Missing signature or secret.' }, { status: 400 });
    }

    // Read the raw body as a buffer
    const buffer = await request.arrayBuffer();
    const buf = Buffer.from(buffer);

    // Verify the webhook signature
    const isValid = verifyClerkWebhookSignature(buf, signature, secret);

    if (!isValid) {
      console.error('Invalid webhook signature.');
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
    }

    // Parse the JSON payload
    const event = JSON.parse(buf.toString());

    // Handle the 'user.created' event
    if (event.type === 'user.created') {
      const user = event.data;
      const userId = user.id;

      // Generate a new API key
      const apiKey = crypto.randomBytes(32).toString('hex');

      // Assign the API key to the user in the database
      try {
        await insertApiKeyForUser(userId, apiKey);
        // eslint-disable-next-line no-console
        console.log(`Assigned API key to user ${userId}`);
      } catch (dbError) {
        console.error('Error assigning API key:', dbError);
        return NextResponse.json({ error: 'Database error.' }, { status: 500 });
      }
    }

    // Respond with a success message
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}
