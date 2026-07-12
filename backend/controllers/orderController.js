const mongoose = require('mongoose');
const { Order, Product, Address, Coupon, CartItem } = require('../models');
const { placeOrderSchema } = require('../utils/validationSchemas');
const {
  calculatePricing,
  formatAddress,
  generateOrderNumber,
} = require('../utils/checkoutUtils');
const checkoutController = require('./checkoutController');
const logger = require('../utils/logger');
const config = require('../config');
const { refundPaymentIntent } = require('../services/stripeService');

const placeOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { error, value } = placeOrderSchema.validate(req.body);
    if (error) {
      await session.abortTransaction();
      return res.status(400).json({ error: error.details[0].message });
    }

    const address = await Address.findOne({
      _id: value.addressId,
      userId: req.user.userId,
    }).session(session);

    if (!address) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Delivery address not found' });
    }

    const items = await checkoutController.resolveCartItems(value.items);
    let coupon = null;
    if (value.couponCode) {
      coupon = await Coupon.findOne({
        code: value.couponCode.toUpperCase().trim(),
        isActive: true,
        expiryDate: { $gte: new Date() },
      }).session(session);

      if (!coupon) {
        await session.abortTransaction();
        return res.status(400).json({ error: 'Invalid coupon code' });
      }
      const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
      if (subtotal < coupon.minOrderAmount) {
        await session.abortTransaction();
        return res.status(400).json({ error: `Minimum order amount is ₹${coupon.minOrderAmount}` });
      }
      if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
        await session.abortTransaction();
        return res.status(400).json({ error: 'Coupon usage limit reached' });
      }
    }

    const pricing = calculatePricing({ items, coupon });
    const isCod = value.paymentMethod === 'COD';
    const paymentCompleted =
      value.paymentStatus === 'COMPLETED' ||
      (value.paymentMethod === 'STRIPE' && value.stripePaymentIntentId);

    if (!isCod && !paymentCompleted && value.paymentMethod !== 'STRIPE') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Payment must be completed before placing order' });
    }

    for (const item of items) {
      const updated = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
        { new: true, session }
      );
      if (!updated) {
        await session.abortTransaction();
        return res.status(400).json({ error: `Insufficient stock for ${item.name}` });
      }
    }

    if (coupon) {
      coupon.usedCount += 1;
      await coupon.save({ session });
    }

    const deliverySnapshot = {
      fullName: address.fullName,
      mobile: address.mobile,
      houseNo: address.houseNo,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
    };

    const order = await Order.create(
      [
        {
          orderNumber: generateOrderNumber(),
          userId: req.user.userId,
          status: isCod ? 'CONFIRMED' : 'CONFIRMED',
          subtotal: pricing.subtotal,
          discountAmount: pricing.discountAmount,
          couponCode: coupon?.code || null,
          couponDiscount: pricing.couponDiscount,
          shippingCharge: pricing.shippingCharge,
          taxAmount: pricing.taxAmount,
          totalAmount: pricing.totalAmount,
          shippingAddress: formatAddress(deliverySnapshot),
          deliveryAddress: deliverySnapshot,
          paymentMethod: value.paymentMethod,
          paymentStatus: isCod ? 'PENDING' : paymentCompleted ? 'COMPLETED' : 'PENDING',
          stripeSessionId: value.stripeSessionId || null,
          stripePaymentIntentId: value.stripePaymentIntentId || null,
          estimatedDeliveryEarliest: pricing.estimatedDelivery.earliest,
          estimatedDeliveryLatest: pricing.estimatedDelivery.latest,
          orderItems: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            image: i.image,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      ],
      { session }
    );

    await CartItem.deleteMany({ userId: req.user.userId }).session(session);

    await session.commitTransaction();

    res.status(201).json(order[0]);
  } catch (err) {
    await session.abortTransaction();
    if (err.status) return res.status(err.status).json({ error: err.message });

    // If a Stripe payment was already made, attempt to refund it and inform the user
    const paymentIntentId = (typeof value !== 'undefined' && value?.stripePaymentIntentId) || req.body?.stripePaymentIntentId || null;
    if (paymentIntentId) {
      try {
        await refundPaymentIntent(paymentIntentId);
        logger.info('Issued refund for Stripe payment after order placement failure', {
          paymentIntentId,
          userId: req.user?.userId,
        });
      } catch (refundErr) {
        logger.error('Failed to refund Stripe payment after order placement failure', refundErr?.message || refundErr);
      }

      return res.status(500).json({
        error: 'Internal server error. If payment was taken, it will be refunded in 2-3 business days.',
        ...(config.isDevelopment ? { detail: err.message } : {}),
      });
    }

    next(err);
  } finally {
    session.endSession();
  }
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.user.userId })
    .sort({ createdAt: -1 })
    .select('-__v')
    .lean();
  res.json(orders);
};

const getAdminOrders = async (req, res) => {
  const orders = await Order.find({})
    .sort({ createdAt: -1 })
    .populate('userId', 'name email')
    .select('-__v')
    .lean();
  res.json(orders);
};

const markOrderReceived = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    await Order.deleteOne({ _id: order._id });
    res.json({ success: true, message: 'Order marked as received and removed' });
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    userId: req.user.userId,
  });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
};

const getOrderByNumber = async (req, res) => {
  const order = await Order.findOne({
    orderNumber: req.params.orderNumber,
    userId: req.user.userId,
  });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
};

module.exports = {
  placeOrder,
  getMyOrders,
  getAdminOrders,
  markOrderReceived,
  getOrderById,
  getOrderByNumber,
};
