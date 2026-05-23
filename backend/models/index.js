const mongoose = require('mongoose');
const config = require('../config');

// Models
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const CartItem = require('./CartItem');
const Review = require('./Review');
const Address = require('./Address');
const Coupon = require('./Coupon');

// Connection management
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const mongoUrl = config.mongodb.url;
    if (!mongoUrl) {
      throw new Error('MONGODB_URL or DATABASE_URL environment variable is not defined');
    }

    await mongoose.connect(mongoUrl, config.mongodb.options);
    isConnected = true;
    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    isConnected = false;
    throw error;
  }
};

const disconnectDB = async () => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('✓ MongoDB disconnected successfully');
  } catch (error) {
    console.error('✗ MongoDB disconnection error:', error.message);
    throw error;
  }
};

// Export models and connection functions
module.exports = {
  // Models
  User,
  Category,
  Product,
  Order,
  CartItem,
  Review,
  Address,
  Coupon,
  
  // Connection functions
  connectDB,
  disconnectDB,
  mongoose,
  
  // For backward compatibility with Prisma-style usage
  user: User,
  category: Category,
  product: Product,
  order: Order,
  cartItem: CartItem,
  review: Review,
  address: Address,
  coupon: Coupon,
  $connect: connectDB,
  $disconnect: disconnectDB,
};

