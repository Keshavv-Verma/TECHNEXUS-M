const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const paymentController = require('../controllers/paymentController');

router.post(
  '/payments/stripe/create-checkout-session',
  verifyToken,
  paymentController.createCheckoutSession
);
router.post('/payments/stripe/verify-session', verifyToken, paymentController.verifyCheckoutSession);
router.get(
  '/payments/stripe/verify-session/:sessionId',
  verifyToken,
  paymentController.verifyCheckoutSession
);

module.exports = router;
