const assert = require('node:assert/strict');
const test = require('node:test');

const models = require('../models');
const checkoutController = require('../controllers/checkoutController');

const createFakeSession = () => ({
  startTransaction: async () => {},
  abortTransaction: async () => {},
  commitTransaction: async () => {},
  endSession: () => {},
});

test('placeOrder clears the user cart after a successful order', async () => {
  const deleteManyCalls = [];
  const fakeSession = createFakeSession();
  const fakeOrder = {
    _id: 'order-1',
    orderNumber: 'ORD-1001',
    totalAmount: 199,
    deliveryAddress: { fullName: 'Test User' },
    estimatedDeliveryEarliest: '2026-07-08',
    estimatedDeliveryLatest: '2026-07-10',
    createdAt: '2026-07-03T00:00:00.000Z',
  };

  const originalStartSession = require('../models').mongoose.startSession;
  const originalOrderCreate = models.Order.create;
  const originalAddressFindOne = models.Address.findOne;
  const originalProductFindOneAndUpdate = models.Product.findOneAndUpdate;
  const originalCouponFindOne = models.Coupon.findOne;
  const originalCartItemDeleteMany = models.CartItem.deleteMany;

  models.mongoose.startSession = async () => fakeSession;
  models.Order.create = async () => [fakeOrder];
  models.Address.findOne = () => ({
    session: async () => ({
      _id: 'address-1',
      userId: 'user-1',
      fullName: 'Test User',
      mobile: '9876543210',
      houseNo: '12',
      street: 'Main Street',
      city: 'Mumbai',
      state: 'MH',
      pincode: '400001',
      country: 'India',
    }),
  });
  models.Product.findOneAndUpdate = () => ({
    session: async () => ({
      _id: 'product-1',
      name: 'Test Product',
      stock: 10,
    }),
  });
  models.Coupon.findOne = () => ({
    session: async () => null,
  });
  models.CartItem.deleteMany = (filter) => {
    deleteManyCalls.push(filter);
    return {
      deletedCount: 1,
      session: () => ({ deletedCount: 1 }),
    };
  };
  checkoutController.resolveCartItems = async () => [
    { productId: 'product-1', name: 'Test Product', image: '', price: 199, stock: 10, quantity: 1 },
  ];

  const controller = require('../controllers/orderController');
  const req = {
    body: {
      items: [{ productId: 'product-1', quantity: 1 }],
      addressId: 'address-1',
      couponCode: '',
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
    },
    user: { userId: 'user-1' },
  };
  const res = {
    statusCode: null,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };

  try {
    await controller.placeOrder(req, res, () => {});
  } finally {
    models.mongoose.startSession = originalStartSession;
    models.Order.create = originalOrderCreate;
    models.Address.findOne = originalAddressFindOne;
    models.Product.findOneAndUpdate = originalProductFindOneAndUpdate;
    models.Coupon.findOne = originalCouponFindOne;
    models.CartItem.deleteMany = originalCartItemDeleteMany;
  }

  assert.equal(res.statusCode, 201);
  assert.deepEqual(deleteManyCalls, [{ userId: 'user-1' }]);
});
