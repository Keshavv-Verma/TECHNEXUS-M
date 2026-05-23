const crypto = require('crypto');
const config = require('../config');
const { Order } = require('../models');

let Razorpay;
try {
  Razorpay = require('razorpay');
} catch {
  Razorpay = null;
}

const getRazorpayInstance = () => {
  if (!Razorpay || !config.razorpay.keyId || !config.razorpay.keySecret) {
    return null;
  }
  return new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
};

const createRazorpayOrder = async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }

  const instance = getRazorpayInstance();
  if (!instance) {
    return res.status(500).json({ error: 'Razorpay not configured' });
  }

  try {
    const order = await instance.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userId: req.user.userId,
      },
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount / 100,
      keyId: config.razorpay.keyId,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ verified: false, error: 'Missing payment fields' });
  }

  const secret = config.razorpay.keySecret;
  if (!secret) {
    return res.status(500).json({ error: 'Razorpay not configured' });
  }

  try {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    const verified = expected === razorpay_signature;

    if (!verified) {
      return res.status(400).json({ verified: false, error: 'Invalid signature' });
    }

    // Check if order with this payment ID already exists (duplicate prevention)
    const existingOrder = await Order.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existingOrder) {
      return res.json({
        verified: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        duplicate: true,
        existingOrderId: existingOrder._id,
      });
    }

    res.json({
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      duplicate: false,
    });
  } catch (error) {
    console.error('Razorpay verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};

const checkPaymentStatus = async (req, res) => {
  const { orderId } = req.params;

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  const instance = getRazorpayInstance();
  if (!instance) {
    return res.status(500).json({ error: 'Razorpay not configured' });
  }

  try {
    const order = await instance.orders.fetch(orderId);
    
    // Check if payment is captured
    if (order.status === 'paid') {
      // Fetch payments for this order
      const payments = await instance.orders.fetchPayments(orderId);
      
      if (payments.items && payments.items.length > 0) {
        const payment = payments.items[0];
        
        // Check if order already exists
        const existingOrder = await Order.findOne({ razorpayPaymentId: payment.id });
        
        return res.json({
          paid: true,
          paymentId: payment.id,
          orderId: order.id,
          amount: payment.amount / 100,
          duplicate: !!existingOrder,
          existingOrderId: existingOrder?._id,
        });
      }
    }

    res.json({
      paid: false,
      status: order.status,
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
};

module.exports = { createRazorpayOrder, verifyRazorpayPayment, checkPaymentStatus };
