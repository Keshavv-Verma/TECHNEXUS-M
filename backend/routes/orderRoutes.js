const express = require('express');
const router = express.Router();
const { verifyToken, checkAdmin } = require('../middlewares/authMiddleware');
const orderController = require('../controllers/orderController');

router.post('/orders', verifyToken, orderController.placeOrder);
router.get('/orders', verifyToken, orderController.getMyOrders);
router.get('/admin/orders', verifyToken, checkAdmin, orderController.getAdminOrders);
router.get('/orders/track/:orderNumber', verifyToken, orderController.getOrderByNumber);
router.patch('/orders/:id/received', verifyToken, orderController.markOrderReceived);
router.get('/orders/:id', verifyToken, orderController.getOrderById);

module.exports = router;
