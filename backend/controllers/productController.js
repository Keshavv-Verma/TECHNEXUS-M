const { Product, Category, Review } = require('../models');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * GET /api/products
 * Fetch all products with optional search and filtering
 */
const getAllProducts = async (req, res, next) => {
  try {
    const { search, category, categoryId, excludeId, limit, populate } = req.query;
    let query = Product.find({ isActive: { $ne: false } });

    if (categoryId) {
      query = query.where('categoryId').equals(categoryId);
    }

    if (excludeId) {
      query = query.where('_id').ne(excludeId);
    }

    // Filter by category
    if (category) {
      const categoryDoc = await Category.findOne({
        name: new RegExp(`^${category}$`, 'i'),
      });
      if (categoryDoc) {
        query = query.where('categoryId').equals(categoryDoc._id);
      } else {
        return res.json([]);
      }
    }

    // Text search on name and description
    if (search) {
      query = query.where({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      });
    }

    // Always populate category and reviews
    query = query.populate('categoryId', 'name description');

    if (populate) {
      query = query.populate({
        path: 'categoryId',
        select: 'name description',
      });
    }

    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }

    const products = await query.exec();
    res.json(products);
  } catch (error) {
    logger.error('Error fetching products', error.message);
    next(error);
  }
};

/**
 * GET /api/products/category/:category
 * Fetch products by specific category
 */
const getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { populate } = req.query;

    const categoryDoc = await Category.findOne({
      name: new RegExp(`^${category}$`, 'i'),
    });

    if (!categoryDoc) {
      return res.json([]);
    }

    let query = Product.find({ categoryId: categoryDoc._id }).populate(
      'categoryId',
      'name description'
    );

    if (populate) {
      query = query.populate({
        path: 'categoryId',
        select: 'name description',
      });
    }

    const products = await query.exec();
    res.json(products);
  } catch (error) {
    logger.error('Error fetching products by category', error.message);
    next(error);
  }
};

/**
 * GET /api/products/:id
 * Fetch single product by ID with all details
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categoryId', 'name description')
      .populate({
        path: 'reviews',
        populate: {
          path: 'userId',
          select: 'id name',
        },
      });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    logger.error('Product controller error', error.message);
    next(error);
  }
};

/**
 * POST /api/products
 * Create new product (authenticated users)
 */
const createProduct = async (req, res, next) => {
  try {
    if (config.isDevelopment) {
      logger.debug('Create product request', { productId: req.params?.id });
    }

    // First, find or create category
    let category = await Category.findOne({
      name: new RegExp(`^${req.body.category}$`, 'i'),
    });

    if (!category) {
      category = await Category.create({
        name: req.body.category.toUpperCase(),
      });
    }

    const product = await Product.create({
      name: req.body.name,
      price: Number(req.body.price),
      rating: Number(req.body.rating) || 4,
      image: req.body.image,
      description: req.body.description,
      subcategory: req.body.subcategory,
      stock: req.body.stock || 0,
      categoryId: category._id,
      specifications: req.body.specifications || [],
    });

    const populatedProduct = await product.populate('categoryId');

    res.status(201).json(populatedProduct);
  } catch (error) {
    logger.error('Error saving product', error.message);
    next(error);
  }
};

/**
 * PUT /api/products/:id
 * Update product (admin only)
 */
const updateProduct = async (req, res, next) => {
  try {
    logger.debug('Update product request', { id: req.params.id });

    const { name, price, rating, image, description, category, stock, specifications } = req.body;

    // Get the product to find its current category
    const existingProduct = await Product.findById(req.params.id).populate(
      'categoryId'
    );

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // If category is being changed, find or create new category
    let categoryId = existingProduct.categoryId._id;
    if (category && category.toUpperCase() !== existingProduct.categoryId.name) {
      let newCategory = await Category.findOne({
        name: new RegExp(`^${category}$`, 'i'),
      });

      if (!newCategory) {
        newCategory = await Category.create({
          name: category.toUpperCase(),
        });
      }
      categoryId = newCategory._id;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: name || existingProduct.name,
        price: price ? Number(price) : existingProduct.price,
        rating: rating ? Number(rating) : existingProduct.rating,
        image: image || existingProduct.image,
        description: description || existingProduct.description,
        stock: stock ? Number(stock) : existingProduct.stock,
        specifications: specifications || existingProduct.specifications,
        categoryId: categoryId,
      },
      { new: true }
    ).populate('categoryId');

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    logger.error('Error updating product:', error.message);
    next(error);
  }
};

/**
 * DELETE /api/products/:id
 * Delete product
 */
const deleteProduct = async (req, res, next) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({
      message: 'Product deleted successfully',
      product: deleted,
    });
  } catch (error) {
    logger.error('Error deleting product:', error.message);
    next(error);
  }
};

/**
 * GET /api/categories
 * Fetch all categories or filter by category name
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    logger.error('Error fetching categories', error.message);
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
};
