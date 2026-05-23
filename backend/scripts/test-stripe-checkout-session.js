/**
 * Quick Stripe Checkout Session sanity check (no card charge until you open the URL).
 * Usage: node scripts/test-stripe-checkout-session.js [amountInRupees]
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Set STRIPE_SECRET_KEY in backend/.env');
  process.exit(1);
}

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const rupees = Number(process.argv[2] || 100);
const paise = Math.round(rupees * 100);

const frontend = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

stripe.checkout.sessions
  .create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'inr',
          unit_amount: paise,
          product_data: { name: 'TechNexus test' },
        },
        quantity: 1,
      },
    ],
    success_url: `${frontend}/cart?stripe_checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontend}/cart?stripe_checkout=cancelled`,
  })
  .then((session) => {
    console.log('Session created:', {
      id: session.id,
      amountRupees: paise / 100,
      url: session.url,
    });
  })
  .catch((err) => {
    console.error('Failed:', err.message);
    process.exit(1);
  });
