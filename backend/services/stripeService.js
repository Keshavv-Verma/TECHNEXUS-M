const config = require('../config');

let stripeClient = null;

const getStripe = () => {
  if (!config.stripe.secretKey) {
    return null;
  }
  if (!stripeClient) {
    // eslint-disable-next-line global-require
    const Stripe = require('stripe');
    stripeClient = new Stripe(config.stripe.secretKey);
  }
  return stripeClient;
};

const refundPaymentIntent = async (paymentIntentId, opts = {}) => {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error('Stripe not configured');
  }
  // Stripe refunds can be created by payment_intent
  return stripe.refunds.create({ payment_intent: paymentIntentId, ...opts });
};

module.exports = { getStripe, refundPaymentIntent };
