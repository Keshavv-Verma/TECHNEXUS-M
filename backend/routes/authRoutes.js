const express = require('express');
const router = express.Router();
const { 
  signup, 
  login, 
  refreshToken, 
  logout, 
  changePassword, 
  resetPassword 
} = require('../controllers/authController');
const { verifyToken, checkAdmin } = require('../middlewares/authMiddleware');

// Public Authentication routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Protected Authentication routes
router.post('/change-password', verifyToken, changePassword);
router.post('/admin/reset-password', verifyToken, checkAdmin, resetPassword);

module.exports = router;
