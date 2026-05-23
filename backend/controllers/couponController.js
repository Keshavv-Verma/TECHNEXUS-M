const { Coupon } = require('../models');
const { couponValidateSchema } = require('../utils/validationSchemas');

const validateCoupon = async (req, res, next) => {
  try {
    const { error, value } = couponValidateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const coupon = await Coupon.findOne({
      code: value.code.toUpperCase().trim(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(400).json({ valid: false, error: 'Invalid coupon code' });
    }

    if (coupon.expiryDate < new Date()) {
      return res.status(400).json({ valid: false, error: 'Coupon has expired' });
    }

    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ valid: false, error: 'Coupon usage limit reached' });
    }

    if (value.subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        valid: false,
        error: `Minimum order amount is ₹${coupon.minOrderAmount}`,
      });
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (value.subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discountValue;
    }
    discount = Math.min(discount, value.subtotal);

    res.json({
      valid: true,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Math.round(discount * 100) / 100,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { validateCoupon };
