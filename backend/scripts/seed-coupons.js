require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { connectDB, disconnectDB, Coupon } = require('../models');

const coupons = [
  {
    code: 'TECH10',
    description: '10% off on orders above ₹500',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderAmount: 500,
    maxDiscount: 500,
    expiryDate: new Date('2027-12-31'),
    isActive: true,
  },
  {
    code: 'FLAT100',
    description: '₹100 off on orders above ₹999',
    discountType: 'FIXED',
    discountValue: 100,
    minOrderAmount: 999,
    expiryDate: new Date('2027-12-31'),
    isActive: true,
  },
  {
    code: 'WELCOME50',
    description: '₹50 off for new customers',
    discountType: 'FIXED',
    discountValue: 50,
    minOrderAmount: 299,
    expiryDate: new Date('2027-12-31'),
    isActive: true,
  },
];

async function seed() {
  await connectDB();
  for (const c of coupons) {
    await Coupon.findOneAndUpdate({ code: c.code }, c, { upsert: true, new: true });
    console.log(`✓ Coupon ${c.code}`);
  }
  await disconnectDB();
  console.log('Done seeding coupons.');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
