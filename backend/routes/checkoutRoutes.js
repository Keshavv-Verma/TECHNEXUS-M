const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const checkoutController = require('../controllers/checkoutController');

router.get('/checkout/config', checkoutController.getCheckoutConfig);
router.post('/checkout/preview', verifyToken, checkoutController.previewCheckout);

module.exports = router;
