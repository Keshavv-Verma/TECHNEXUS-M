const config = require('../config');
const { Product, Coupon } = require('../models');
const { checkoutPreviewSchema } = require('../utils/validationSchemas');
const { calculatePricing } = require('../utils/checkoutUtils');

const resolveCartItems = async (items) => {
  const resolved = [];
  for (const item of items) {
    const lookupId = item.productId || item.id;
    const product = await Product.findById(lookupId);
    if (!product || !product.isActive) {
      throw Object.assign(new Error(`Product not found: ${lookupId}`), { status: 404 });
    }
    if (item.quantity > product.stock) {
      throw Object.assign(
        new Error(`Only ${product.stock} units available for ${product.name}`),
        { status: 400 }
      );
    }
    resolved.push({
      productId: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      stock: product.stock,
      quantity: item.quantity,
    });
  }
  return resolved;
};

const getCheckoutConfig = (req, res) => {
  res.json({
    freeDeliveryThreshold: config.checkout.freeDeliveryThreshold,
    shippingCharge: config.checkout.shippingCharge,
    gstRate: config.checkout.gstRate,
    businessDaysMin: config.checkout.businessDaysMin,
    businessDaysMax: config.checkout.businessDaysMax,
  });
};

const previewCheckout = async (req, res, next) => {
  try {
    const { error, value } = checkoutPreviewSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const items = await resolveCartItems(value.items);
    let coupon = null;
    if (value.couponCode) {
      coupon = await Coupon.findOne({
        code: value.couponCode.toUpperCase().trim(),
        isActive: true,
        expiryDate: { $gte: new Date() },
      });
      if (!coupon) return res.status(400).json({ error: 'Invalid coupon code' });
      const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
      if (subtotal < coupon.minOrderAmount) {
        return res.status(400).json({ error: `Minimum order amount is ₹${coupon.minOrderAmount}` });
      }
    }

    const pricing = calculatePricing({ items, coupon });
    res.json({
      items,
      pricing: {
        ...pricing,
        couponCode: coupon?.code || null,
      },
      config: {
        freeDeliveryThreshold: config.checkout.freeDeliveryThreshold,
        shippingCharge: config.checkout.shippingCharge,
        gstRate: config.checkout.gstRate,
      },
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

module.exports = { getCheckoutConfig, previewCheckout, resolveCartItems };
