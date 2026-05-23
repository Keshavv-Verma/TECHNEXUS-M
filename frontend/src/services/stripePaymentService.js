import { loadStripe } from '@stripe/stripe-js';
import { createStripeCheckoutSession, verifyStripeSession } from './checkoutService';

const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const isDev = process.env.NODE_ENV === 'development';

const PENDING_CHECKOUT_KEY = 'technexus_pending_checkout';

let stripePromise = null;

const getStripe = () => {
  if (!STRIPE_PUBLISHABLE_KEY) {
    return null;
  }
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export const savePendingCheckout = (payload) => {
  sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(payload));
};

export const loadPendingCheckout = () => {
  try {
    const raw = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearPendingCheckout = () => {
  sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
};

export const createCheckoutSession = async (amount, { customerEmail, successUrl, cancelUrl } = {}) => {
  const rupees = Number(amount);
  if (!Number.isFinite(rupees) || rupees < 50) {
    throw new Error('Order total must be at least ₹50 to pay online (Stripe minimum)');
  }

  const result = await createStripeCheckoutSession(rupees, {
    customerEmail,
    successUrl,
    cancelUrl,
  });

  if (isDev) {
    console.log('[Stripe] create-checkout-session response:', {
      sessionId: result.sessionId,
      amount: result.amount,
      amountInPaise: result.amountInPaise,
    });
  }

  if (!result.sessionId) {
    throw new Error('Invalid checkout session from server');
  }

  return {
    success: true,
    sessionId: result.sessionId,
    url: result.url,
    amount: result.amount,
    amountInPaise: result.amountInPaise,
    currency: result.currency || 'INR',
  };
};

export const redirectToStripeCheckout = async (sessionId) => {
  if (!STRIPE_PUBLISHABLE_KEY) {
    throw new Error('Stripe not configured. Set REACT_APP_STRIPE_PUBLISHABLE_KEY in .env');
  }

  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Failed to load Stripe');
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) {
    throw new Error(error.message || 'Failed to redirect to Stripe Checkout');
  }
};

export const initiateStripePayment = async (paymentData) => {
  const origin = window.location.origin;
  const successUrl = `${origin}/cart?stripe_checkout=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/cart?stripe_checkout=cancelled`;

  const session = await createCheckoutSession(paymentData.amount, {
    customerEmail: paymentData.customerEmail,
    successUrl,
    cancelUrl,
  });

  await redirectToStripeCheckout(session.sessionId);
  return session;
};

export const verifyStripeCheckout = async (sessionId) => {
  if (!sessionId) {
    throw new Error('Missing Stripe session ID');
  }

  const result = await verifyStripeSession(sessionId);
  return {
    verified: result.verified !== false && result.paid !== false,
    sessionId: result.sessionId,
    paymentIntentId: result.paymentIntentId,
    amount: result.amount,
    duplicate: result.duplicate,
    existingOrderId: result.existingOrderId,
  };
};
