// lib/clerkWebhook.js
import crypto from 'node:crypto';

export function verifyClerkWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const digest = hmac.digest('hex');
  // eslint-disable-next-line node/prefer-global/buffer
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
