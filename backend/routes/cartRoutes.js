const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  getCartItems,
  addCartItem,
  updateCartItem,
  removeCartItem,
} = require('../controllers/cartController');

router.get('/cart', verifyToken, getCartItems);
router.post('/cart', verifyToken, addCartItem);
router.patch('/cart/:productId', verifyToken, updateCartItem);
router.delete('/cart/:productId', verifyToken, removeCartItem);

module.exports = router;
