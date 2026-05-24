const config = require('../config');
const logger = require('../utils/logger');
const { Order } = require('../models');
const { getStripe } = require('../services/stripeService');

const STRIPE_MIN_PAISE = 5000; // ~₹50 — Stripe rejects very small INR amounts

const toAmountPaise = (amount) => {
  const rupees = Number(amount);
  if (!Number.isFinite(rupees) || rupees < STRIPE_MIN_PAISE / 100) {
    return null;
  }
  const paise = Math.round(rupees * 100);
  return paise >= STRIPE_MIN_PAISE ? paise : null;
};

const createCheckoutSession = async (req, res) => {
  const amountPaise = toAmountPaise(req.body.amount);
  if (amountPaise == null) {
    return res.status(400).json({
      error: 'Valid amount is required (minimum ₹50 for Stripe)',
    });
  }

  const stripe = getStripe();
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  const successUrl =
    req.body.successUrl ||
    `${config.frontendUrl}/cart?stripe_checkout=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = req.body.cancelUrl || `${config.frontendUrl}/cart?stripe_checkout=cancelled`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            unit_amount: amountPaise,
            product_data: {
              name: 'TechNexus Order',
              description: 'Order payment',
            },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: req.body.customerEmail || undefined,
      metadata: {
        userId: String(req.user.userId),
      },
    });

    if (config.isDevelopment) {
      logger.debug('[Stripe] checkout session created', {
        sessionId: session.id,
        amountPaise,
      });
    }

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      amount: amountPaise / 100,
      amountInPaise: amountPaise,
      currency: 'INR',
    });
  } catch (error) {
    const detail = error?.message;
    logger.error('Stripe checkout session error', detail || error.message);
    res.status(500).json({
      error: 'Failed to create Stripe checkout session',
      ...(config.isDevelopment && detail ? { detail } : {}),
    });
  }
};

const verifyCheckoutSession = async (req, res) => {
  const sessionId = req.body.sessionId || req.params.sessionId;

  if (!sessionId) {
    return res.status(400).json({ verified: false, error: 'Session ID is required' });
  }

  const stripe = getStripe();
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });

    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        verified: false,
        paid: false,
        status: session.payment_status,
        error: 'Payment not completed',
      });
    }

    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;

    if (!paymentIntentId) {
      return res.status(400).json({
        verified: false,
        error: 'Payment intent not found on session',
      });
    }

    if (session.metadata?.userId && String(session.metadata.userId) !== String(req.user.userId)) {
      return res.status(403).json({ verified: false, error: 'Session does not belong to this user' });
    }

    let existingOrder = null;
    try {
      existingOrder = await Order.findOne({ stripePaymentIntentId: paymentIntentId });
    } catch (dbErr) {
      logger.warn('Stripe duplicate check skipped', dbErr.message);
    }

    if (existingOrder) {
      return res.json({
        verified: true,
        paid: true,
        sessionId: session.id,
        paymentIntentId,
        amount: (session.amount_total || 0) / 100,
        duplicate: true,
        existingOrderId: existingOrder._id,
      });
    }

    res.json({
      verified: true,
      paid: true,
      sessionId: session.id,
      paymentIntentId,
      amount: (session.amount_total || 0) / 100,
      duplicate: false,
    });
  } catch (error) {
    logger.error('Stripe session verification error', error.message);
    res.status(500).json({
      error: 'Payment verification failed',
      ...(config.isDevelopment ? { detail: error.message } : {}),
    });
  }
};

module.exports = { createCheckoutSession, verifyCheckoutSession };
