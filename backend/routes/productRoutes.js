const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} = require('../controllers/productController');
const { verifyToken, checkAdmin } = require('../middlewares/authMiddleware');

// Public routes
router.get('/products', getAllProducts);
router.get('/products/category/:category', getProductsByCategory);
router.get('/products/:id', getProductById);
router.get('/categories', getCategories);
router.get('/api/products', getAllProducts);
router.get('/api/products/:id', getProductById);
router.get('/api/products/category/:category', getProductsByCategory);

// Admin-only write routes
router.post('/products', verifyToken, checkAdmin, createProduct);
router.post('/api/products', verifyToken, checkAdmin, createProduct);

// Admin-only routes
router.put('/products/:id', verifyToken, checkAdmin, updateProduct);
router.put('/api/products/:id', verifyToken, checkAdmin, updateProduct);
router.delete('/products/:id', verifyToken, checkAdmin, deleteProduct);
router.delete('/api/products/:id', verifyToken, checkAdmin, deleteProduct);

module.exports = router;
