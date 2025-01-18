// pages/api/webhooks/clerk.js
import crypto from 'node:crypto';

import { buffer } from 'micro';

import { insertApiKeyForUser } from '../../../libs/apikeys';
import { verifyClerkWebhookSignature } from '../../../libs/clerkWebhook';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const buf = await buffer(req);
  const signature = req.headers['clerk-signature'];

  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!verifyClerkWebhookSignature(buf, signature, secret)) {
    return res.status(400).send('Invalid signature');
  }

  let event;
  try {
    event = JSON.parse(buf.toString());
  } catch (error) {
    console.error('Error parsing payload:', error);
    return res.status(400).send('Invalid payload');
  }

  if (event.type === 'user.created') {
    const user = event.data;
    const userId = user.id;

    const apiKey = crypto.randomBytes(32).toString('hex');

    try {
      await insertApiKeyForUser(userId, apiKey);
      // eslint-disable-next-line no-console
      console.log(`Assigned API key to user ${userId}`);
    } catch (error) {
      console.error('Error assigning API key:', error);
    }
  }

  res.status(200).json({ received: true });
}
