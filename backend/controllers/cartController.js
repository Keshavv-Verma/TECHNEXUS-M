const mongoose = require('mongoose');
const { CartItem, Product } = require('../models');
const logger = require('../utils/logger');

const normalizeCartItem = (item) => {
  const product = item.productId;
  const image =
    product?.image ||
    product?.attributes?.image ||
    product?.attributes?.img?.data?.[0]?.attributes?.url ||
    '';

  return {
    id: String(product?._id || product),
    cartItemId: String(item._id),
    productId: String(product?._id || product),
    name: product?.name || product?.title || 'Product',
    price: product?.price ?? 0,
    image,
    stock: product?.stock ?? 99,
    quantity: item.quantity,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

const getCartItems = async (req, res, next) => {
  try {
    const items = await CartItem.find({ userId: req.user.userId }).populate('productId');
    const normalized = [];

    for (const item of items) {
      if (!item.productId || !item.productId.isActive) {
        await CartItem.deleteOne({ _id: item._id });
        continue;
      }
      normalized.push(normalizeCartItem(item));
    }

    res.json(normalized);
  } catch (error) {
    logger.error('Error fetching cart items', error.message);
    next(error);
  }
};

const addCartItem = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = Number(quantity);

    if (!productId) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'productId is required' });
    }

    if (Number.isNaN(qty) || qty < 1) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Product not found' });
    }

    const existing = await CartItem.findOne({ userId: req.user.userId, productId }).session(session);

    if (existing) {
      const totalQuantity = existing.quantity + qty;
      if (totalQuantity > product.stock) {
        await session.abortTransaction();
        return res.status(400).json({ error: `Only ${product.stock} units available` });
      }
      existing.quantity = totalQuantity;
      await Promise.all([existing.save({ session }), product.save({ session })]);
      const updated = await CartItem.findById(existing._id).populate('productId');
      await session.commitTransaction();
      return res.status(200).json(normalizeCartItem(updated));
    }

    if (qty > product.stock) {
      await session.abortTransaction();
      return res.status(400).json({ error: `Only ${product.stock} units available` });
    }

    const cartItem = await CartItem.create(
      [
        {
          userId: req.user.userId,
          productId,
          quantity: qty,
        },
      ],
      { session }
    );

    const populated = await CartItem.findById(cartItem[0]._id).populate('productId');
    await session.commitTransaction();
    res.status(201).json(normalizeCartItem(populated));
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    logger.error('Error saving cart item', error.message);
    next(error);
  } finally {
    session.endSession();
  }
};

const updateCartItem = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const productId = req.params.productId;
    const quantity = Number(req.body.quantity);

    if (Number.isNaN(quantity) || quantity < 1) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const cartItem = await CartItem.findOne({ userId: req.user.userId, productId }).session(session);
    if (!cartItem) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Product not found' });
    }

    if (quantity > product.stock) {
      await session.abortTransaction();
      return res.status(400).json({ error: `Only ${product.stock} units available` });
    }

    cartItem.quantity = quantity;

    await Promise.all([cartItem.save({ session }), product.save({ session })]);
    const populated = await CartItem.findById(cartItem._id).populate('productId');
    await session.commitTransaction();
    res.json(normalizeCartItem(populated));
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    logger.error('Error updating cart item', error.message);
    next(error);
  } finally {
    session.endSession();
  }
};

const removeCartItem = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const productId = req.params.productId;
    const cartItem = await CartItem.findOne({ userId: req.user.userId, productId }).session(session);
    if (!cartItem) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await CartItem.deleteOne({ _id: cartItem._id }).session(session);
    await session.commitTransaction();
    res.json({ success: true });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    logger.error('Error removing cart item', error.message);
    next(error);
  } finally {
    session.endSession();
  }
};

module.exports = {
  getCartItems,
  addCartItem,
  updateCartItem,
  removeCartItem,
};
