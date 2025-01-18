// src/libs/clerkWebhook.js

import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';

/**
 * Verifies the Clerk webhook signature.
 * @param {Buffer} payload - The raw request body as a buffer.
 * @param {string} signature - The signature from the headers.
 * @param {string} secret - Your Clerk webhook secret.
 * @returns {boolean} - Whether the signature is valid.
 */
export function verifyClerkWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const digest = hmac.digest('hex');

  // Use timingSafeEqual to prevent timing attacks
  const signatureBuffer = Buffer.from(signature, 'utf-8');
  const digestBuffer = Buffer.from(digest, 'utf-8');

  if (signatureBuffer.length !== digestBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, digestBuffer);
}
