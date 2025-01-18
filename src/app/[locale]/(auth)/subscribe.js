// pages/subscribe.js
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    // Create Checkout Session
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
    });
    const { sessionId, error } = await res.json();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // Redirect to Stripe Checkout
    const stripe = await stripePromise;
    const { error: stripeError } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (stripeError) {
      console.error(stripeError);
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Subscribe</h1>
      <button onClick={handleSubscribe} disabled={loading}>
        {loading ? 'Loading...' : 'Subscribe'}
      </button>
    </div>
  );
}
