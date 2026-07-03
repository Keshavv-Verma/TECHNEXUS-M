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
    id: String(item._id),
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
    const normalized = items.map(normalizeCartItem);
    res.json(normalized);
  } catch (error) {
    logger.error('Error fetching cart items', error.message);
    next(error);
  }
};

const addCartItem = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = Number(quantity);

    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    if (Number.isNaN(qty) || qty < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const maxAvailable = product.stock ?? Infinity;
    const existing = await CartItem.findOne({ userId: req.user.userId, productId });

    if (existing) {
      if (existing.quantity + qty > maxAvailable) {
        return res.status(400).json({ error: `Only ${maxAvailable} units available` });
      }
      existing.quantity += qty;
      await existing.save();
      const updated = await CartItem.findById(existing._id).populate('productId');
      return res.status(200).json(normalizeCartItem(updated));
    }

    if (qty > maxAvailable) {
      return res.status(400).json({ error: `Only ${maxAvailable} units available` });
    }

    const cartItem = await CartItem.create({
      userId: req.user.userId,
      productId,
      quantity: qty,
    });

    const populated = await CartItem.findById(cartItem._id).populate('productId');
    res.status(201).json(normalizeCartItem(populated));
  } catch (error) {
    logger.error('Error saving cart item', error.message);
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const quantity = Number(req.body.quantity);

    if (Number.isNaN(quantity) || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const cartItem = await CartItem.findOne({ userId: req.user.userId, productId });
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (quantity > (product.stock ?? quantity)) {
      return res.status(400).json({ error: `Only ${product.stock} units available` });
    }

    cartItem.quantity = quantity;
    await cartItem.save();
    const populated = await CartItem.findById(cartItem._id).populate('productId');
    res.json(normalizeCartItem(populated));
  } catch (error) {
    logger.error('Error updating cart item', error.message);
    next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const result = await CartItem.deleteOne({ userId: req.user.userId, productId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    res.json({ success: true });
  } catch (error) {
    logger.error('Error removing cart item', error.message);
    next(error);
  }
};

module.exports = {
  getCartItems,
  addCartItem,
  updateCartItem,
  removeCartItem,
};
