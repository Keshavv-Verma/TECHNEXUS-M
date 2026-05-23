const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const couponController = require('../controllers/couponController');

router.post('/coupons/validate', verifyToken, couponController.validateCoupon);

module.exports = router;
