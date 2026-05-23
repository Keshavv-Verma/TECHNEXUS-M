const config = require('../config');

const addBusinessDays = (date, days) => {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return result;
};

const formatAddress = (addr) => {
  if (!addr) return '';
  return [
    addr.fullName,
    addr.houseNo,
    addr.street,
    `${addr.city}, ${addr.state} ${addr.pincode}`,
    addr.country,
    `Phone: ${addr.mobile}`,
  ]
    .filter(Boolean)
    .join(', ');
};

const calculatePricing = ({ items, coupon = null }) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let couponDiscount = 0;
  if (coupon) {
    if (coupon.discountType === 'PERCENTAGE') {
      couponDiscount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount != null) {
        couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
      }
    } else {
      couponDiscount = coupon.discountValue;
    }
    couponDiscount = Math.min(couponDiscount, subtotal);
  }

  const afterCoupon = Math.max(0, subtotal - couponDiscount);
  const shippingCharge =
    afterCoupon >= config.checkout.freeDeliveryThreshold ? 0 : config.checkout.shippingCharge;
  const taxableAmount = afterCoupon + shippingCharge;
  const taxAmount = Math.round(taxableAmount * config.checkout.gstRate * 100) / 100;
  const totalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;

  const now = new Date();
  const earliest = addBusinessDays(now, config.checkout.businessDaysMin);
  const latest = addBusinessDays(now, config.checkout.businessDaysMax);

  return {
    subtotal,
    couponDiscount,
    discountAmount: couponDiscount,
    shippingCharge,
    taxAmount,
    totalAmount,
    isFreeDelivery: shippingCharge === 0,
    estimatedDelivery: {
      businessDays: `${config.checkout.businessDaysMin}–${config.checkout.businessDaysMax}`,
      earliest,
      latest,
    },
  };
};

const generateOrderNumber = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TN-${ts}-${rand}`;
};

module.exports = {
  addBusinessDays,
  formatAddress,
  calculatePricing,
  generateOrderNumber,
};
