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

module.exports = { getStripe };
