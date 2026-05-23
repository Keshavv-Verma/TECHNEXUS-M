const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const orderController = require('../controllers/orderController');

router.post('/orders', verifyToken, orderController.placeOrder);
router.get('/orders', verifyToken, orderController.getMyOrders);
router.get('/orders/track/:orderNumber', verifyToken, orderController.getOrderByNumber);
router.get('/orders/:id', verifyToken, orderController.getOrderById);

module.exports = router;
