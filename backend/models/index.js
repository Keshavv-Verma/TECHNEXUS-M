const mongoose = require('mongoose');
const config = require('../config');
const logger = require('../utils/logger');

// Models
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const CartItem = require('./CartItem');
const Review = require('./Review');
const Address = require('./Address');
const Coupon = require('./Coupon');

let isConnected = false;
let reconnectTimer = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const mongoUrl = config.mongodb.url;
  if (!mongoUrl) {
    throw new Error('MONGODB_URL or DATABASE_URL environment variable is not defined');
  }

  const { connectRetries, connectRetryDelayMs, options } = config.mongodb;
  let lastError;

  for (let attempt = 1; attempt <= connectRetries; attempt++) {
    try {
      await mongoose.connect(mongoUrl, options);
      isConnected = true;
      logger.info('MongoDB connected successfully');
      return;
    } catch (error) {
      lastError = error;
      isConnected = false;
      logger.error(
        `MongoDB connection attempt ${attempt}/${connectRetries} failed`,
        error.message
      );
      if (attempt < connectRetries) {
        const delay = connectRetryDelayMs * attempt;
        logger.warn(`Retrying MongoDB connection in ${delay}ms`);
        await sleep(delay);
      }
    }
  }

  throw lastError;
};

const scheduleReconnect = () => {
  if (!config.isProduction || reconnectTimer) {
    return;
  }

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    if (mongoose.connection.readyState === 0) {
      logger.warn('Attempting MongoDB reconnection');
      try {
        await connectDB();
      } catch (error) {
        logger.error('MongoDB reconnection failed', error.message);
        scheduleReconnect();
      }
    }
  }, config.mongodb.connectRetryDelayMs);
};

mongoose.connection.on('connected', () => {
  isConnected = true;
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.warn('MongoDB disconnected');
  scheduleReconnect();
});

mongoose.connection.on('error', (error) => {
  isConnected = false;
  logger.error('MongoDB connection error', error.message);
});

const disconnectDB = async () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (!isConnected && mongoose.connection.readyState === 0) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error('MongoDB disconnection error', error.message);
    throw error;
  }
};

module.exports = {
  User,
  Category,
  Product,
  Order,
  CartItem,
  Review,
  Address,
  Coupon,
  connectDB,
  disconnectDB,
  mongoose,
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
