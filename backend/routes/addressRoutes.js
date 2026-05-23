const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const addressController = require('../controllers/addressController');

router.get('/addresses', verifyToken, addressController.getAddresses);
router.post('/addresses', verifyToken, addressController.createAddress);
router.put('/addresses/:id', verifyToken, addressController.updateAddress);
router.delete('/addresses/:id', verifyToken, addressController.deleteAddress);
router.patch('/addresses/:id/default', verifyToken, addressController.setDefaultAddress);

module.exports = router;
