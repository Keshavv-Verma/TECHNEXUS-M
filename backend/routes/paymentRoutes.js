const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const paymentController = require('../controllers/paymentController');

router.post('/payments/razorpay/create-order', verifyToken, paymentController.createRazorpayOrder);
router.post('/payments/razorpay/verify', verifyToken, paymentController.verifyRazorpayPayment);
router.get('/payments/razorpay/status/:orderId', verifyToken, paymentController.checkPaymentStatus);

module.exports = router;
